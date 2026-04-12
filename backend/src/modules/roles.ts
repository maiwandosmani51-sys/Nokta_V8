import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createResponse } from '../utils/response';
import { roles } from '../utils/roles';

const router = Router();

router.use(authenticate, authorize(['super_admin']));

router.get('/', (req, res) => {
  res.json(createResponse(Object.values(roles)));
});

export const roleRouter = router;
