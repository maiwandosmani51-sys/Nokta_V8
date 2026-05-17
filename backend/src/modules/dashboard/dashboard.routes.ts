import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize } from '../../middlewares/auth';
import { createResponse } from '../../helpers/response';
import { AuditLog } from '../../models/AuditLog';
import { Book } from '../../models/Book';
import { Branch } from '../../models/Branch';
import { ClassModel } from '../../models/Class';
import { Attendance } from '../../models/Attendance';
import { Expense } from '../../models/Expense';
import { Family } from '../../models/Family';
import { FinanceEntry } from '../../models/FinanceEntry';
import { Notification } from '../../models/Notification';
import { Payment } from '../../models/Payment';
import { Report } from '../../models/Report';
import { Result } from '../../models/Result';
import { Role } from '../../models/Role';
import { Subject } from '../../models/Subject';
import { Student } from '../../models/Student';
import { User } from '../../models/User';
import { Exam } from '../../models/Exam';

const router = Router();

router.use(authenticate, authorize(['super_admin', 'admin', 'branch_manager', 'teacher', 'accountant', 'librarian', 'student', 'family_student', 'parent', 'owner']));

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
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
    const months = buildTrendMonths(startDate, 6);
    const role = req.user?.canonicalRole ?? req.user?.role;
    const userId = req.user?.userId;
    const branchId = req.user?.branchId;
    const isTeacher = role === 'teacher';
    const isStudent = role === 'student';
    const isFamily = role === 'parent' || role === 'family_student' || role === 'family';
    const isBranchScoped = role === 'branch_manager' && branchId;
    const canViewFinance = ['super_admin', 'admin', 'owner', 'branch_manager', 'accountant'].includes(String(role));

    const branchObjectId = branchId && mongoose.Types.ObjectId.isValid(branchId)
      ? new mongoose.Types.ObjectId(branchId)
      : null;
    const branchFilter = isBranchScoped && branchObjectId ? { branchId: branchObjectId } : {};
    const studentFilter: Record<string, any> = { isDeleted: false, ...branchFilter };
    const teacherFilter: Record<string, any> = { role: 'teacher', isDeleted: false, ...branchFilter };
    const classFilter: Record<string, any> = { isDeleted: false, ...branchFilter };
    const subjectFilter: Record<string, any> = { isDeleted: false, ...branchFilter };
    const notificationFilter: Record<string, any> = { isDeleted: false, ...branchFilter };
    const paymentFilter: Record<string, any> = { isDeleted: false, ...branchFilter };
    const financeEntryFilter: Record<string, any> = { isDeleted: false, ...branchFilter };
    const expenseFilter: Record<string, any> = { isDeleted: false, category: { $ne: 'income' }, ...branchFilter };
    const resultFilter: Record<string, any> = { isDeleted: false };

    if (isTeacher && userId) {
      studentFilter.teacherId = userId;
      teacherFilter._id = userId;
      classFilter.assignedTeachers = userId;
      subjectFilter.teacher = userId;
      resultFilter.gradedBy = userId;
    }

    if (isStudent && userId) {
      const currentUser = await User.findById(userId).select('studentId classId subjectId assignedTeacherId').lean<Record<string, any>>();
      const studentRecord = currentUser?.studentId
        ? await Student.findOne({ studentId: currentUser.studentId, isDeleted: false }).select('_id classId subjectId teacherId remainingBalance').lean<Record<string, any>>()
        : null;
      studentFilter._id = studentRecord?._id ? studentRecord._id : { $in: [] };
      classFilter._id = studentRecord?.classId ?? currentUser?.classId ?? { $in: [] };
      subjectFilter._id = studentRecord?.subjectId ?? currentUser?.subjectId ?? { $in: [] };
      teacherFilter._id = studentRecord?.teacherId ?? currentUser?.assignedTeacherId ?? { $in: [] };
      resultFilter.student = userId;
      paymentFilter.studentId = studentRecord?._id ? studentRecord._id : { $in: [] };
    }

    if (isFamily && userId) {
      const familyUser = await User.findById(userId).select('familyId parentProfileId').lean<Record<string, any>>();
      const familyStudents = await Student.find({
        isDeleted: false,
        ...(familyUser?.familyId ? { familyId: familyUser.familyId } : {}),
        ...(!familyUser?.familyId && familyUser?.parentProfileId ? { parentProfileId: familyUser.parentProfileId } : {})
      }).select('_id studentId classId subjectId teacherId').lean<Record<string, any>[]>();
      const studentIds = familyStudents.map((student) => student._id);
      studentFilter._id = { $in: studentIds };
      classFilter._id = { $in: familyStudents.map((student) => student.classId).filter(Boolean) };
      subjectFilter._id = { $in: familyStudents.map((student) => student.subjectId).filter(Boolean) };
      teacherFilter._id = { $in: familyStudents.map((student) => student.teacherId).filter(Boolean) };
      const studentUsers = await User.find({
        role: 'student',
        isDeleted: false,
        studentId: { $in: familyStudents.map((student: any) => student.studentId).filter(Boolean) }
      }).select('_id').lean<Record<string, any>[]>();
      resultFilter.student = { $in: studentUsers.map((student) => student._id) };
      paymentFilter.studentId = { $in: studentIds };
    }

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      totalBranches,
      totalBooks,
      totalNotifications,
      totalUsers,
      totalFamilies,
      paymentTotals,
      manualIncomeTotals,
      expenseTotals,
      studentBalance,
      totalAuditLogs,
      studentTrend,
      teacherTrend,
      monthlyPayments,
      monthlyManualIncome,
      monthlyExpenses,
      expenseCategoryBreakdown
    ] = await Promise.all([
      Student.countDocuments(studentFilter),
      User.countDocuments(teacherFilter),
      ClassModel.countDocuments(classFilter),
      Subject.countDocuments(subjectFilter),
      isBranchScoped && branchObjectId ? Branch.countDocuments({ _id: branchObjectId, isDeleted: false }) : Branch.countDocuments({ isDeleted: false }),
      Book.countDocuments({ isDeleted: false }),
      Notification.countDocuments(notificationFilter),
      isTeacher || isStudent || isFamily ? 1 : User.countDocuments({ isDeleted: false, ...branchFilter }),
      Family.countDocuments({ isDeleted: false }),
      canViewFinance ? Payment.aggregate([{ $match: paymentFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]) : Promise.resolve([]),
      canViewFinance ? FinanceEntry.aggregate([{ $match: financeEntryFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]) : Promise.resolve([]),
      canViewFinance ? Expense.aggregate([{ $match: expenseFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]) : Promise.resolve([]),
      Student.aggregate([{ $match: studentFilter }, { $group: { _id: null, total: { $sum: '$remainingBalance' } } }]),
      AuditLog.countDocuments({ isDeleted: false }),
      Student.aggregate([
        { $match: { ...studentFilter, createdAt: { $gte: startDate } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      User.aggregate([
        { $match: { ...teacherFilter, createdAt: { $gte: startDate } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      canViewFinance ? Payment.aggregate([
        { $match: { ...paymentFilter, paymentDate: { $gte: startDate } } },
        { $group: { _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } }, total: { $sum: '$amount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]) : Promise.resolve([]),
      canViewFinance ? FinanceEntry.aggregate([
        { $match: { ...financeEntryFilter, date: { $gte: startDate } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]) : Promise.resolve([]),
      canViewFinance ? Expense.aggregate([
        { $match: { ...expenseFilter, date: { $gte: startDate } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]) : Promise.resolve([]),
      canViewFinance ? Expense.aggregate([
        { $match: expenseFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 6 }
      ]) : Promise.resolve([])
    ]);

    const enrollmentTrend = months.map((month) => ({
      year: month.year,
      month: month.month,
      students:
        studentTrend.find((entry: { _id: { year: number; month: number }; total: number }) => entry._id.year === month.year && entry._id.month === month.month)?.total ?? 0,
      teachers:
        teacherTrend.find((entry: { _id: { year: number; month: number }; total: number }) => entry._id.year === month.year && entry._id.month === month.month)?.total ?? 0
    }));

    const monthlyFinances = months.map((month) => ({
      year: month.year,
      month: month.month,
      income:
        (monthlyPayments.find((entry: { _id: { year: number; month: number }; total: number }) => entry._id.year === month.year && entry._id.month === month.month)?.total ?? 0) +
        (monthlyManualIncome.find((entry: { _id: { year: number; month: number }; total: number }) => entry._id.year === month.year && entry._id.month === month.month)?.total ?? 0),
      expenses:
        monthlyExpenses.find((entry: { _id: { year: number; month: number }; total: number }) => entry._id.year === month.year && entry._id.month === month.month)?.total ?? 0
    }));

    res.json(createResponse({
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      totalBranches,
      totalBooks,
      totalNotifications,
      totalUsers,
      totalFamilies,
      incomeTotal: (paymentTotals[0]?.total ?? 0) + (manualIncomeTotals[0]?.total ?? 0),
      expenseTotal: expenseTotals[0]?.total ?? 0,
      outstandingBalance: studentBalance[0]?.total ?? 0,
      totalAuditLogs,
      enrollmentTrend,
      monthlyFinances,
      expenseCategoryBreakdown: expenseCategoryBreakdown.map((entry: { _id: string; total: number }) => ({
        category: entry._id,
        total: entry.total
      }))
    }));
  } catch (error) {
    next(error);
  }
});

router.get('/master-summary', authorize(['super_admin']), async (_req, res, next) => {
  try {
    const [
      users,
      students,
      teachers,
      classes,
      subjects,
      attendance,
      exams,
      results,
      payments,
      financeEntries,
      expenses,
      reports,
      branches,
      notifications,
      auditLogs,
      roles
    ] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      Student.countDocuments({ isDeleted: false }),
      User.countDocuments({ role: 'teacher', isDeleted: false }),
      ClassModel.countDocuments({ isDeleted: false }),
      Subject.countDocuments({ isDeleted: false }),
      Attendance.countDocuments({ isDeleted: false }),
      Exam.countDocuments({ isDeleted: false }),
      Result.countDocuments({ isDeleted: false }),
      Payment.countDocuments({ isDeleted: false }),
      FinanceEntry.countDocuments({ isDeleted: false }),
      Expense.countDocuments({ isDeleted: false, category: { $ne: 'income' } }),
      Report.countDocuments({ isDeleted: false }),
      Branch.countDocuments({ isDeleted: false }),
      Notification.countDocuments({ isDeleted: false }),
      AuditLog.countDocuments({ isDeleted: false }),
      Role.countDocuments({ isDeleted: false })
    ]);

    res.json(createResponse({
      users,
      students,
      teachers,
      classes,
      subjects,
      attendance,
      exams,
      results,
      payments,
      finance: financeEntries,
      expenses,
      reports,
      branches,
      notifications,
      audit: auditLogs,
      roles
    }));
  } catch (error) {
    next(error);
  }
});

export const dashboardRouter = router;
