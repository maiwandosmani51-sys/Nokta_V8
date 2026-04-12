import { Router } from 'express';
import Joi from 'joi';
import { Expense } from '../models/Expense';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createResponse } from '../utils/response';
import { paginationSchema } from '../utils/validators';

const router = Router();
const financeSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().required(),
    amount: Joi.number().positive().required(),
    category: Joi.string().required(),
    date: Joi.date().optional(),
    notes: Joi.string().allow('', null)
  })
});

function buildMonths(start: Date, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });
}

router.use(authenticate, authorize(['super_admin', 'admin', 'accountant']));

router.get('/summary', async (req, res, next) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);

    const [expenseTotals, incomeTotals, monthlyStats, expenseCategories] = await Promise.all([
      Expense.aggregate([
        { $match: { category: { $ne: 'income' } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { category: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              category: '$category'
            },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Expense.aggregate([
        { $match: { category: { $ne: 'income' } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } }
      ])
    ]);

    const months = buildMonths(startDate, 6);
    const monthlyFinances = months.map((month) => {
      const incomeEntry = monthlyStats.find(
        (entry: any) => entry._id.year === month.year && entry._id.month === month.month && entry._id.category === 'income'
      );
      const expensesTotal = monthlyStats
        .filter(
          (entry: any) => entry._id.year === month.year && entry._id.month === month.month && entry._id.category !== 'income'
        )
        .reduce((sum: number, entry: any) => sum + entry.total, 0);
      return {
        year: month.year,
        month: month.month,
        income: incomeEntry?.total ?? 0,
        expenses: expensesTotal
      };
    });

    res.json(createResponse({
      expenses: expenseTotals[0]?.total ?? 0,
      totalExpenses: expenseTotals[0]?.total ?? 0,
      totalIncome: incomeTotals[0]?.total ?? 0,
      monthlyFinances,
      expenseCategoryBreakdown: expenseCategories.map((item: any) => ({ category: item._id, total: item.total }))
    }));
  } catch (error) {
    next(error);
  }
});

router.post('/income', validate(financeSchema), async (req, res, next) => {
  try {
    const income = await Expense.create({ ...req.body, category: 'income' });
    res.status(201).json(createResponse(income, 'Income recorded'));
  } catch (error) {
    next(error);
  }
});

router.get('/', validate(paginationSchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const filter: any = {};
    const [items, total] = await Promise.all([
      Expense.find(filter).lean().skip((page - 1) * limit).limit(limit),
      Expense.countDocuments(filter)
    ]);
    res.json(createResponse(items, '', { page, limit, total }));
  } catch (error) {
    next(error);
  }
});

export const financeRouter = router;
