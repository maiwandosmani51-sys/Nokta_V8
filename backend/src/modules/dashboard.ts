import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createResponse } from '../utils/response';
import { User } from '../models/User';
import { ClassModel } from '../models/Class';
import { Subject } from '../models/Subject';
import { Book } from '../models/Book';
import { Expense } from '../models/Expense';
import { Notification } from '../models/Notification';
import { Exam } from '../models/Exam';
import { Result } from '../models/Result';
import { Family } from '../models/Family';
import { AuditLog } from '../models/AuditLog';

const router = Router();

router.use(authenticate, authorize(['super_admin', 'admin', 'teacher', 'accountant', 'librarian', 'student', 'family_student']));

function buildTrendMonths(start: Date, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const monthDate = new Date(start.getFullYear(), start.getMonth() + index, 1);
    return {
      year: monthDate.getFullYear(),
      month: monthDate.getMonth() + 1
    };
  });
}

router.get('/summary', async (req, res, next) => {
  try {
    const [
      students, teachers, classes, subjects, books, expenses, notifications,
      exams, results, families, auditLogs, users, expenseCount
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      ClassModel.countDocuments(),
      Subject.countDocuments(),
      Book.countDocuments(),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Notification.countDocuments(),
      Exam.countDocuments(),
      Result.countDocuments(),
      Family.countDocuments(),
      AuditLog.countDocuments(),
      User.countDocuments(),
      Expense.countDocuments()
    ]);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
    const months = buildTrendMonths(startDate, 6);

    const [studentTrend, teacherTrend] = await Promise.all([
      User.aggregate([
        { $match: { role: 'student', createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            total: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      User.aggregate([
        { $match: { role: 'teacher', createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            total: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const enrollmentTrend = months.map((month) => ({
      year: month.year,
      month: month.month,
      students: studentTrend.find(
        (entry: any) => entry._id.year === month.year && entry._id.month === month.month
      )?.total ?? 0,
      teachers: teacherTrend.find(
        (entry: any) => entry._id.year === month.year && entry._id.month === month.month
      )?.total ?? 0
    }));

    res.json(createResponse({
      students,
      teachers,
      classes,
      subjects,
      books,
      totalUsers: users,
      expenses: expenseCount,
      finance: expenses[0]?.total ?? 0,
      notifications,
      exams,
      results,
      families,
      auditLogs,
      enrollmentTrend
    }));
  } catch (error) {
    next(error);
  }
});

export const dashboardRouter = router;
