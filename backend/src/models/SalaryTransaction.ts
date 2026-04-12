import mongoose from 'mongoose';

const salaryTransactionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  feeAmount: { type: Number, required: true },
  percentage: { type: Number, required: true },
  earnedAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

salaryTransactionSchema.index({ teacherId: 1, createdAt: -1 });
salaryTransactionSchema.index({ studentId: 1 });

export const SalaryTransaction = mongoose.models.SalaryTransaction ?? mongoose.model('SalaryTransaction', salaryTransactionSchema);