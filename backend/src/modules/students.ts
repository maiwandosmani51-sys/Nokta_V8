import { Router } from 'express';
import Joi from 'joi';
import { StudentService } from '../services/studentService';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireFamily, requireTeacher } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createResponse } from '../utils/response';

const router = Router();
const studentService = new StudentService();

const registerStudentSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    fatherName: Joi.string().required(),
    familyPhone: Joi.string().required(),
    classId: Joi.string().hex().length(24).required(),
    subjectId: Joi.string().hex().length(24).required(),
    teacherId: Joi.string().hex().length(24).required(),
    feeAmount: Joi.number().min(0).required(),
    paidAmount: Joi.number().min(0).optional()
  })
});

router.use(authenticate);

// Register student - admin only
router.post('/', requireAdmin, validate(registerStudentSchema), async (req, res) => {
  try {
    const student = await studentService.registerStudent(req.body);
    res.status(201).json(createResponse(student, 'Student registered successfully'));
  } catch (error) {
    res.status(500).json(createResponse(null, 'Failed to register student'));
  }
});

// Get students by family - family only
router.get('/family', requireFamily, async (req, res) => {
  try {
    const familyId = (req as any).user.familyId; // Assume family user has familyId
    const students = await studentService.getStudentsByFamily(familyId);
    res.json(createResponse(students));
  } catch (error) {
    res.status(500).json(createResponse(null, 'Failed to fetch students'));
  }
});

// Get students by teacher - teacher only
router.get('/teacher', requireTeacher, async (req, res) => {
  try {
    const teacherId = (req as any).user._id;
    const students = await studentService.getStudentsByTeacher(teacherId);
    res.json(createResponse(students));
  } catch (error) {
    res.status(500).json(createResponse(null, 'Failed to fetch students'));
  }
});

export const studentRouter = router;
