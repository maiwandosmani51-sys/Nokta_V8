import mongoose from 'mongoose';

function generateClassCode() {
  return `CLS-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-4)}`;
}

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  classCode: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    default: generateClassCode,
    set: (value: any) => {
      if (value === null || value === undefined || value === '') return undefined;
      return value;
    }
  },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  assignedTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  studentCount: { type: Number, default: 0 },
  examSchedule: [{ type: Date }],
  capacity: { type: Number, default: 30 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

classSchema.pre('validate', function (next) {
  if (!this.classCode) {
    this.classCode = generateClassCode();
  }
  next();
});

classSchema.index({ name: 1 });

export const ClassModel = mongoose.models.Class ?? mongoose.model('Class', classSchema);
