import mongoose from 'mongoose';
import type { RoleType } from '../types';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ['super_admin', 'admin', 'teacher', 'student', 'family_student', 'family', 'accountant', 'librarian'] as RoleType[] },
  permissions: {
    type: Map,
    of: [String],
    default: {}
  },
  // Teacher fields
  teacherId: { type: String, unique: true, sparse: true },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  whatsapp: { type: String, trim: true },
  address: { type: String, trim: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  joinDate: { type: Date, default: Date.now },
  profileImage: { type: String },
  salaryType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
  fixedSalary: { type: Number, default: 0 },
  percentageRate: { type: Number, default: 35 }, // default preset
  customPercentage: { type: Number },
  walletBalance: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  totalSalaryEarned: { type: Number, default: 0 },
  assignedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  // Student fields
  studentId: { type: String, unique: true, sparse: true },
  fatherName: { type: String, trim: true },
  registrationDate: { type: Date, default: Date.now },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  assignedTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  feeAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ email: 1 });

export const User = mongoose.models.User ?? mongoose.model('User', userSchema);
