import { Router } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createResponse, createError } from '../utils/response';
import { paginationSchema } from '../utils/validators';

const router = Router();

const createSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('super_admin','admin','teacher','student','family_student','accountant','librarian').required()
  })
});

const updateSchema = Joi.object({
  body: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    role: Joi.string().valid('super_admin','admin','teacher','student','family_student','accountant','librarian'),
    active: Joi.boolean()
  }),
  params: Joi.object({ id: Joi.string().hex().length(24).required() })
});

const permissionsSchema = Joi.object({
  body: Joi.object({
    permissions: Joi.object().pattern(
      Joi.string(),
      Joi.array().items(Joi.string().valid('create', 'read', 'update', 'delete')).unique()
    ).required()
  }),
  params: Joi.object({ id: Joi.string().hex().length(24).required() })
});

router.use(authenticate, authorize(['super_admin', 'admin']));

function requireSuperAdmin(req: any, res: any) {
  if (req.user?.role !== 'super_admin') {
    res.status(403).json(createError('Forbidden'));
    return false;
  }
  return true;
}

router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    if (!requireSuperAdmin(req, res)) return;
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email }).lean();
    if (exists) return res.status(409).json(createError('Email already exists'));
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json(createResponse({ id: user._id, name: user.name, email: user.email, role: user.role }, 'User created'));
  } catch (error) {
    next(error);
  }
});

router.get('/', validate(paginationSchema), async (req, res, next) => {
  try {
    if (!requireSuperAdmin(req, res)) return;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = String(req.query.search || '').trim();
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').lean().skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter)
    ]);
    res.json(createResponse(users, '', { page, limit, total }));
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

router.get('/:id', async (req, res, next) => {
  try {
    if (!requireSuperAdmin(req, res)) return;
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) return res.status(404).json(createError('User not found'));
    res.json(createResponse(user));
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', validate(updateSchema), async (req, res, next) => {
  try {
    if (!requireSuperAdmin(req, res)) return;
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password').lean();
    if (!user) return res.status(404).json(createError('User not found'));
    res.json(createResponse(user, 'User updated'));
  } catch (error) {
    next(error);
  }
});

router.put('/:id/permissions', validate(permissionsSchema), async (req, res, next) => {
  try {
    if (!requireSuperAdmin(req, res)) return;
    const { permissions } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json(createError('User not found'));
    user.permissions = permissions;
    await user.save();
    const current = await User.findById(req.params.id).select('-password').lean();
    res.json(createResponse(current, 'User permissions updated'));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!requireSuperAdmin(req, res)) return;
    const user = await User.findByIdAndDelete(req.params.id).lean();
    if (!user) return res.status(404).json(createError('User not found'));
    res.json(createResponse({}, 'User deleted'));
  } catch (error) {
    next(error);
  }
});

router.get('/count', authorize(['super_admin', 'admin']), async (req, res) => {
  const count = await User.countDocuments();
  res.json({ count });
});

export const userRouter = router;
