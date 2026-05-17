import { Router } from 'express';
import { Request } from 'express';
import Joi from 'joi';
import { User } from '../../models/User';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createResponse, createError } from '../../helpers/response';
import { paginationSchema } from '../../validators/pagination';
import { hashPassword } from '../../utils/password';
import { collectUserPermissions, hasPermission, permissionFromLegacy } from '../../utils/roleHelpers';
import { enterprisePermissions, type PermissionKey } from '../../config/systemMasterRules';

const router = Router();

const createSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(32).required(),
    profileImage: Joi.string().allow('', null).optional(),
    role: Joi.string().valid('super_admin', 'admin', 'teacher', 'student', 'parent', 'owner', 'branch_manager', 'system_automation', 'family_student', 'accountant', 'librarian').required()
  })
});

const updateSchema = Joi.object({
  body: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(4).max(32).optional(),
    profileImage: Joi.string().allow('', null).optional(),
    role: Joi.string().valid('super_admin', 'admin', 'teacher', 'student', 'parent', 'owner', 'branch_manager', 'system_automation', 'family_student', 'accountant', 'librarian'),
    active: Joi.boolean()
  }),
  params: Joi.object({ id: Joi.string().hex().length(24).required() })
});

const permissionsSchema = Joi.object({
  body: Joi.object({
    permissions: Joi.object().pattern(
      Joi.string(),
      Joi.array().items(Joi.string().trim().min(1)).unique()
    ).required()
  }),
  params: Joi.object({ id: Joi.string().hex().length(24).required() })
});

const idParamsSchema = Joi.object({
  params: Joi.object({ id: Joi.string().hex().length(24).required() })
});

router.use(authenticate, authorize(['super_admin', 'admin']));

function requireAccess(req: any, res: any, permission: PermissionKey) {
  if (req.user?.role !== 'super_admin' && !hasPermission(req.user, permission)) {
    res.status(403).json(createError('Forbidden'));
    return false;
  }
  return true;
}

function normalizeEmail(value: string) {
  return String(value || '').trim().toLowerCase();
}

function permissionKeyToLegacy(permission: string) {
  const parts = permission.toLowerCase().split('_');
  const action = parts.pop() ?? 'view';
  return { module: parts.join('_'), action };
}

function permissionKeysToMap(permissionKeys: string[]) {
  return permissionKeys.reduce<Record<string, string[]>>((acc, permission) => {
    const { module, action } = permissionKeyToLegacy(permission);
    acc[module] = Array.from(new Set([...(acc[module] ?? []), action])).sort();
    return acc;
  }, {});
}

function normalizePermissionMap(permissions: Record<string, string[]>) {
  return Object.entries(permissions ?? {}).reduce<Record<string, string[]>>((acc, [moduleKey, actions]) => {
    const validActions = (Array.isArray(actions) ? actions : [])
      .map((action) => String(action).trim().toLowerCase())
      .filter((action) => permissionFromLegacy(moduleKey, action));

    if (validActions.length) {
      acc[moduleKey] = Array.from(new Set(validActions)).sort();
    }

    return acc;
  }, {});
}

function permissionMapToKeys(permissions: Record<string, string[]>) {
  const keys = Object.entries(permissions).flatMap(([moduleKey, actions]) => (
    actions
      .map((action) => permissionFromLegacy(moduleKey, action))
      .filter((permission): permission is PermissionKey => Boolean(permission))
  ));

  return Array.from(new Set(keys));
}

function serializeUser(user: any) {
  const effectivePermissions = collectUserPermissions(user);
  const effectivePermissionKeys = effectivePermissions[0] === '*' ? [...enterprisePermissions] : effectivePermissions;
  return {
    ...user,
    permissions: permissionKeysToMap(effectivePermissionKeys),
    permissionKeys: Array.isArray(user.permissionKeys) ? user.permissionKeys : [],
    revokedPermissionKeys: Array.isArray(user.revokedPermissionKeys) ? user.revokedPermissionKeys : [],
    effectivePermissionKeys
  };
}

router.post('/', validate(createSchema), async (req: Request, res, next) => {
  try {
    if (!requireAccess(req, res, 'USER_CREATE')) return;
    const { name, email, password, role, profileImage } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const exists = await User.findOne({ email: normalizedEmail, isDeleted: false }).lean();
    if (exists) return res.status(409).json(createError('Email already exists'));
    const hashed = await hashPassword(password);
    const user = await User.create({ name, email: normalizedEmail, password: hashed, role, profileImage: profileImage ?? '' });
    res.status(201).json(createResponse({ id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage }, 'User created'));
  } catch (error) {
    next(error);
  }
});

router.get('/', validate(paginationSchema), async (req, res, next) => {
  try {
    if (!requireAccess(req, res, 'USER_VIEW')) return;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = String(req.query.search || '').trim();
    const filter = search
      ? { isDeleted: false, $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : { isDeleted: false };
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').lean().skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter)
    ]);
    res.json(createResponse(users.map(serializeUser), '', { page, limit, total }));
  } catch (error) {
    next(error);
  }
});

router.get('/count', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json(createError('Authentication required'));
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied'));
    }
    const count = await User.countDocuments();
    res.json(createResponse({ count }));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validate(idParamsSchema), async (req, res, next) => {
  try {
    if (!requireAccess(req, res, 'USER_VIEW')) return;
    const user: any = await User.findOne({ _id: req.params.id, isDeleted: false }).select('-password').lean();
    if (!user) return res.status(404).json(createError('User not found'));
    res.json(createResponse(serializeUser(user)));
  } catch (error) {
    next(error);
  }
});

const updateUserHandler = async (req: Request, res: any, next: any) => {
  try {
    if (!requireAccess(req, res, 'USER_UPDATE')) return;
    if (req.body.email) {
      const normalizedEmail = normalizeEmail(req.body.email);
      const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: req.params.id }, isDeleted: false }).lean();
      if (existingUser) {
        return res.status(409).json(createError('Email already exists'));
      }
      req.body.email = normalizedEmail;
    }
    const updatePayload = { ...req.body };
    if (updatePayload.password) {
      updatePayload.password = await hashPassword(updatePayload.password);
    } else {
      delete updatePayload.password;
    }

    const user: any = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updatePayload,
      { new: true, runValidators: true }
    ).select('-password').lean();
    if (!user) return res.status(404).json(createError('User not found'));
    res.json(createResponse(serializeUser(user), 'User updated'));
  } catch (error) {
    next(error);
  }
};

router.patch('/:id', validate(updateSchema), updateUserHandler);
router.put('/:id', validate(updateSchema), updateUserHandler);

router.put('/:id/permissions', validate(permissionsSchema), async (req, res, next) => {
  try {
    if (!requireAccess(req, res, 'PERMISSION_MANAGE')) return;
    const permissions = normalizePermissionMap(req.body.permissions);
    const selectedPermissionKeys = permissionMapToKeys(permissions);
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) return res.status(404).json(createError('User not found'));
    user.permissions = permissions;
    user.permissionKeys = selectedPermissionKeys;
    user.revokedPermissionKeys = enterprisePermissions.filter((permission) => !selectedPermissionKeys.includes(permission));
    await user.save();
    const current = await User.findOne({ _id: req.params.id, isDeleted: false }).select('-password').lean();
    res.json(createResponse(serializeUser(current), 'User permissions updated'));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', validate(idParamsSchema), async (req, res, next) => {
  try {
    if (!requireAccess(req, res, 'USER_DELETE')) return;
    const user = await User.findByIdAndDelete(req.params.id).lean();
    if (!user) return res.status(404).json(createError('User not found'));
    res.json(createResponse({}, 'User deleted'));
  } catch (error) {
    next(error);
  }
});

export const userRouter = router;
