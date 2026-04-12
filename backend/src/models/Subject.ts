import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  code: { type: String, required: true, trim: true, unique: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  feeAmount: { type: Number, required: true, default: 0 },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examCount: { type: Number, default: 0 },
  activeStatus: { type: Boolean, default: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

subjectSchema.index({ title: 1, code: 1 });

export const Subject = mongoose.models.Subject ?? mongoose.model('Subject', subjectSchema);
