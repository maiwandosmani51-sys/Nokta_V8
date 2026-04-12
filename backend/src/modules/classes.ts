import { Router } from 'express';
import mongoose from 'mongoose';
import Joi from 'joi';
import { ClassModel } from '../models/Class';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createResponse, createError } from '../utils/response';
import { paginationSchema } from '../utils/validators';

const router = Router();

const createSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required(),
    classCode: Joi.string().trim().optional(),
    teacher: Joi.string().hex().length(24).required(),
    capacity: Joi.number().min(10).max(120).default(30)
  })
});

async function generateNextClassCode() {
  const year = new Date().getFullYear();
  const prefix = `CLS-${year}-`;
  let index = await ClassModel.countDocuments({ classCode: { $regex: `^${prefix}` } });
  index += 1;

  while (true) {
    const classCode = `CLS-${year}-${String(index).padStart(4, '0')}`;
    const exists = await ClassModel.exists({ classCode });
    if (!exists) return classCode;
    index += 1;
  }
}

router.use(authenticate);

router.post('/', authorize(['super_admin', 'admin', 'teacher']), validate(createSchema), async (req, res, next) => {
  try {
    const clientCode = req.body.classCode?.trim();
    const classCode = clientCode || await generateNextClassCode();

    const existing = await ClassModel.findOne({ classCode });
    if (existing) {
      return res.status(400).json(createError('Class code already exists. Please try again.'));
    }

    const klass = await ClassModel.create({
      name: req.body.name,
      classCode,
      teacher: req.body.teacher,
      capacity: req.body.capacity
    });
    res.status(201).json(createResponse(klass, 'Class created'));
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json(createError(error.message));
    }
    if (error.code === 11000 && error.keyPattern?.classCode) {
      return res.status(400).json(createError('Class code already exists. Please try again.'));
    }
    next(error);
  }
});

router.get('/', authorize(['super_admin', 'admin', 'teacher', 'student', 'family_student']), validate(paginationSchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = String(req.query.search || '').trim();
    const filter: any = {};
    if (search) filter.name = { $regex: search, $options: 'i' };

    if (req.user?.role === 'teacher') {
      filter.teacher = req.user.userId;
    }
    if (req.user?.role === 'student') {
      const currentUser = await User.findById(req.user.userId).lean();
      if ((currentUser as any)?.classId) {
        filter._id = (currentUser as any).classId;
      } else {
        filter._id = null;
      }
    }
    if (req.user?.role === 'family_student') {
      const currentUser = await User.findById(req.user.userId).lean();
      const children = (currentUser as any)?.familyId ? await User.find({ role: 'student', familyId: (currentUser as any).familyId }).select('classId').lean() : [];
      const classIds = children.map((child: any) => child.classId).filter(Boolean);
      filter._id = { $in: classIds };
    }

    const [classes, total] = await Promise.all([
      ClassModel.find(filter).populate('teacher', 'name email role').lean().skip((page - 1) * limit).limit(limit),
      ClassModel.countDocuments(filter)
    ]);
    const formatted = classes.map((klass: any) => ({
      ...klass,
      teacher: klass.teacher?.name ?? '',
      subjectCount: Array.isArray(klass.assignedSubjects) ? klass.assignedSubjects.length : 0
    }));
    res.json(createResponse(formatted, '', { page, limit, total }));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authorize(['super_admin', 'admin', 'teacher', 'student', 'family_student']), async (req, res, next) => {
  try {
    const klass = await ClassModel.findById(req.params.id).populate('teacher', 'name email role').lean();
    if (!klass) return res.status(404).json(createError('Class not found'));
    if (req.user?.role === 'teacher' && (klass as any).teacher?._id?.toString() !== req.user.userId) {
      return res.status(403).json(createError('Access denied'));
    }
    if (req.user?.role === 'student') {
      const currentUser = await User.findById(req.user.userId).lean();
      if (!(currentUser as any)?.classId?.toString() || (klass as any)._id.toString() !== (currentUser as any).classId.toString()) {
        return res.status(403).json(createError('Access denied'));
      }
    }
    if (req.user?.role === 'family_student') {
      const currentUser = await User.findById(req.user.userId).lean();
      const children = (currentUser as any)?.familyId ? await User.find({ role: 'student', familyId: (currentUser as any).familyId }).select('classId').lean() : [];
      const classIds = children.map((child: any) => child.classId?.toString()).filter(Boolean);
      if (!classIds.includes((klass as any)._id.toString())) {
        return res.status(403).json(createError('Access denied'));
      }
    }
    res.json(createResponse(klass));
  } catch (error) {
    next(error);
  }
});

export const classRouter = router;
