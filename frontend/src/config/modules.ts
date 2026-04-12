import type { LucideIcon } from 'lucide-react';
import { Home, Users, Layers, BookOpen, CalendarCheck, FileText, DollarSign, CreditCard, Bell, ClipboardList, ShieldCheck, Activity, Settings, Archive, UserCheck } from 'lucide-react';

export type Role = 'super_admin' | 'admin' | 'user' | 'teacher' | 'student' | 'family_student' | 'accountant' | 'librarian';

export interface ModuleField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  optionsEndpoint?: string;
  optionLabelKey?: string;
  optionValueKey?: string;
  multiple?: boolean;
  hiddenOnEdit?: boolean;
}

export interface ModuleListField {
  key: string;
  label: string;
  width?: string;
}

export interface ModuleAction {
  label: string;
  patchData: Record<string, any>;
  roles: Role[];
  visibleWhen?: (item: any) => boolean;
}

export interface SummaryCard {
  label: string;
  key: string;
  prefix?: string;
}

export interface ModuleConfig {
  path: string;
  title: string;
  entity: string;
  endpoint: string;
  description?: string;
  fields: ModuleField[];
  listFields: ModuleListField[];
  searchField?: string;
  permissions: {
    view: Role[];
    create?: Role[];
    edit?: Role[];
    delete?: Role[];
  };
  createEndpoint?: string;
  disableEdit?: boolean;
  disableDelete?: boolean;
  type?: 'crud' | 'summary';
  summaryCards?: SummaryCard[];
  actions?: ModuleAction[];
}

const allRoles: Role[] = ['super_admin', 'admin', 'teacher', 'student', 'family_student', 'accountant', 'librarian'];

export const modulesConfig: Record<string, ModuleConfig> = {
  users: {
    path: '/users',
    title: 'Users',
    entity: 'User',
    endpoint: '/users',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true, hiddenOnEdit: true },
      { name: 'role', label: 'Role', type: 'select', required: true, options: [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'admin', label: 'Admin' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'student', label: 'Student' },
        { value: 'family_student', label: 'Family Student' },
        { value: 'accountant', label: 'Accountant' },
        { value: 'librarian', label: 'Librarian' }
      ] }
    ],
    listFields: [
      { key: 'name', label: 'Name', width: '40%' },
      { key: 'email', label: 'Email', width: '35%' },
      { key: 'role', label: 'Role', width: '25%' }
    ],
    searchField: 'name',
    permissions: {
      view: ['super_admin', 'admin'],
      create: ['super_admin', 'admin'],
      edit: ['super_admin', 'admin'],
      delete: ['super_admin', 'admin']
    },
    disableEdit: false,
    disableDelete: false
  },
  students: {
    path: '/students',
    title: 'Students',
    entity: 'Student',
    endpoint: '/students',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true, hiddenOnEdit: true },
      { name: 'fatherName', label: 'Father Name', type: 'text', required: true, hiddenOnEdit: true },
      { name: 'phone', label: 'Phone', type: 'text', required: true },
      { name: 'classId', label: 'Class', type: 'select', required: true, optionsEndpoint: '/classes', optionLabelKey: 'name', optionValueKey: '_id' },
      { name: 'teacherId', label: 'Teacher', type: 'select', required: true, optionsEndpoint: '/teachers', optionLabelKey: 'name', optionValueKey: '_id' },
      { name: 'fee', label: 'Fee', type: 'number', required: true }
    ],
    listFields: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'fatherName', label: 'Father Name' },
      { key: 'className', label: 'Class' },
      { key: 'teacherName', label: 'Teacher' },
      { key: 'fee', label: 'Fee' }
    ],
    searchField: 'name',
    permissions: {
      view: ['super_admin', 'admin', 'teacher', 'student', 'family_student'],
      create: ['super_admin', 'admin', 'teacher'],
      edit: ['super_admin', 'admin', 'teacher'],
      delete: ['super_admin', 'admin']
    },
    disableEdit: true,
    disableDelete: true
  },
  teachers: {
    path: '/teachers',
    title: 'Teachers',
    entity: 'Teacher',
    endpoint: '/teachers',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true, hiddenOnEdit: true },
      { name: 'phone', label: 'Phone', type: 'text', required: true },
      { name: 'salaryType', label: 'Salary Type', type: 'select', required: true, options: [
        { value: 'fixed', label: 'Fixed' },
        { value: 'percentage', label: 'Percentage' }
      ] },
      { name: 'salaryValue', label: 'Salary Value', type: 'number', required: true }
    ],
    listFields: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'salaryDescription', label: 'Salary' },
      { key: 'totalStudents', label: 'Students' },
      { key: 'totalSalary', label: 'Calculated Salary' }
    ],
    searchField: 'name',
    permissions: {
      view: ['super_admin', 'admin', 'teacher'],
      create: ['super_admin', 'admin'],
      edit: ['super_admin', 'admin'],
      delete: ['super_admin', 'admin']
    },
    disableEdit: true,
    disableDelete: true
  },
  classes: {
    path: '/classes',
    title: 'Classes',
    entity: 'Class',
    endpoint: '/classes',
    fields: [
      { name: 'name', label: 'Class Name', type: 'text', required: true },
      { name: 'teacher', label: 'Teacher', type: 'select', required: true, optionsEndpoint: '/teachers', optionLabelKey: 'name', optionValueKey: '_id' },
      { name: 'capacity', label: 'Capacity', type: 'number' }
    ],
    listFields: [
      { key: 'name', label: 'Class' },
      { key: 'teacher', label: 'Teacher' },
      { key: 'capacity', label: 'Capacity' }
    ],
    searchField: 'name',
    permissions: {
      view: ['super_admin', 'admin', 'teacher'],
      create: ['super_admin', 'admin', 'teacher'],
      edit: ['super_admin', 'admin', 'teacher'],
      delete: ['super_admin', 'admin']
    },
    disableEdit: true,
    disableDelete: true
  },
  subjects: {
    path: '/subjects',
    title: 'Subjects',
    entity: 'Subject',
    endpoint: '/subjects',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true },
      { name: 'classId', label: 'Class', type: 'select', required: true, optionsEndpoint: '/classes', optionLabelKey: 'name', optionValueKey: '_id' },
      { name: 'feeAmount', label: 'Fee Amount', type: 'number', required: true },
      { name: 'teacher', label: 'Teacher', type: 'select', required: true, optionsEndpoint: '/teachers', optionLabelKey: 'name', optionValueKey: '_id' },
      { name: 'description', label: 'Description', type: 'textarea' }
    ],
    listFields: [
      { key: 'title', label: 'Title' },
      { key: 'code', label: 'Code' },
      { key: 'teacher', label: 'Teacher' },
      { key: 'className', label: 'Class' }
    ],
    searchField: 'title',
    permissions: {
      view: ['super_admin', 'admin', 'teacher'],
      create: ['super_admin', 'admin', 'teacher'],
      edit: ['super_admin', 'admin', 'teacher'],
      delete: ['super_admin', 'admin']
    },
    disableEdit: true,
    disableDelete: true
  },
  exams: {
    path: '/exams',
    title: 'Exams',
    entity: 'Exam',
    endpoint: '/exams',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'subject', label: 'Subject ID', type: 'text', required: true },
      { name: 'class', label: 'Class ID', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'totalMarks', label: 'Total Marks', type: 'number' }
    ],
    listFields: [
      { key: 'title', label: 'Title' },
      { key: 'subject', label: 'Subject' },
      { key: 'class', label: 'Class' },
      { key: 'date', label: 'Date' }
    ],
    searchField: 'title',
    permissions: {
      view: ['super_admin', 'admin', 'teacher'],
      create: ['super_admin', 'admin', 'teacher'],
      edit: ['super_admin', 'admin', 'teacher'],
      delete: ['super_admin', 'admin']
    },
    disableEdit: true,
    disableDelete: true
  },
  results: {
    path: '/results',
    title: 'Results',
    entity: 'Result',
    endpoint: '/results',
    fields: [
      { name: 'student', label: 'Student ID', type: 'text', required: true },
      { name: 'exam', label: 'Exam ID', type: 'text', required: true },
      { name: 'score', label: 'Score', type: 'number', required: true },
      { name: 'gradedBy', label: 'Graded By', type: 'text' }
    ],
    listFields: [
      { key: 'student', label: 'Student' },
      { key: 'exam', label: 'Exam' },
      { key: 'score', label: 'Score' }
    ],
    searchField: 'student',
    permissions: {
      view: allRoles,
      create: ['super_admin', 'admin', 'teacher'],
      edit: ['super_admin', 'admin', 'teacher'],
      delete: ['super_admin', 'admin']
    },
    disableEdit: true,
    disableDelete: true,
    description: 'Student and exam results are visible to all roles, with teacher management from the backend.'
  },
  finance: {
    path: '/finance',
    title: 'Finance',
    entity: 'Income',
    endpoint: '/finance',
    createEndpoint: '/finance/income',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' }
    ],
    listFields: [
      { key: 'title', label: 'Title' },
      { key: 'amount', label: 'Amount' },
      { key: 'category', label: 'Category' },
      { key: 'date', label: 'Date' }
    ],
    searchField: 'title',
    permissions: {
      view: ['super_admin', 'admin', 'accountant'],
      create: ['super_admin', 'admin', 'accountant']
    },
    disableEdit: true,
    disableDelete: true
  },
  reports: {
    path: '/reports',
    title: 'Reports',
    entity: 'Report',
    endpoint: '/finance/summary',
    fields: [],
    listFields: [],
    permissions: {
      view: ['super_admin', 'admin', 'accountant']
    },
    type: 'summary',
    summaryCards: [
      { label: 'Total Expenses', key: 'expenses', prefix: '$' }
    ],
    description: 'Financial reports and cash flow insights.'
  },
  expenses: {
    path: '/expenses',
    title: 'Expenses',
    entity: 'Expense',
    endpoint: '/expenses',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' }
    ],
    listFields: [
      { key: 'title', label: 'Title' },
      { key: 'amount', label: 'Amount' },
      { key: 'category', label: 'Category' },
      { key: 'date', label: 'Date' }
    ],
    searchField: 'title',
    permissions: {
      view: ['super_admin', 'admin', 'accountant'],
      create: ['super_admin', 'admin', 'accountant']
    },
    disableEdit: true,
    disableDelete: true
  },
  families: {
    path: '/families',
    title: 'Families',
    entity: 'Family',
    endpoint: '/families',
    fields: [
      { name: 'guardianName', label: 'Guardian Name', type: 'text', required: true },
      { name: 'guardianEmail', label: 'Guardian Email', type: 'email', required: true },
      { name: 'guardianPhone', label: 'Guardian Phone', type: 'text', required: true },
      { name: 'students', label: 'Students', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' }
    ],
    listFields: [
      { key: 'guardianName', label: 'Guardian' },
      { key: 'guardianEmail', label: 'Email' },
      { key: 'guardianPhone', label: 'Phone' }
    ],
    searchField: 'guardianName',
    permissions: {
      view: ['super_admin', 'admin', 'teacher', 'family_student'],
      create: ['super_admin', 'admin', 'teacher'],
      edit: ['super_admin', 'admin', 'teacher'],
      delete: ['super_admin', 'admin']
    },
    disableEdit: true,
    disableDelete: true
  },
  books: {
    path: '/books',
    title: 'Books',
    entity: 'Book',
    endpoint: '/books',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'author', label: 'Author', type: 'text', required: true },
      { name: 'isbn', label: 'ISBN', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text' }
    ],
    listFields: [
      { key: 'title', label: 'Title' },
      { key: 'author', label: 'Author' },
      { key: 'isbn', label: 'ISBN' },
      { key: 'category', label: 'Category' }
    ],
    searchField: 'title',
    permissions: {
      view: ['super_admin', 'admin', 'librarian'],
      create: ['super_admin', 'admin', 'librarian']
    },
    disableEdit: true,
    disableDelete: true
  },
  issueBooks: {
    path: '/issue-books',
    title: 'Issue Books',
    entity: 'Book',
    endpoint: '/books',
    fields: [],
    listFields: [
      { key: 'title', label: 'Title' },
      { key: 'author', label: 'Author' },
      { key: 'isbn', label: 'ISBN' },
      { key: 'category', label: 'Category' }
    ],
    permissions: {
      view: ['super_admin', 'admin', 'librarian']
    },
    description: 'Review library inventory and prepare issue records with your librarian workflow.'
  },
  returnBooks: {
    path: '/return-books',
    title: 'Return Books',
    entity: 'Book',
    endpoint: '/books',
    fields: [],
    listFields: [
      { key: 'title', label: 'Title' },
      { key: 'author', label: 'Author' },
      { key: 'isbn', label: 'ISBN' },
      { key: 'category', label: 'Category' }
    ],
    permissions: {
      view: ['super_admin', 'admin', 'librarian']
    },
    description: 'Track returned items and keep the library inventory up to date.'
  },
  notifications: {
    path: '/notifications',
    title: 'Notifications',
    entity: 'Notification',
    endpoint: '/notifications',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
      { name: 'recipientRoles', label: 'Recipient Roles', type: 'select', required: true, options: [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'admin', label: 'Admin' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'student', label: 'Student' },
        { value: 'family_student', label: 'Family Student' },
        { value: 'accountant', label: 'Accountant' },
        { value: 'librarian', label: 'Librarian' }
      ] }
    ],
    listFields: [
      { key: 'title', label: 'Title' },
      { key: 'message', label: 'Message' },
      { key: 'recipientRoles', label: 'Recipients' }
    ],
    searchField: 'title',
    permissions: {
      view: allRoles,
      create: ['super_admin', 'admin', 'teacher', 'accountant', 'librarian']
    },
    disableEdit: true,
    disableDelete: true
  },
  audit: {
    path: '/audit',
    title: 'Audit Logs',
    entity: 'Audit',
    endpoint: '/audit',
    fields: [],
    listFields: [
      { key: 'actor', label: 'Actor' },
      { key: 'action', label: 'Action' },
      { key: 'target', label: 'Target' },
      { key: 'createdAt', label: 'Date' }
    ],
    searchField: 'action',
    permissions: {
      view: ['super_admin', 'admin']
    },
    disableEdit: true,
    disableDelete: true
  },
  roles: {
    path: '/roles',
    title: 'Roles',
    entity: 'Role',
    endpoint: '/roles',
    fields: [],
    listFields: [
      { key: 'role', label: 'Role' }
    ],
    searchField: 'role',
    permissions: {
      view: ['super_admin']
    },
    disableEdit: true,
    disableDelete: true
  }
};

export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

const menuConfig: Record<Role, MenuItem[]> = {
  super_admin: [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: allRoles },
    { path: '/users', label: 'Users', icon: Users, roles: ['super_admin', 'admin'] },
    { path: '/students', label: 'Students', icon: Users, roles: ['super_admin', 'admin', 'teacher'] },
    { path: '/teachers', label: 'Teachers', icon: UserCheck, roles: ['super_admin', 'admin'] },
    { path: '/classes', label: 'Classes', icon: Layers, roles: ['super_admin', 'admin', 'teacher', 'student', 'family_student'] },
    { path: '/subjects', label: 'Subjects', icon: BookOpen, roles: ['super_admin', 'admin', 'teacher', 'student', 'family_student'] },
    { path: '/exams', label: 'Exams', icon: CalendarCheck, roles: ['super_admin', 'admin', 'teacher'] },
    { path: '/results', label: 'Results', icon: FileText, roles: allRoles },
    { path: '/finance', label: 'Finance', icon: DollarSign, roles: ['super_admin', 'admin', 'accountant'] },
    { path: '/reports', label: 'Reports', icon: Activity, roles: ['super_admin', 'admin', 'accountant'] },
    { path: '/expenses', label: 'Expenses', icon: CreditCard, roles: ['super_admin', 'admin', 'accountant'] },
    { path: '/books', label: 'Books', icon: BookOpen, roles: ['super_admin', 'admin', 'librarian'] },
    { path: '/audit', label: 'Audit', icon: ClipboardList, roles: ['super_admin', 'admin'] },
    { path: '/roles', label: 'Roles', icon: ShieldCheck, roles: ['super_admin'] },
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: allRoles },
    { path: '/profile', label: 'Profile', icon: Settings, roles: allRoles }
  ],
  admin: [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: allRoles },
    { path: '/users', label: 'Users', icon: Users, roles: ['super_admin', 'admin'] },
    { path: '/students', label: 'Students', icon: Users, roles: ['super_admin', 'admin', 'teacher'] },
    { path: '/teachers', label: 'Teachers', icon: UserCheck, roles: ['super_admin', 'admin'] },
    { path: '/classes', label: 'Classes', icon: Layers, roles: ['super_admin', 'admin', 'teacher', 'student', 'family_student'] },
    { path: '/subjects', label: 'Subjects', icon: BookOpen, roles: ['super_admin', 'admin', 'teacher', 'student', 'family_student'] },
    { path: '/exams', label: 'Exams', icon: CalendarCheck, roles: ['super_admin', 'admin', 'teacher'] },
    { path: '/results', label: 'Results', icon: FileText, roles: allRoles },
    { path: '/finance', label: 'Finance', icon: DollarSign, roles: ['super_admin', 'admin', 'accountant'] },
    { path: '/reports', label: 'Reports', icon: Activity, roles: ['super_admin', 'admin', 'accountant'] },
    { path: '/expenses', label: 'Expenses', icon: CreditCard, roles: ['super_admin', 'admin', 'accountant'] },
    { path: '/books', label: 'Books', icon: BookOpen, roles: ['super_admin', 'admin', 'librarian'] },
    { path: '/audit', label: 'Audit', icon: ClipboardList, roles: ['super_admin', 'admin'] },
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: allRoles },
    { path: '/profile', label: 'Profile', icon: Settings, roles: allRoles }
  ],
  teacher: [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: allRoles },
    { path: '/students', label: 'Students', icon: Users, roles: ['super_admin', 'admin', 'teacher'] },
    { path: '/classes', label: 'Classes', icon: Layers, roles: ['super_admin', 'admin', 'teacher', 'student', 'family_student'] },
    { path: '/subjects', label: 'Subjects', icon: BookOpen, roles: ['super_admin', 'admin', 'teacher', 'student', 'family_student'] },
    { path: '/exams', label: 'Exams', icon: CalendarCheck, roles: ['super_admin', 'admin', 'teacher'] },
    { path: '/results', label: 'Results', icon: FileText, roles: allRoles },
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: allRoles },
    { path: '/profile', label: 'Profile', icon: Settings, roles: allRoles }
  ],
  student: [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: allRoles },
    { path: '/results', label: 'My Results', icon: FileText, roles: allRoles },
    { path: '/classes', label: 'My Class', icon: Layers, roles: allRoles },
    { path: '/subjects', label: 'Subjects', icon: BookOpen, roles: allRoles },
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: allRoles },
    { path: '/profile', label: 'Profile', icon: Settings, roles: allRoles }
  ],
  user: [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: allRoles },
    { path: '/settings', label: 'Settings', icon: Settings, roles: allRoles },
    { path: '/profile', label: 'Profile', icon: Settings, roles: allRoles }
  ],
  family_student: [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: allRoles },
    { path: '/families', label: 'Families', icon: Users, roles: ['super_admin', 'admin', 'teacher', 'family_student'] },
    { path: '/results', label: 'Results', icon: FileText, roles: allRoles },
    { path: '/classes', label: 'Class', icon: Layers, roles: allRoles },
    { path: '/subjects', label: 'Subjects', icon: BookOpen, roles: allRoles },
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: allRoles },
    { path: '/profile', label: 'Profile', icon: Settings, roles: allRoles }
  ],
  accountant: [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: allRoles },
    { path: '/finance', label: 'Finance', icon: DollarSign, roles: ['super_admin', 'admin', 'accountant'] },
    { path: '/expenses', label: 'Expenses', icon: CreditCard, roles: ['super_admin', 'admin', 'accountant'] },
    { path: '/reports', label: 'Reports', icon: Activity, roles: ['super_admin', 'admin', 'accountant'] },
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: allRoles },
    { path: '/profile', label: 'Profile', icon: Settings, roles: allRoles }
  ],
  librarian: [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: allRoles },
    { path: '/books', label: 'Books', icon: BookOpen, roles: ['super_admin', 'admin', 'librarian'] },
    { path: '/issue-books', label: 'Issue Books', icon: Archive, roles: ['super_admin', 'admin', 'librarian'] },
    { path: '/return-books', label: 'Return Books', icon: Archive, roles: ['super_admin', 'admin', 'librarian'] },
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: allRoles },
    { path: '/profile', label: 'Profile', icon: Settings, roles: allRoles }
  ]
};

export function getMenuForRole(role: Role | null) {
  if (!role) return [];
  return menuConfig[role] ?? [];
}

export function getRouteLabel(role: Role | null, pathname: string) {
  const items = getMenuForRole(role);
  const item = items.find((route) => route.path === pathname);
  return item?.label || 'Dashboard';
}

export const allModuleConfigs = Object.values(modulesConfig);
