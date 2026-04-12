import { Router } from 'express';
import Joi from 'joi';
import { Family } from '../models/Family';
import { User } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createResponse, createError } from '../utils/response';
import { paginationSchema } from '../utils/validators';

const router = Router();
const familySchema = Joi.object({
  body: Joi.object({
    guardianName: Joi.string().required(),
    guardianEmail: Joi.string().email().required(),
    guardianPhone: Joi.string().required(),
    students: Joi.array().items(Joi.string().hex().length(24)).default([]),
    notes: Joi.string().allow('', null)
  })
});

router.use(authenticate);

router.post('/', authorize(['super_admin', 'admin', 'teacher']), validate(familySchema), async (req, res, next) => {
  try {
    const family = await Family.create(req.body);
    res.status(201).json(createResponse(family, 'Family created'));
  } catch (error) {
    next(error);
  }
});

router.get('/', authorize(['super_admin', 'admin', 'teacher', 'family_student']), validate(paginationSchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = String(req.query.search || '').trim();
    const filter: any = {};
    if (search) filter.guardianName = { $regex: search, $options: 'i' };

    if (req.user?.role === 'family_student') {
      const currentUser = await User.findById(req.user.userId).lean();
      if (!(currentUser as any)?.familyId) {
        return res.json(createResponse([], '', { page, limit, total: 0 }));
      }
      filter._id = (currentUser as any).familyId;
    }

    const [families, total] = await Promise.all([
      Family.find(filter).lean().skip((page - 1) * limit).limit(limit),
      Family.countDocuments(filter)
    ]);
    res.json(createResponse(families, '', { page, limit, total }));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authorize(['super_admin', 'admin', 'teacher', 'family_student']), async (req, res, next) => {
  try {
    const family = await Family.findById(req.params.id).lean();
    if (!family) return res.status(404).json(createError('Family not found'));
    if (req.user?.role === 'family_student') {
      const currentUser = await User.findById(req.user.userId).lean();
      if (!(currentUser as any)?.familyId?.toString() || (family as any)._id.toString() !== (currentUser as any).familyId.toString()) {
        return res.status(403).json(createError('Access denied'));
      }
    }
    res.json(createResponse(family));
  } catch (error) {
    next(error);
  }
});

export const familyRouter = router;
