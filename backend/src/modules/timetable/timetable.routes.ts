import { Router } from 'express';
import Joi from 'joi';
import { Timetable } from '../../models/Timetable';
import { ClassModel } from '../../models/Class';
import { Subject } from '../../models/Subject';
import { User } from '../../models/User';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createError, createResponse } from '../../helpers/response';

const router = Router();

const viewTimetable = authorize(['super_admin', 'admin', 'branch_manager', 'teacher', 'student', 'family_student', 'parent', 'owner']);
const manageTimetable = authorize(['super_admin', 'admin', 'branch_manager', 'teacher']);

const dayValues = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

const payloadSchema = {
  classId: Joi.string().hex().length(24).required(),
  subjectId: Joi.string().hex().length(24).allow('', null).optional(),
  teacherId: Joi.string().hex().length(24).required(),
  dayOfWeek: Joi.string().valid(...dayValues).required(),
  startTime: Joi.string().trim().required(),
  endTime: Joi.string().trim().required(),
  room: Joi.string().trim().allow('', null).optional(),
  deliveryMode: Joi.string().valid('in_person', 'online', 'hybrid').optional(),
  onlineLink: Joi.string().trim().allow('', null).optional(),
  notes: Joi.string().trim().allow('', null).optional(),
  active: Joi.boolean().optional(),
  branchId: Joi.string().hex().length(24).allow('', null).optional()
};

const createTimetableSchema = Joi.object({ body: Joi.object(payloadSchema) });
const updateTimetableSchema = Joi.object({
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({ ...payloadSchema, classId: payloadSchema.classId.optional(), teacherId: payloadSchema.teacherId.optional(), dayOfWeek: payloadSchema.dayOfWeek.optional(), startTime: payloadSchema.startTime.optional(), endTime: payloadSchema.endTime.optional() }).min(1)
});
const idParamsSchema = Joi.object({ params: Joi.object({ id: Joi.string().hex().length(24).required() }) });
const timetableQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow('', null),
  classId: Joi.string().hex().length(24).optional(),
  teacherId: Joi.string().hex().length(24).optional(),
  dayOfWeek: Joi.string().valid(...dayValues).optional()
});

function normalizeNullableId(value: unknown) {
  return value === '' || value === undefined ? null : value;
}

function serializeTimetable(item: any) {
  const classRef = item?.classId;
  const subjectRef = item?.subjectId;
  const teacherRef = item?.teacherId;
  return {
    ...item,
    classId: classRef?._id ?? classRef ?? null,
    subjectId: subjectRef?._id ?? subjectRef ?? null,
    teacherId: teacherRef?._id ?? teacherRef ?? null,
    className: classRef?.className ?? classRef?.name ?? '',
    subjectName: subjectRef?.title ?? '',
    teacherName: teacherRef?.name ?? ''
  };
}

async function assertRelations(payload: Record<string, any>) {
  const subjectId = normalizeNullableId(payload.subjectId);
  const [klass, subject, teacher] = await Promise.all([
    ClassModel.findOne({ _id: payload.classId, isDeleted: false }).lean<any>(),
    subjectId ? Subject.findOne({ _id: subjectId, isDeleted: false }).lean<any>() : Promise.resolve(null),
    User.findOne({ _id: payload.teacherId, role: 'teacher', isDeleted: false }).lean<any>()
  ]);

  if (!klass) throw new Error('Selected class is invalid');
  if (!teacher) throw new Error('Selected teacher is invalid');
  if (subjectId && !subject) throw new Error('Selected subject is invalid');
  if (subject && String(subject.classId) !== String(klass._id)) {
    throw new Error('Selected subject does not belong to the selected class');
  }
}

async function buildRoleFilter(req: any) {
  const filter: any = { isDeleted: false };
  const role = req.user?.canonicalRole ?? req.user?.role;

  if (req.query.classId) filter.classId = req.query.classId;
  if (req.query.teacherId) filter.teacherId = req.query.teacherId;
  if (req.query.dayOfWeek) filter.dayOfWeek = req.query.dayOfWeek;

  if (role === 'teacher') {
    filter.teacherId = req.user.userId;
  }

  if (role === 'student' || role === 'family_student') {
    const currentUser = await User.findById(req.user.userId).select('classId').lean<any>();
    filter.classId = currentUser?.classId ?? null;
  }

  if (role === 'parent') {
    const currentUser = await User.findById(req.user.userId).select('familyId').lean<any>();
    const children = currentUser?.familyId
      ? await User.find({ role: 'student', familyId: currentUser.familyId, isDeleted: false }).select('classId').lean<any[]>()
      : [];
    filter.classId = { $in: children.map((child) => child.classId).filter(Boolean) };
  }

  return filter;
}

router.use(authenticate);

router.get('/', viewTimetable, validate(timetableQuerySchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = String(req.query.search || '').trim();
    const filter = await buildRoleFilter(req);
    if (search) {
      filter.$or = [
        { dayOfWeek: { $regex: search, $options: 'i' } },
        { room: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Timetable.find(filter)
        .populate('classId', 'className name classCode')
        .populate('subjectId', 'title code')
        .populate('teacherId', 'name email phone whatsapp')
        .sort({ dayOfWeek: 1, startTime: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Timetable.countDocuments(filter)
    ]);

    res.json(createResponse(items.map(serializeTimetable), '', { page, limit, total }));
  } catch (error) {
    next(error);
  }
});

router.post('/', manageTimetable, validate(createTimetableSchema), async (req, res) => {
  try {
    const payload = {
      ...req.body,
      branchId: normalizeNullableId(req.body.branchId) ?? req.user?.branchId ?? null,
      subjectId: normalizeNullableId(req.body.subjectId)
    };
    await assertRelations(payload);
    const item = await Timetable.create(payload);
    const saved = await Timetable.findById(item._id).populate('classId', 'className name classCode').populate('subjectId', 'title code').populate('teacherId', 'name email phone whatsapp').lean();
    res.status(201).json(createResponse(serializeTimetable(saved), 'Timetable item created successfully'));
  } catch (error: any) {
    res.status(400).json(createError(error?.message || 'Failed to create timetable item'));
  }
});

router.get('/:id', viewTimetable, validate(idParamsSchema), async (req, res, next) => {
  try {
    const item = await Timetable.findOne({ _id: req.params.id, isDeleted: false })
      .populate('classId', 'className name classCode')
      .populate('subjectId', 'title code')
      .populate('teacherId', 'name email phone whatsapp')
      .lean();
    if (!item) return res.status(404).json(createError('Timetable item not found'));
    res.json(createResponse(serializeTimetable(item)));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', manageTimetable, validate(updateTimetableSchema), async (req, res) => {
  try {
    const existing = await Timetable.findOne({ _id: req.params.id, isDeleted: false }).lean<any>();
    if (!existing) return res.status(404).json(createError('Timetable item not found'));
    const payload = {
      ...req.body,
      branchId: normalizeNullableId(req.body.branchId) ?? existing.branchId ?? req.user?.branchId ?? null,
      classId: req.body.classId ?? existing.classId,
      teacherId: req.body.teacherId ?? existing.teacherId,
      subjectId: normalizeNullableId(req.body.subjectId ?? existing.subjectId)
    };
    await assertRelations(payload);
    const item = await Timetable.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, payload, { new: true, runValidators: true })
      .populate('classId', 'className name classCode')
      .populate('subjectId', 'title code')
      .populate('teacherId', 'name email phone whatsapp')
      .lean();
    res.json(createResponse(serializeTimetable(item), 'Timetable item updated successfully'));
  } catch (error: any) {
    res.status(400).json(createError(error?.message || 'Failed to update timetable item'));
  }
});

router.delete('/:id', manageTimetable, validate(idParamsSchema), async (req, res) => {
  try {
    const item = await Timetable.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user?.userId ?? null, active: false },
      { new: true }
    ).lean();
    if (!item) return res.status(404).json(createError('Timetable item not found'));
    res.json(createResponse({}, 'Timetable item deleted successfully'));
  } catch (error: any) {
    res.status(400).json(createError(error?.message || 'Failed to delete timetable item'));
  }
});

export const timetableRouter = router;
