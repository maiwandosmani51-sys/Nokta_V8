import { Router } from 'express';
import Joi from 'joi';
import { AuditLog } from '../models/AuditLog';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createResponse } from '../utils/response';
import { paginationSchema } from '../utils/validators';

const router = Router();
const querySchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
});

router.use(authenticate, authorize(['super_admin', 'admin']));

router.get('/', validate(querySchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).lean().skip((page - 1) * limit).limit(limit),
      AuditLog.countDocuments()
    ]);
    res.json(createResponse(logs, '', { page, limit, total }));
  } catch (error) {
    next(error);
  }
});

export const auditRouter = router;
