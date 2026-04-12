const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nokta_academy';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ['super_admin', 'admin', 'teacher', 'student', 'family_student', 'accountant', 'librarian'] },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const subjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  code: { type: String, required: true, trim: true, unique: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  capacity: { type: Number, default: 30 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
const ClassModel = mongoose.models.Class || mongoose.model('Class', classSchema);

async function main() {
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB:', mongoUri);

  console.log('Removing existing students, teachers, classes, and subjects...');
  await Promise.all([
    User.deleteMany({ role: { $in: ['student', 'teacher'] } }),
    ClassModel.deleteMany({}),
    Subject.deleteMany({})
  ]);

  const teacherPassword = 'Teacher123!';
  const teacherHash = await bcrypt.hash(teacherPassword, 10);

  const teachersData = [
    { name: 'Sara Nazari', email: 'teacher1@nokta.com', role: 'teacher' },
    { name: 'Amir Hosseini', email: 'teacher2@nokta.com', role: 'teacher' },
    { name: 'Leyla Rahimi', email: 'teacher3@nokta.com', role: 'teacher' },
    { name: 'Navid Azimi', email: 'teacher4@nokta.com', role: 'teacher' },
    { name: 'Mina Karimi', email: 'teacher5@nokta.com', role: 'teacher' }
  ];

  const teachers = [];
  for (const teacher of teachersData) {
    const created = await User.create({ ...teacher, password: teacherHash, active: true });
    console.log(`Created teacher: ${teacher.email}`);
    teachers.push(created.toObject());
  }

  const subjectsData = [
    { title: 'Mathematics', code: 'MATH101', teacherIndex: 0, description: 'Core class for algebra and geometry.' },
    { title: 'Physics', code: 'PHYS201', teacherIndex: 1, description: 'Mechanics, energy, and experimental science.' },
    { title: 'Chemistry', code: 'CHEM301', teacherIndex: 2, description: 'Fundamentals of chemical reactions and laboratory work.' },
    { title: 'English Literature', code: 'ENG401', teacherIndex: 3, description: 'Reading, writing, and language skills development.' },
    { title: 'History', code: 'HIST501', teacherIndex: 4, description: 'Social studies, culture and national history.' }
  ];

  const subjects = [];
  for (const subject of subjectsData) {
    const created = await Subject.create({
      title: subject.title,
      code: subject.code,
      teacher: teachers[subject.teacherIndex]._id,
      description: subject.description
    });
    console.log(`Created subject: ${subject.code}`);
    subjects.push(created.toObject());
  }

  const classesData = [
    { name: '10A', teacherIndex: 0, subjectIndexes: [0, 3], capacity: 28 },
    { name: '10B', teacherIndex: 1, subjectIndexes: [1, 4], capacity: 26 },
    { name: '11A', teacherIndex: 2, subjectIndexes: [2, 0], capacity: 30 },
    { name: '11B', teacherIndex: 3, subjectIndexes: [3, 1], capacity: 27 },
    { name: '12A', teacherIndex: 4, subjectIndexes: [4, 2], capacity: 25 }
  ];

  const classes = [];
  for (const klass of classesData) {
    const subjectIds = klass.subjectIndexes.map((index) => subjects[index]._id);
    const created = await ClassModel.create({
      name: klass.name,
      teacher: teachers[klass.teacherIndex]._id,
      subjectIds,
      capacity: klass.capacity,
      active: true
    });
    console.log(`Created class: ${klass.name}`);
    classes.push(created.toObject());
  }

  const studentData = [
    { name: 'Student One', email: 'student1@nokta.com', password: 'Student123!', classIndex: 0, teacherIndex: 0 },
    { name: 'Student Two', email: 'student2@nokta.com', password: 'Student123!', classIndex: 1, teacherIndex: 1 },
    { name: 'Student Three', email: 'student3@nokta.com', password: 'Student123!', classIndex: 2, teacherIndex: 2 },
    { name: 'Student Four', email: 'student4@nokta.com', password: 'Student123!', classIndex: 3, teacherIndex: 3 },
    { name: 'Student Five', email: 'student5@nokta.com', password: 'Student123!', classIndex: 4, teacherIndex: 4 }
  ];

  for (const student of studentData) {
    const hashed = await bcrypt.hash(student.password, 10);
    const created = await User.create({
      name: student.name,
      email: student.email,
      password: hashed,
      role: 'student',
      classId: classes[student.classIndex]._id,
      teacherId: teachers[student.teacherIndex]._id,
      active: true
    });
    console.log(`Created student: ${student.email} assigned to class ${classes[student.classIndex].name}`);
  }

  console.log('Reset complete: all students, teachers, subjects, and classes rebuilt.');
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Failed to reset academy data:', error);
  process.exit(1);
});
