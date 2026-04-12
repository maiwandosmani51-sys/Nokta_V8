import { Router } from 'express';
import Joi from 'joi';
import { ClassModel } from '../models/Class';
import { Subject } from '../models/Subject';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createResponse, createError } from '../utils/response';
import { paginationSchema } from '../utils/validators';

const router = Router();
const subjectSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().required(),
    code: Joi.string().required(),
    classId: Joi.string().hex().length(24).required(),
    feeAmount: Joi.number().min(0).required(),
    teacher: Joi.string().hex().length(24).required(),
    description: Joi.string().allow('', null)
  })
});

router.use(authenticate);

router.post('/', authorize(['super_admin', 'admin', 'teacher']), validate(subjectSchema), async (req, res, next) => {
  try {
    const payload: any = {
      title: req.body.title,
      code: req.body.code,
      classId: req.body.classId,
      feeAmount: req.body.feeAmount,
      teacher: req.body.teacher,
      description: req.body.description
    };

    const subject = await Subject.create(payload);
    await ClassModel.findByIdAndUpdate(req.body.classId, {
      $addToSet: { assignedSubjects: subject._id }
    });

    res.status(201).json(createResponse(subject, 'Subject created'));
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
    if (search) filter.title = { $regex: search, $options: 'i' };
    const [subjects, total] = await Promise.all([
      Subject.find(filter).populate('teacher', 'name email').populate('classId', 'name classCode').lean().skip((page - 1) * limit).limit(limit),
      Subject.countDocuments(filter)
    ]);
    const formatted = subjects.map((subject: any) => ({
      ...subject,
      teacher: subject.teacher?.name ?? '',
      className: subject.classId?.name ?? ''
    }));
    res.json(createResponse(formatted, '', { page, limit, total }));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authorize(['super_admin', 'admin', 'teacher', 'student', 'family_student']), async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('teacher', 'name email').lean();
    if (!subject) return res.status(404).json(createError('Subject not found'));
    res.json(createResponse(subject));
  } catch (error) {
    next(error);
  }
});

export const subjectRouter = router;
