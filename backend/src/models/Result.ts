import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  score: { type: Number, required: true },
  grade: { type: String, required: true },
  remarks: { type: String, default: '' },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

resultSchema.index({ student: 1, exam: 1 }, { unique: true });

export const Result = mongoose.models.Result ?? mongoose.model('Result', resultSchema);
