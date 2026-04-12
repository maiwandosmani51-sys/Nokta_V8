import { Router } from 'express';
import Joi from 'joi';
import { Result } from '../models/Result';
import { User } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createResponse, createError } from '../utils/response';
import { paginationSchema } from '../utils/validators';

const router = Router();
const resultSchema = Joi.object({
  body: Joi.object({
    student: Joi.string().hex().length(24).required(),
    exam: Joi.string().hex().length(24).required(),
    score: Joi.number().min(0).required(),
    gradedBy: Joi.string().hex().length(24).optional()
  })
});

router.use(authenticate);

router.post('/', authorize(['super_admin', 'admin', 'teacher']), validate(resultSchema), async (req, res, next) => {
  try {
    const result = await Result.create(req.body);
    res.status(201).json(createResponse(result, 'Result created'));
  } catch (error) {
    next(error);
  }
});

router.get('/', authorize(['super_admin', 'admin', 'teacher', 'student', 'family_student']), validate(paginationSchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = String(req.query.search || '').trim();
    const filter: any = {};
    if (search) filter.score = { $gte: Number(search) || 0 };

    if (req.user?.role === 'student') {
      filter.student = req.user.userId;
    }
    if (req.user?.role === 'family_student') {
      const familyUser = await User.findById(req.user.userId).lean();
      const children = (familyUser as any)?.familyId ? await User.find({ role: 'student', familyId: (familyUser as any).familyId }).select('_id').lean() : [];
      filter.student = { $in: children.map((child: any) => child._id) };
    }
    if (req.user?.role === 'teacher') {
      const students = await User.find({ role: 'student', teacherId: req.user.userId }).select('_id').lean();
      filter.student = { $in: students.map((student: any) => student._id) };
    }

    const [results, total] = await Promise.all([
      Result.find(filter).populate('student', 'name email teacherId familyId').populate('exam', 'title date').lean().skip((page - 1) * limit).limit(limit),
      Result.countDocuments(filter)
    ]);
    res.json(createResponse(results, '', { page, limit, total }));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authorize(['super_admin', 'admin', 'teacher', 'student', 'family_student']), async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id).populate('student', 'name email familyId teacherId').populate('exam', 'title date').lean();
    if (!result) return res.status(404).json(createError('Result not found'));
    if (req.user?.role === 'student' && (result as any).student._id.toString() !== req.user.userId) {
      return res.status(403).json(createError('Access denied'));
    }
    if (req.user?.role === 'family_student') {
      const familyUser = await User.findById(req.user.userId).lean();
      if (!(familyUser as any)?.familyId || (result as any).student.familyId?.toString() !== (familyUser as any).familyId.toString()) {
        return res.status(403).json(createError('Access denied'));
      }
    }
    if (req.user?.role === 'teacher') {
      if ((result as any).student.teacherId?.toString() !== req.user.userId) {
        return res.status(403).json(createError('Access denied'));
      }
    }
    res.json(createResponse(result));
  } catch (error) {
    next(error);
  }
});

export const resultRouter = router;
