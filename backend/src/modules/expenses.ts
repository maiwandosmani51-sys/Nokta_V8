import { Router } from 'express';
import Joi from 'joi';
import { Expense } from '../models/Expense';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createResponse, createError } from '../utils/response';
import { paginationSchema } from '../utils/validators';

const router = Router();
const expenseSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().required(),
    amount: Joi.number().positive().required(),
    category: Joi.string().required(),
    date: Joi.date().optional(),
    notes: Joi.string().allow('', null)
  })
});

router.use(authenticate, authorize(['super_admin', 'admin', 'accountant']));

router.post('/', validate(expenseSchema), async (req, res, next) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(createResponse(expense, 'Expense recorded'));
  } catch (error) {
    next(error);
  }
});

router.get('/', validate(paginationSchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const [expenses, total] = await Promise.all([
      Expense.find().lean().skip((page - 1) * limit).limit(limit),
      Expense.countDocuments()
    ]);
    res.json(createResponse(expenses, '', { page, limit, total }));
  } catch (error) {
    next(error);
  }
});

export const expenseRouter = router;
