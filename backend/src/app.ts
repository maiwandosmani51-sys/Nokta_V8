import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import { connectDatabase } from './database';
import { config } from './config';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth';
import { userRouter } from './modules/users';
import { studentRouter } from './modules/students';
import { teacherRouter } from './modules/teachers';
import { classRouter } from './modules/classes';
import { subjectRouter } from './modules/subjects';
import { examRouter } from './modules/exams';
import { resultRouter } from './modules/results';
import { financeRouter } from './modules/finance';
import { expenseRouter } from './modules/expenses';
import { familyRouter } from './modules/families';
import { bookRouter } from './modules/books';
import { auditRouter } from './modules/audit';
import { notificationRouter } from './modules/notifications';
import { roleRouter } from './modules/roles';
import { permissionsRouter } from './modules/permissions';
import { dashboardRouter } from './modules/dashboard';
import adminRouter from './modules/admin';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '20kb' }));
app.use(morgan('tiny'));
app.use(rateLimiter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Nokta Academy Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      students: '/api/students',
      teachers: '/api/teachers',
      classes: '/api/classes',
      subjects: '/api/subjects',
      exams: '/api/exams',
      results: '/api/results',
      finance: '/api/finance',
      expenses: '/api/expenses',
      families: '/api/families',
      books: '/api/books',
      audit: '/api/audit',
      notifications: '/api/notifications',
      roles: '/api/roles',
      permissions: '/api/permissions',
      dashboard: '/api/dashboard'
    }
  });
});

app.get('/manifest.webmanifest', (req, res) => {
  res.json({
    name: 'Nokta Academy Backend',
    short_name: 'Nokta Backend',
    description: 'Backend API for Nokta Academy',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000'
  });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/students', studentRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/classes', classRouter);
app.use('/api/subjects', subjectRouter);
app.use('/api/exams', examRouter);
app.use('/api/results', resultRouter);
app.use('/api/finance', financeRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/families', familyRouter);
app.use('/api/books', bookRouter);
app.use('/api/audit', auditRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/roles', roleRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRouter);

app.use(errorHandler);

export async function createApp() {
  await connectDatabase();
  return app;
}
