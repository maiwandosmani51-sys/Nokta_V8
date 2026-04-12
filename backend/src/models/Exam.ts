import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  passingMarks: { type: Number, default: 40 },
  examType: { type: String, enum: ['midterm', 'final', 'quiz'], default: 'midterm' },
  examCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

examSchema.index({ date: 1, subject: 1 });

export const Exam = mongoose.models.Exam ?? mongoose.model('Exam', examSchema);
