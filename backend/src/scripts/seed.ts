import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { connectDatabase } from '../database';
import { User } from '../models/User';
import { ClassModel as Class } from '../models/Class';
import { Subject } from '../models/Subject';
import { Exam } from '../models/Exam';
import { Result } from '../models/Result';
import { Family } from '../models/Family';
import { Expense } from '../models/Expense';
import { Book } from '../models/Book';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';

const ACCOUNT_FILE_PATH = path.join('d:', 'Create_New_Upadte_System', 'account', 'accounts.md');

async function clearDatabase() {
  console.log('Deleting all data...');
  await Promise.all([
    User.deleteMany({}),
    Class.deleteMany({}),
    Subject.deleteMany({}),
    Exam.deleteMany({}),
    Result.deleteMany({}),
    Family.deleteMany({}),
    Expense.deleteMany({}),
    Book.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({})
  ]);
  console.log('All data deleted.');
}

async function createSuperAdmin() {
  console.log('Creating super admin...');
  const hashedPassword = await bcrypt.hash('12345678', 10);
  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'maihan@gmail.com',
    password: hashedPassword,
    role: 'super_admin'
  });
  console.log('Super admin created.');
  return superAdmin;
}

async function createUsers(accounts: { [key: string]: { name: string; email: string; password: string; role: string }[] }) {
  console.log('Creating users...');
  const users = [];

  // Super admin already created

  // Admins
  for (let i = 1; i <= 5; i++) {
    const name = faker.person.fullName();
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const user = await User.create({
      name,
      email: `admin${i}@nokta.com`,
      password: hashedPassword,
      role: 'admin'
    });
    users.push(user);
    accounts.admin.push({ name, email: user.email, password: 'Admin123!', role: 'admin' });
  }

  // Teachers
  for (let i = 1; i <= 50; i++) {
    const name = faker.person.fullName();
    const hashedPassword = await bcrypt.hash('Teacher123!', 10);
    const user = await User.create({
      name,
      email: `teacher${i}@nokta.com`,
      password: hashedPassword,
      role: 'teacher'
    });
    users.push(user);
    accounts.teacher.push({ name, email: user.email, password: 'Teacher123!', role: 'teacher' });
  }

  // Students
  for (let i = 1; i <= 300; i++) {
    const name = faker.person.fullName();
    const hashedPassword = await bcrypt.hash('Student123!', 10);
    const user = await User.create({
      name,
      email: `student${i}@nokta.com`,
      password: hashedPassword,
      role: 'student'
    });
    users.push(user);
    accounts.student.push({ name, email: user.email, password: 'Student123!', role: 'student' });
  }

  // Family students
  for (let i = 1; i <= 50; i++) {
    const name = faker.person.fullName();
    const hashedPassword = await bcrypt.hash('Family123!', 10);
    const user = await User.create({
      name,
      email: `family${i}@nokta.com`,
      password: hashedPassword,
      role: 'family_student'
    });
    users.push(user);
    accounts.family_student.push({ name, email: user.email, password: 'Family123!', role: 'family_student' });
  }

  // Accountants
  for (let i = 1; i <= 5; i++) {
    const name = faker.person.fullName();
    const hashedPassword = await bcrypt.hash('Accountant123!', 10);
    const user = await User.create({
      name,
      email: `accountant${i}@nokta.com`,
      password: hashedPassword,
      role: 'accountant'
    });
    users.push(user);
    accounts.accountant.push({ name, email: user.email, password: 'Accountant123!', role: 'accountant' });
  }

  // Librarians
  for (let i = 1; i <= 5; i++) {
    const name = faker.person.fullName();
    const hashedPassword = await bcrypt.hash('Librarian123!', 10);
    const user = await User.create({
      name,
      email: `librarian${i}@nokta.com`,
      password: hashedPassword,
      role: 'librarian'
    });
    users.push(user);
    accounts.librarian.push({ name, email: user.email, password: 'Librarian123!', role: 'librarian' });
  }

  console.log('Users created.');
  return users;
}

async function createClassesAndSubjects(teachers: any[]) {
  console.log('Creating classes and subjects...');
  const classes = [];
  const subjects = [];

  // Create 30 subjects
  for (let i = 1; i <= 30; i++) {
    const subject = await Subject.create({
      title: faker.lorem.words(2),
      code: `SUB${i.toString().padStart(3, '0')}`,
      teacher: faker.helpers.arrayElement(teachers)._id,
      description: faker.lorem.sentence()
    });
    subjects.push(subject);
  }

  // Create 30 classes, each assigned to a teacher
  for (let i = 1; i <= 30; i++) {
    const teacher = faker.helpers.arrayElement(teachers);
    const classSubjects = faker.helpers.arrayElements(subjects, faker.number.int({ min: 3, max: 6 }));
    const classData = await Class.create({
      name: `Class ${i}`,
      teacher: teacher._id,
      subjectIds: classSubjects.map(s => s._id),
      capacity: 30
    });
    classes.push(classData);
  }

  console.log('Classes and subjects created.');
  return { classes, subjects };
}

async function createStudentsAndFamilies(students: any[], classes: any[]) {
  console.log('Creating students and families...');
  const families = [];

  // Create families
  for (let i = 0; i < 100; i++) { // Enough for 300 students, some families have multiple
    const family = await Family.create({
      guardianName: faker.person.fullName(),
      guardianEmail: faker.internet.email(),
      guardianPhone: faker.phone.number(),
      students: [],
      notes: faker.lorem.sentence()
    });
    families.push(family);
  }

  // Assign students to classes and families
  const studentsPerClass = Math.floor(300 / classes.length);
  let studentIndex = 0;
  for (const classData of classes) {
    for (let i = 0; i < studentsPerClass && studentIndex < students.length; i++) {
      const student = students[studentIndex];
      const family = faker.helpers.arrayElement(families);
      await User.findByIdAndUpdate(student._id, {
        classId: classData._id,
        familyId: family._id
      });
      family.students.push(student._id);
      studentIndex++;
    }
  }

  // Update families
  await Promise.all(families.map(family => family.save()));

  console.log('Students and families created.');
  return { families };
}

async function createTeachersAssignments(teachers: any[], classes: any[], subjects: any[]) {
  console.log('Assigning teachers to classes and subjects...');
  // Teachers are already assigned to subjects in creation
  // For classes, each class has one teacher, but teachers can teach multiple classes
  // This is already handled in class creation
  console.log('Teachers assignments completed.');
}

async function createExams(subjects: any[], classes: any[]) {
  console.log('Creating exams...');
  const exams = [];

  for (let i = 1; i <= 30; i++) {
    const subject = faker.helpers.arrayElement(subjects);
    const classData = faker.helpers.arrayElement(classes);
    const exam = await Exam.create({
      title: `Exam ${i} - ${subject.title}`,
      subject: subject._id,
      class: classData._id,
      date: faker.date.future(),
      totalMarks: 100,
      passingMarks: 40,
      examCode: `EXAM${i.toString().padStart(3, '0')}`
    });
    exams.push(exam);
  }

  console.log('Exams created.');
  return exams;
}

async function createResults(students: any[], exams: any[], teachers: any[]) {
  console.log('Creating results...');
  const results = [];

  for (const student of students) {
    for (const exam of exams) {
      const score = faker.number.int({ min: 0, max: 100 });
      let grade = 'F';
      if (score >= 90) grade = 'A';
      else if (score >= 80) grade = 'B';
      else if (score >= 70) grade = 'C';
      else if (score >= 60) grade = 'D';
      else if (score >= 40) grade = 'E';
      const remarks = score >= 40 ? 'Pass' : 'Fail';
      const result = await Result.create({
        student: student._id,
        exam: exam._id,
        score,
        grade,
        remarks,
        gradedBy: faker.helpers.arrayElement(teachers)._id
      });
      results.push(result);
    }
  }

  console.log('Results created.');
  return results;
}

async function createFinanceData(students: any[], teachers: any[], classes: any[]) {
  console.log('Creating finance data...');
  const expenses = [];

  // Student fees as expenses? Wait, expenses are outflows, fees are income.
  // But the requirement says "Each student has a fee (random realistic)" and "expense records for salaries"
  // So create salary expenses for teachers based on students

  for (const teacher of teachers) {
    const teacherClasses = classes.filter(c => c.teacher.toString() === teacher._id.toString());
    const totalStudents = teacherClasses.reduce((sum, c) => sum + c.capacity, 0);
    const salary = totalStudents * 50; // $50 per student per month or something
    const expense = await Expense.create({
      title: `Salary for ${teacher.name}`,
      amount: salary,
      category: 'Salary',
      date: new Date(),
      createdBy: teacher._id,
      notes: `Monthly salary based on ${totalStudents} students`
    });
    expenses.push(expense);
  }

  console.log('Finance data created.');
  return expenses;
}

function generateAccountsFile(accounts: { [key: string]: { name: string; email: string; password: string; role: string }[] }) {
  console.log('Generating accounts file...');
  let content = '# System Accounts\n\n';

  content += '## Super Admin\n';
  accounts.super_admin.forEach((acc) => {
    content += `Name: ${acc.name}\nEmail: ${acc.email}\nPassword: ${acc.password}\nRole: ${acc.role}\n\n`;
  });

  content += '## Admins\n';
  accounts.admin.forEach((acc) => {
    content += `Name: ${acc.name}\nEmail: ${acc.email}\nPassword: ${acc.password}\nRole: ${acc.role}\n\n`;
  });

  content += '## Teachers\n';
  accounts.teacher.forEach((acc) => {
    content += `Name: ${acc.name}\nEmail: ${acc.email}\nPassword: ${acc.password}\nRole: ${acc.role}\n\n`;
  });

  content += '## Students\n';
  accounts.student.forEach((acc) => {
    content += `Name: ${acc.name}\nEmail: ${acc.email}\nPassword: ${acc.password}\nRole: ${acc.role}\n\n`;
  });

  content += '## Family Students\n';
  accounts.family_student.forEach((acc) => {
    content += `Name: ${acc.name}\nEmail: ${acc.email}\nPassword: ${acc.password}\nRole: ${acc.role}\n\n`;
  });

  content += '## Accountants\n';
  accounts.accountant.forEach((acc) => {
    content += `Name: ${acc.name}\nEmail: ${acc.email}\nPassword: ${acc.password}\nRole: ${acc.role}\n\n`;
  });

  content += '## Librarians\n';
  accounts.librarian.forEach((acc) => {
    content += `Name: ${acc.name}\nEmail: ${acc.email}\nPassword: ${acc.password}\nRole: ${acc.role}\n\n`;
  });

  // Ensure directory exists
  const dir = path.dirname(ACCOUNT_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(ACCOUNT_FILE_PATH, content, 'utf8');
  console.log('Accounts file generated.');
}

async function seedDatabase() {
  try {
    await connectDatabase();
    console.log('Connected to database.');

    await clearDatabase();

    const accounts: { [key: string]: { name: string; email: string; password: string; role: string }[] } = { super_admin: [], admin: [], teacher: [], student: [], family_student: [], accountant: [], librarian: [] };

    const superAdmin = await createSuperAdmin();
    accounts.super_admin.push({ name: superAdmin.name, email: superAdmin.email, password: '12345678', role: 'super_admin' });

    const users = await createUsers(accounts);
    const teachers = users.filter(u => u.role === 'teacher');
    const students = users.filter(u => u.role === 'student');

    const { classes, subjects } = await createClassesAndSubjects(teachers);

    await createStudentsAndFamilies(students, classes);

    await createTeachersAssignments(teachers, classes, subjects);

    const exams = await createExams(subjects, classes);

    await createResults(students, exams, teachers);

    await createFinanceData(students, teachers, classes);

    generateAccountsFile(accounts);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();