import { Router } from 'express';
import Joi from 'joi';
import { Result } from '../../models/Result';
import { Student } from '../../models/Student';
import { User } from '../../models/User';
import { Exam } from '../../models/Exam';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createResponse, createError } from '../../helpers/response';

const router = Router();

const resultSchema = Joi.object({
  body: Joi.object({
    student: Joi.string().hex().length(24).required(),
    exam: Joi.string().hex().length(24).required(),
    score: Joi.number().min(0).required(),
    remarks: Joi.string().allow('', null).optional(),
    gradedBy: Joi.string().hex().length(24).optional()
  })
});

const resultQuerySchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().allow('', null).optional(),
    lang: Joi.string().valid('en', 'fa', 'ps').optional()
  })
});

function deriveGrade(score: number, totalMarks: number) {
  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
}

function buildAcademicRecommendation(result: any, language = 'en') {
  const score = Number(result?.score || 0);
  const totalMarks = Number(result?.exam?.totalMarks || 100);
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const subjectName = result?.exam?.subject?.title || 'this subject';
  const weak = percentage < 60;
  const strong = percentage >= 85;

  const copy: Record<string, any> = {
    en: {
      weakTitle: 'Improvement plan recommended',
      strongTitle: 'Excellent achievement',
      steadyTitle: 'Keep building mastery',
      weakMessage: `Focus on ${subjectName}. Review short lessons, solve daily practice questions, and ask your teacher for a two-week support plan.`,
      strongMessage: `Congratulations on a strong ${subjectName} result. Keep reviewing advanced exercises and help strengthen your long-term mastery.`,
      steadyMessage: `Your ${subjectName} progress is developing. Continue weekly revision, practice past questions, and track mistakes after each study session.`,
      resources: ['Teacher lesson notes', 'Short educational videos', 'Practice worksheets', 'Reference book chapter', 'PDF revision guide']
    },
    fa: {
      weakTitle: 'برنامه بهبود پیشنهاد می‌شود',
      strongTitle: 'دستاورد عالی',
      steadyTitle: 'تسلط خود را ادامه دهید',
      weakMessage: `روی ${subjectName} تمرکز کنید. درس‌های کوتاه را مرور کنید، تمرین روزانه حل کنید و از معلم برنامه حمایتی دوهفته‌ای بخواهید.`,
      strongMessage: `برای نتیجه عالی در ${subjectName} تبریک می‌گوییم. تمرین‌های پیشرفته را ادامه دهید و تسلط درازمدت خود را تقویت کنید.`,
      steadyMessage: `پیشرفت شما در ${subjectName} در حال رشد است. مرور هفتگی، تمرین سوالات گذشته و بررسی اشتباهات را ادامه دهید.`,
      resources: ['یادداشت‌های درسی معلم', 'ویدیوهای آموزشی کوتاه', 'تمرین‌های عملی', 'فصل کتاب مرجع', 'راهنمای مرور PDF']
    },
    ps: {
      weakTitle: 'د ښه والي پلان سپارښتنه کېږي',
      strongTitle: 'غوره لاسته راوړنه',
      steadyTitle: 'خپله پوهه نوره هم پیاوړې کړئ',
      weakMessage: `پر ${subjectName} تمرکز وکړئ. لنډ درسونه تکرار کړئ، ورځنۍ پوښتنې حل کړئ او له ښوونکي څخه دوه اونیز ملاتړ پلان وغواړئ.`,
      strongMessage: `په ${subjectName} کې د غوره پایلې مبارکي. پرمختللي تمرینونه دوام ورکړئ او خپله اوږدمهاله پوهه پیاوړې کړئ.`,
      steadyMessage: `په ${subjectName} کې ستاسو پرمختګ روان دی. اونیز تکرار، پخوانۍ پوښتنې او د تېروتنو څارنه دوام ورکړئ.`,
      resources: ['د ښوونکي درسي یادښتونه', 'لنډې ښوونیزې ویډیوګانې', 'تمرین پاڼې', 'د مرجع کتاب فصل', 'PDF تکراري لارښود']
    }
  };

  const selected = copy[language] ?? copy.en;

  return {
    percentage,
    status: weak ? 'needs_support' : strong ? 'excellent' : 'progressing',
    title: weak ? selected.weakTitle : strong ? selected.strongTitle : selected.steadyTitle,
    message: weak ? selected.weakMessage : strong ? selected.strongMessage : selected.steadyMessage,
    resources: selected.resources,
    studyPlan: weak
      ? ['Review core lesson', 'Practice 20 minutes daily', 'Complete teacher feedback', 'Retake weak-topic quiz']
      : ['Maintain weekly revision', 'Practice advanced questions', 'Track next exam target']
  };
}

async function resolveStudentContext(studentIdentifier: string) {
  const directUser = await User.findOne({ _id: studentIdentifier, role: 'student', isDeleted: false }).lean<any>();
  if (directUser) {
    const studentRecord = directUser.studentId
      ? await Student.findOne({ studentId: directUser.studentId, isDeleted: false }).lean<any>()
      : null;

    return {
      studentUser: directUser,
      studentRecord
    };
  }

  const studentRecord = await Student.findOne({ _id: studentIdentifier, isDeleted: false }).lean<any>();
  if (!studentRecord) {
    return null;
  }

  const linkedUser = await User.findOne({ studentId: studentRecord.studentId, role: 'student', isDeleted: false }).lean<any>();
  if (!linkedUser) {
    return null;
  }

  return {
    studentUser: linkedUser,
    studentRecord
  };
}

function serializeResult(result: any, language = 'en') {
  const studentName =
    result?.student?.name ??
    [result?.student?.firstName, result?.student?.lastName].filter(Boolean).join(' ').trim();
  const aiRecommendation = buildAcademicRecommendation(result, language);

  return {
    ...result,
    studentName: studentName || result?.student?.email || '',
    examName: result?.exam?.title ?? '',
    subjectName: result?.exam?.subject?.title ?? '',
    className: result?.exam?.class?.className ?? result?.exam?.class?.name ?? '',
    teacherName: result?.exam?.teacherId?.name ?? result?.gradedBy?.name ?? '',
    totalMarks: result?.exam?.totalMarks ?? null,
    aiRecommendation,
    aiRecommendationTitle: aiRecommendation.title,
    aiRecommendationMessage: aiRecommendation.message
  };
}

router.use(authenticate);

router.post('/', authorize(['super_admin', 'admin', 'branch_manager', 'teacher']), validate(resultSchema), async (req, res, next) => {
  try {
    const [studentContext, exam] = await Promise.all([
      resolveStudentContext(req.body.student),
      Exam.findById(req.body.exam).lean<any>()
    ]);

    const studentUser = studentContext?.studentUser ?? null;
    const studentRecord = studentContext?.studentRecord ?? null;

    if (!studentUser || Array.isArray(studentUser)) {
      return res.status(404).json(createError('Student not found'));
    }

    if (!exam || Array.isArray(exam)) {
      return res.status(404).json(createError('Exam not found'));
    }

    const studentClassId = studentRecord?.classId ?? studentUser.classId ?? null;
    const studentSubjectId = studentRecord?.subjectId ?? studentUser.subjectId ?? null;

    if (studentClassId && exam.class && String(studentClassId) !== String(exam.class)) {
      return res.status(400).json(createError('Student is not assigned to the selected exam class'));
    }

    if (studentSubjectId && exam.subject && String(studentSubjectId) !== String(exam.subject)) {
      return res.status(400).json(createError('Student is not assigned to the selected exam subject'));
    }

    const grade = deriveGrade(Number(req.body.score), Number(exam.totalMarks || 100));
    const result = await Result.create({
      ...req.body,
      student: studentUser._id,
      grade,
      gradedBy: req.body.gradedBy ?? req.user?.userId ?? null
    });

    const populated = await Result.findById(result._id)
      .populate('student', 'name firstName lastName email assignedTeacherId familyId')
      .populate({
        path: 'exam',
        select: 'title date totalMarks subject class teacherId',
        populate: [
          { path: 'subject', select: 'title code' },
          { path: 'class', select: 'className name classCode' },
          { path: 'teacherId', select: 'name email' }
        ]
      })
      .populate('gradedBy', 'name email')
      .lean();

    res.status(201).json(createResponse(serializeResult(populated, String(req.query.lang || req.body.lang || 'en')), 'Result created'));
  } catch (error) {
    next(error);
  }
});

router.get('/', authorize(['super_admin', 'admin', 'branch_manager', 'teacher', 'student', 'family_student', 'parent', 'owner']), validate(resultQuerySchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = String(req.query.search || '').trim();
    const filter: any = {};

    if (search) {
      filter.score = { $gte: Number(search) || 0 };
    }

    if (req.user?.canonicalRole === 'student') {
      filter.student = req.user.userId;
    }

    if (req.user?.canonicalRole === 'parent' || req.user?.role === 'family_student') {
      const familyUser = await User.findById(req.user.userId).lean();
      const children = (familyUser as any)?.familyId
        ? await User.find({ role: 'student', familyId: (familyUser as any).familyId }).select('_id').lean()
        : [];
      filter.student = { $in: children.map((child: any) => child._id) };
    }

    if (req.user?.canonicalRole === 'teacher') {
      const students = await User.find({ role: 'student', assignedTeacherId: req.user.userId }).select('_id').lean();
      filter.student = { $in: students.map((student: any) => student._id) };
    }

    const [results, total] = await Promise.all([
      Result.find(filter)
        .populate('student', 'name firstName lastName email assignedTeacherId familyId')
        .populate({
          path: 'exam',
          select: 'title date totalMarks subject class teacherId',
          populate: [
            { path: 'subject', select: 'title code' },
            { path: 'class', select: 'className name classCode' },
            { path: 'teacherId', select: 'name email' }
          ]
        })
        .populate('gradedBy', 'name email')
        .lean()
        .skip((page - 1) * limit)
        .limit(limit),
      Result.countDocuments(filter)
    ]);

    const language = String(req.query.lang || 'en');
    res.json(createResponse(results.map((result) => serializeResult(result, language)), '', { page, limit, total }));
  } catch (error) {
    next(error);
  }
});

router.post('/:id/ai-recommendation', authorize(['super_admin', 'admin', 'branch_manager', 'teacher', 'student', 'family_student', 'parent', 'owner']), async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'name firstName lastName email familyId assignedTeacherId')
      .populate({
        path: 'exam',
        select: 'title date totalMarks subject class teacherId',
        populate: [
          { path: 'subject', select: 'title code description' },
          { path: 'class', select: 'className name classCode' },
          { path: 'teacherId', select: 'name email' }
        ]
      })
      .populate('gradedBy', 'name email')
      .lean();

    if (!result) return res.status(404).json(createError('Result not found'));

    if (req.user?.canonicalRole === 'student' && (result as any).student._id.toString() !== req.user.userId) {
      return res.status(403).json(createError('Access denied'));
    }

    if (req.user?.canonicalRole === 'teacher' && (result as any).student.assignedTeacherId?.toString() !== req.user.userId) {
      return res.status(403).json(createError('Access denied'));
    }

    const language = String(req.body?.lang || req.query.lang || 'en');
    const recommendation = buildAcademicRecommendation(result, language);

    res.json(createResponse({
      resultId: req.params.id,
      studentName: (result as any).student?.name ?? [(result as any).student?.firstName, (result as any).student?.lastName].filter(Boolean).join(' '),
      subjectName: (result as any).exam?.subject?.title ?? '',
      score: (result as any).score,
      totalMarks: (result as any).exam?.totalMarks ?? 100,
      recommendation
    }, 'AI recommendation generated successfully'));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authorize(['super_admin', 'admin', 'branch_manager', 'teacher', 'student', 'family_student', 'parent', 'owner']), async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'name firstName lastName email familyId assignedTeacherId')
      .populate({
        path: 'exam',
        select: 'title date totalMarks subject class teacherId',
        populate: [
          { path: 'subject', select: 'title code' },
          { path: 'class', select: 'className name classCode' },
          { path: 'teacherId', select: 'name email' }
        ]
      })
      .populate('gradedBy', 'name email')
      .lean();

    if (!result) return res.status(404).json(createError('Result not found'));

    if (req.user?.canonicalRole === 'student' && (result as any).student._id.toString() !== req.user.userId) {
      return res.status(403).json(createError('Access denied'));
    }

    if (req.user?.canonicalRole === 'parent' || req.user?.role === 'family_student') {
      const familyUser = await User.findById(req.user.userId).lean();
      if (!(familyUser as any)?.familyId || (result as any).student.familyId?.toString() !== (familyUser as any).familyId.toString()) {
        return res.status(403).json(createError('Access denied'));
      }
    }

    if (req.user?.canonicalRole === 'teacher') {
      if ((result as any).student.assignedTeacherId?.toString() !== req.user.userId) {
        return res.status(403).json(createError('Access denied'));
      }
    }

    res.json(createResponse(serializeResult(result, String(req.query.lang || 'en'))));
  } catch (error) {
    next(error);
  }
});

export const resultRouter = router;
