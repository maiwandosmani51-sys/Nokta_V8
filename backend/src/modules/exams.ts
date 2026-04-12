import { Router } from 'express';
import Joi from 'joi';
import { Exam } from '../models/Exam';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createResponse, createError } from '../utils/response';
import { paginationSchema } from '../utils/validators';

const router = Router();
const examSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    date: Joi.date().required(),
    totalMarks: Joi.number().min(1).default(100)
  })
});

router.use(authenticate, authorize(['super_admin', 'admin', 'teacher']));

router.post('/', validate(examSchema), async (req, res, next) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json(createResponse(exam, 'Exam created'));
  } catch (error) {
    next(error);
  }
});

router.get('/', validate(paginationSchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = String(req.query.search || '').trim();
    const filter: any = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    const [exams, total] = await Promise.all([
      Exam.find(filter).populate('subject', 'title').populate('class', 'name').lean().skip((page - 1) * limit).limit(limit),
      Exam.countDocuments(filter)
    ]);
    res.json(createResponse(exams, '', { page, limit, total }));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('subject', 'title').populate('class', 'name').lean();
    if (!exam) return res.status(404).json(createError('Exam not found'));
    res.json(createResponse(exam));
  } catch (error) {
    next(error);
  }
});

export const examRouter = router;
