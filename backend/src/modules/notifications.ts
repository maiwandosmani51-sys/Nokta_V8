import { Router } from 'express';
import Joi from 'joi';
import { Notification } from '../models/Notification';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createResponse, createError } from '../utils/response';
import { paginationSchema } from '../utils/validators';

const router = Router();
const notificationSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().required(),
    message: Joi.string().required(),
    recipientRoles: Joi.array().items(Joi.string().valid('super_admin','admin','teacher','student','family_student','accountant','librarian')).required()
  })
});

router.use(authenticate, authorize(['super_admin', 'admin', 'teacher', 'accountant', 'librarian']));

router.post('/', validate(notificationSchema), async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(createResponse(notification, 'Notification sent'));
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
    const [notifications, total] = await Promise.all([
      Notification.find(filter).lean().skip((page - 1) * limit).limit(limit),
      Notification.countDocuments(filter)
    ]);
    res.json(createResponse(notifications, '', { page, limit, total }));
  } catch (error) {
    next(error);
  }
});

export const notificationRouter = router;
