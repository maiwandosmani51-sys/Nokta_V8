import { Router } from 'express';
import Joi from 'joi';
import { UserService } from '../services/userService';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createResponse } from '../utils/response';

const router = Router();
const userService = new UserService();

const createTeacherSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().optional(),
    whatsapp: Joi.string().optional(),
    address: Joi.string().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    salaryType: Joi.string().valid('fixed', 'percentage').required(),
    fixedSalary: Joi.number().min(0).optional(),
    percentageRate: Joi.number().min(0).max(100).optional(),
    customPercentage: Joi.number().min(0).max(100).optional(),
    assignedSubjects: Joi.array().items(Joi.string().hex().length(24)).optional(),
    assignedClasses: Joi.array().items(Joi.string().hex().length(24)).optional()
  })
});

router.use(authenticate);

// Get all teachers - admin only
router.get('/', requireAdmin, async (req, res) => {
  try {
    const teachers = await userService.getTeachers();
    res.json(createResponse(teachers));
  } catch (error) {
    res.status(500).json(createResponse(null, 'Failed to fetch teachers'));
  }
});

// Create teacher - admin only
router.post('/', requireAdmin, validate(createTeacherSchema), async (req, res) => {
  try {
    const teacherData = {
      ...req.body,
      name: `${req.body.firstName} ${req.body.lastName}`,
      role: 'teacher'
    };
    const teacher = await userService.createUser(teacherData);
    res.status(201).json(createResponse(teacher, 'Teacher created successfully'));
  } catch (error) {
    res.status(500).json(createResponse(null, 'Failed to create teacher'));
  }
});

// Get teacher by ID
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json(createResponse(null, 'Teacher not found'));
    }
    res.json(createResponse(teacher));
  } catch (error) {
    res.status(500).json(createResponse(null, 'Failed to fetch teacher'));
  }
});

// Update teacher
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const teacher = await userService.updateUser(req.params.id, req.body);
    res.json(createResponse(teacher, 'Teacher updated successfully'));
  } catch (error) {
    res.status(500).json(createResponse(null, 'Failed to update teacher'));
  }
});

export const teacherRouter = router;
