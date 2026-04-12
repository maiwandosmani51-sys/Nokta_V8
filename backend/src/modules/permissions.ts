import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createResponse } from '../utils/response';

const router = Router();

const permissionTemplate = {
  modules: [
    { key: 'dashboard', label: 'Dashboard', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'users', label: 'Users', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'students', label: 'Students', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'teachers', label: 'Teachers', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'classes', label: 'Classes', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'subjects', label: 'Subjects', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'exams', label: 'Exams', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'results', label: 'Results', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'finance', label: 'Finance', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'expenses', label: 'Expenses', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'families', label: 'Families', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'books', label: 'Books', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'notifications', label: 'Notifications', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'audit', label: 'Audit Logs', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'roles', label: 'Roles', actions: ['create', 'read', 'update', 'delete'] }
  ],
  roleTemplates: {
    super_admin: {
      dashboard: ['create', 'read', 'update', 'delete'],
      users: ['create', 'read', 'update', 'delete'],
      students: ['create', 'read', 'update', 'delete'],
      teachers: ['create', 'read', 'update', 'delete'],
      classes: ['create', 'read', 'update', 'delete'],
      subjects: ['create', 'read', 'update', 'delete'],
      exams: ['create', 'read', 'update', 'delete'],
      results: ['create', 'read', 'update', 'delete'],
      finance: ['create', 'read', 'update', 'delete'],
      expenses: ['create', 'read', 'update', 'delete'],
      families: ['create', 'read', 'update', 'delete'],
      books: ['create', 'read', 'update', 'delete'],
      notifications: ['create', 'read', 'update', 'delete'],
      audit: ['create', 'read', 'update', 'delete'],
      roles: ['create', 'read', 'update', 'delete']
    },
    admin: {
      dashboard: ['read'],
      users: ['read'],
      students: ['create', 'read', 'update', 'delete'],
      teachers: ['read', 'update'],
      classes: ['create', 'read', 'update'],
      subjects: ['create', 'read', 'update'],
      exams: ['create', 'read', 'update'],
      results: ['create', 'read', 'update'],
      finance: ['read'],
      expenses: ['create', 'read', 'update', 'delete'],
      families: ['read'],
      books: ['read'],
      notifications: ['create', 'read', 'update', 'delete'],
      audit: ['read'],
      roles: ['read']
    },
    teacher: {
      dashboard: ['read'],
      students: ['read', 'update'],
      teachers: ['read'],
      classes: ['read', 'update'],
      subjects: ['read', 'update'],
      exams: ['create', 'read', 'update'],
      results: ['read'],
      notifications: ['read'],
      audit: ['read']
    },
    student: {
      dashboard: ['read'],
      results: ['read'],
      notifications: ['read']
    },
    family_student: {
      dashboard: ['read'],
      families: ['read'],
      results: ['read'],
      notifications: ['read']
    },
    accountant: {
      dashboard: ['read'],
      finance: ['read', 'update'],
      expenses: ['create', 'read', 'update', 'delete'],
      notifications: ['read']
    },
    librarian: {
      dashboard: ['read'],
      books: ['create', 'read', 'update', 'delete'],
      notifications: ['read']
    }
  }
};

router.use(authenticate, authorize(['super_admin']));

router.get('/template', (req, res) => {
  res.json(createResponse(permissionTemplate));
});

export const permissionsRouter = router;
