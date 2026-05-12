/**
 * Nokta Academy Management System - Project Information Map
 *
 * This file is a developer-facing route, API, folder, and syntax reference.
 * It is intentionally plain JavaScript so it can be opened directly, imported,
 * or used by small scripts without TypeScript compilation.
 */

const projectInfo = {
  name: 'Nokta Academy Management System',
  stack: {
    backend: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'Mongoose', 'Joi', 'JWT', 'RBAC', 'Audit logging'],
    frontend: ['React', 'Vite', 'TypeScript', 'TailwindCSS', 'React Query', 'Zustand', 'i18next', 'PWA'],
    defaultPorts: {
      backend: 8081,
      frontend: 5173
    }
  },

  folders: {
    backend: {
      root: 'backend/src',
      app: 'backend/src/app.ts',
      server: 'backend/src/server.ts',
      routesIndex: 'backend/src/routes/index.ts',
      models: 'backend/src/models',
      modules: 'backend/src/modules',
      services: 'backend/src/services',
      middlewares: 'backend/src/middlewares',
      validators: 'backend/src/validators',
      scripts: 'backend/src/scripts'
    },
    frontend: {
      root: 'frontend/src',
      app: 'frontend/src/app/App.tsx',
      routes: 'frontend/src/routes/AppRoutes.tsx',
      moduleConfig: 'frontend/src/features/resources/config/modules.ts',
      reusableCrud: 'frontend/src/features/resources/pages/CrudPage.tsx',
      apiClient: 'frontend/src/services/apiClient.ts',
      authStore: 'frontend/src/store/authStore.ts',
      components: 'frontend/src/components',
      locales: 'frontend/src/locales/messages',
      pwaServiceWorker: 'frontend/public/sw.js'
    }
  },

  backendApiBase: '/api',

  backendApiRoutes: [
    { base: '/api/auth', router: 'authRouter', file: 'backend/src/modules/auth/auth.routes.ts', purpose: 'login, register student, refresh, logout, profile, verification, password reset' },
    { base: '/api/users', router: 'userRouter', file: 'backend/src/modules/users/users.routes.ts', purpose: 'super-admin user CRUD and permissions' },
    { base: '/api/branches', router: 'branchRouter', file: 'backend/src/modules/branches/branches.routes.ts', purpose: 'branch CRUD and manager options' },
    { base: '/api/students', router: 'studentRouter', file: 'backend/src/modules/students/students.routes.ts', purpose: 'student CRUD, family-scoped and teacher-scoped reads' },
    { base: '/api/teachers', router: 'teacherRouter', file: 'backend/src/modules/teachers/teachers.routes.ts', purpose: 'teacher CRUD and profile sync' },
    { base: '/api/classes', router: 'classRouter', file: 'backend/src/modules/classes/classes.routes.ts', purpose: 'class CRUD, subject and teacher assignment' },
    { base: '/api/curriculum', router: 'curriculumRouter', file: 'backend/src/modules/curriculum/curriculum.routes.ts', purpose: 'curriculum/nasab darsi CRUD' },
    { base: '/api/ai-assistant', router: 'aiAssistantRouter', file: 'backend/src/modules/ai-assistant/ai-assistant.routes.ts', purpose: 'AI insights and education plan generation' },
    { base: '/api/subjects', router: 'subjectRouter', file: 'backend/src/modules/subjects/subjects.routes.ts', purpose: 'subject CRUD and teacher/class relation checks' },
    { base: '/api/attendance', router: 'attendanceRouter', file: 'backend/src/modules/attendance/attendance.routes.ts', purpose: 'attendance records, summaries, policies' },
    { base: '/api/exams', router: 'examRouter', file: 'backend/src/modules/exams/exams.routes.ts', purpose: 'exam CRUD and relation validation' },
    { base: '/api/results', router: 'resultRouter', file: 'backend/src/modules/results/results.routes.ts', purpose: 'exam result CRUD and publishing support' },
    { base: '/api/payments', router: 'paymentRouter', file: 'backend/src/modules/payments/payments.routes.ts', purpose: 'student payment records' },
    { base: '/api/finance', router: 'financeRouter', file: 'backend/src/modules/finance/finance.routes.ts', purpose: 'income, finance summaries, charts' },
    { base: '/api/expenses', router: 'expenseRouter', file: 'backend/src/modules/expenses/expenses.routes.ts', purpose: 'expense CRUD and reporting' },
    { base: '/api/families', router: 'familyRouter', file: 'backend/src/modules/families/families.routes.ts', purpose: 'family records and guardian data' },
    { base: '/api/books', router: 'bookRouter', file: 'backend/src/modules/books/books.routes.ts', purpose: 'library book CRUD' },
    { base: '/api/audit', router: 'auditRouter', file: 'backend/src/modules/audit/audit.routes.ts', purpose: 'audit log viewing' },
    { base: '/api/notifications', router: 'notificationRouter', file: 'backend/src/modules/notifications/notifications.routes.ts', purpose: 'announcements/notifications CRUD and public announcements' },
    { base: '/api/roles', router: 'roleRouter', file: 'backend/src/modules/roles/roles.routes.ts', purpose: 'role matrix and role management' },
    { base: '/api/permissions', router: 'permissionsRouter', file: 'backend/src/modules/permissions/permissions.routes.ts', purpose: 'permission listing' },
    { base: '/api/dashboard', router: 'dashboardRouter', file: 'backend/src/modules/dashboard/dashboard.routes.ts', purpose: 'dashboard summaries and analytics' },
    { base: '/api/reports', router: 'reportRouter', file: 'backend/src/modules/reports/reports.routes.ts', purpose: 'reports and analytics summaries' },
    { base: '/api/language-settings', router: 'languageSettingRouter', file: 'backend/src/modules/language-settings/language-settings.routes.ts', purpose: 'language configuration' },
    { base: '/api/admin', router: 'adminRouter', file: 'backend/src/modules/admin/admin.routes.ts', purpose: 'admin maintenance helpers' }
  ],

  importantBackendEndpoints: {
    auth: [
      'POST /api/auth/login',
      'POST /api/auth/register/student',
      'GET /api/auth/register/options',
      'POST /api/auth/refresh',
      'POST /api/auth/logout',
      'POST /api/auth/logout-all',
      'GET /api/auth/profile',
      'POST /api/auth/forgot-password',
      'POST /api/auth/reset-password'
    ],
    curriculum: [
      'GET /api/curriculum',
      'POST /api/curriculum',
      'GET /api/curriculum/:id',
      'PUT /api/curriculum/:id',
      'DELETE /api/curriculum/:id'
    ],
    aiAssistant: [
      'GET /api/ai-assistant/insights',
      'POST /api/ai-assistant/generate'
    ],
    standardCrudPattern: [
      'GET /api/{module}?search=&page=&limit=',
      'POST /api/{module}',
      'GET /api/{module}/:id',
      'PUT /api/{module}/:id',
      'DELETE /api/{module}/:id'
    ]
  },

  frontendRoutes: [
    { path: '/', component: 'Navigate to /home', access: 'public' },
    { path: '/home', component: 'HomePage', access: 'public' },
    { path: '/login', component: 'LoginPage', access: 'public' },
    { path: '/register', component: 'RegisterPage', access: 'public' },
    { path: '/forbidden', component: 'ForbiddenPage', access: 'public' },
    { path: '/dashboard', component: 'DashboardPage', access: 'protected: all enterprise roles' },
    { path: '/dashboard/super-admin', component: 'SuperAdminDashboard', access: 'super_admin' },
    { path: '/dashboard/super-admin/master', component: 'SuperAdminMasterDashboard', access: 'super_admin' },
    { path: '/dashboard/manage-users', component: 'ManageUsersPage', access: 'super_admin' },
    { path: '/dashboard/admin', component: 'DashboardPage', access: 'admin' },
    { path: '/dashboard/teacher', component: 'DashboardPage', access: 'teacher' },
    { path: '/dashboard/student', component: 'DashboardPage', access: 'student' },
    { path: '/dashboard/parent', component: 'DashboardPage', access: 'parent' },
    { path: '/dashboard/family', component: 'DashboardPage', access: 'parent' },
    { path: '/dashboard/owner', component: 'DashboardPage', access: 'owner' },
    { path: '/dashboard/branch-manager', component: 'DashboardPage', access: 'branch_manager' },
    { path: '/users', component: 'UsersPage', access: 'super_admin' },
    { path: '/analytics', component: 'AnalyticsPage', access: 'super_admin, admin, owner' },
    { path: '/campaign', component: 'CampaignPage', access: 'admin, branch_manager' },
    { path: '/ecommerce', component: 'EcommercePage', access: 'super_admin, admin, owner' },
    { path: '/settings', component: 'SettingsPage', access: 'super_admin, admin, teacher, student, parent, owner, branch_manager' },
    { path: '/attendance', component: 'AttendancePage', access: 'super_admin, admin, branch_manager, teacher, student, parent, owner' },
    { path: '/finance', component: 'FinancePage', access: 'super_admin, admin, branch_manager, owner' },
    { path: '/expenses', component: 'ExpensesPage', access: 'super_admin, admin, branch_manager, owner' },
    { path: '/reports', component: 'ReportsPage', access: 'super_admin, admin, branch_manager, owner' },
    { path: '/roles', component: 'RolesPage', access: 'super_admin, owner' },
    { path: '/ai-assistant', component: 'AIAssistantPage', access: 'super_admin, admin, teacher, owner, branch_manager, system_automation' },
    { path: '/profile', component: 'ProfilePage', access: 'authenticated users' }
  ],

  frontendCrudModuleRoutes: [
    '/branches',
    '/students',
    '/teachers',
    '/classes',
    '/subjects',
    '/exams',
    '/results',
    '/payments',
    '/families',
    '/notifications',
    '/curriculum',
    '/audit'
  ],

  models: [
    'Advertisement',
    'Announcement',
    'Attendance',
    'AttendancePolicy',
    'AuditLog',
    'Book',
    'Branch',
    'Class',
    'Curriculum',
    'Enrollment',
    'Exam',
    'ExamResult',
    'Expense',
    'Family',
    'FamilyLink',
    'FinanceEntry',
    'LanguageSetting',
    'LearningResource',
    'Notification',
    'Owner',
    'Parent',
    'Payment',
    'Permission',
    'QrContact',
    'Question',
    'Report',
    'Result',
    'Role',
    'Salary',
    'SalaryTransaction',
    'SessionToken',
    'StationerySale',
    'Student',
    'Subject',
    'Teacher',
    'User'
  ],

  roles: [
    'super_admin',
    'admin',
    'teacher',
    'student',
    'parent',
    'owner',
    'branch_manager',
    'system_automation',
    'family_student',
    'accountant',
    'librarian',
    'user'
  ],

  syntaxRules: {
    backend: [
      'Routes use Express Router exported as named router constants.',
      'Request validation uses Joi plus backend/src/middlewares/validate.ts.',
      'Responses use createResponse(data, message, meta) and createError(message).',
      'Models use createBaseSchema from backend/src/utils/schema.ts.',
      'Protected routes pass through authenticate, route permissions, branch checks, ownership checks, and audit middleware.',
      'Soft-delete modules use isDeleted, deletedAt, deletedBy instead of hard deletion when business data must be preserved.',
      'Passwords are hashed through backend/src/utils/password.ts.',
      'No profile image fields or profile upload syntax is active in the project.'
    ],
    frontend: [
      'Routes are declared in frontend/src/routes/AppRoutes.tsx.',
      'Generic CRUD screens are driven by modulesConfig in frontend/src/features/resources/config/modules.ts.',
      'API calls use frontend/src/services/apiClient.ts.',
      'Authentication state is stored in frontend/src/store/authStore.ts.',
      'Server state uses React Query.',
      'UI components use TailwindCSS and shared components from frontend/src/components and frontend/src/shared/components.',
      'Protected pages use ProtectedRoute with role arrays.',
      'No profile image display, file upload, multipart/form-data, or profile image fallback utility is active.'
    ]
  },

  commands: {
    installBackend: 'cd backend && npm.cmd install',
    installFrontend: 'cd frontend && npm.cmd install',
    buildBackend: 'cd backend && npm.cmd run build',
    buildFrontend: 'cd frontend && npm.cmd run build',
    devBackend: 'cd backend && npm.cmd run dev',
    devFrontend: 'cd frontend && npm.cmd run dev -- --host 127.0.0.1 --port 5173',
    seedDatabase: 'cd backend && npm.cmd run seed'
  },

  healthStatusFromLastVerification: {
    backendBuild: 'passed',
    frontendBuild: 'passed',
    frontendRouteCheck: 'GET /ai-assistant returned 200 from Vite dev server',
    protectedApiCheck: 'GET /api/curriculum and /api/ai-assistant/insights return 401 without login, which is expected'
  }
};

function listBackendApiRoutes() {
  return projectInfo.backendApiRoutes.map((route) => route.base);
}

function listFrontendRoutes() {
  return [
    ...projectInfo.frontendRoutes.map((route) => route.path),
    ...projectInfo.frontendCrudModuleRoutes
  ];
}

function findRoute(path) {
  return {
    backend: projectInfo.backendApiRoutes.find((route) => route.base === path || path.startsWith(`${route.base}/`)) || null,
    frontend:
      projectInfo.frontendRoutes.find((route) => route.path === path) ||
      (projectInfo.frontendCrudModuleRoutes.includes(path) ? { path, component: 'CrudPage', access: 'modulesConfig permissions' } : null)
  };
}

module.exports = {
  projectInfo,
  listBackendApiRoutes,
  listFrontendRoutes,
  findRoute
};
