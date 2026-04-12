import type { RoleType } from '../types.d.ts';

export const roles: Record<RoleType, RoleType> = {
  super_admin: 'super_admin',
  admin: 'admin',
  teacher: 'teacher',
  student: 'student',
  family_student: 'family_student',
  family: 'family',
  accountant: 'accountant',
  librarian: 'librarian'
};

export const protectedRoutes: Record<string, RoleType[]> = {
  '/api/users': ['super_admin', 'admin'],
  '/api/students': ['super_admin', 'admin', 'teacher'],
  '/api/teachers': ['super_admin', 'admin'],
  '/api/classes': ['super_admin', 'admin', 'teacher'],
  '/api/subjects': ['super_admin', 'admin', 'teacher'],
  '/api/exams': ['super_admin', 'admin', 'teacher'],
  '/api/results': ['super_admin', 'admin', 'teacher', 'student', 'family_student'],
  '/api/finance': ['super_admin', 'admin', 'accountant'],
  '/api/expenses': ['super_admin', 'admin', 'accountant'],
  '/api/families': ['super_admin', 'admin', 'teacher', 'family_student'],
  '/api/books': ['super_admin', 'admin', 'librarian'],
  '/api/audit': ['super_admin', 'admin'],
  '/api/notifications': ['super_admin', 'admin', 'teacher', 'student', 'family_student', 'accountant', 'librarian'],
  '/api/roles': ['super_admin'],
  '/api/dashboard': ['super_admin', 'admin', 'teacher', 'accountant', 'librarian', 'student', 'family_student']
};
