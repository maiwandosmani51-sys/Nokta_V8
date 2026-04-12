import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  familyPhone: { type: String, required: true, trim: true },
  registrationDate: { type: Date, default: Date.now },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feeAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
  createdAt: { type: Date, default: Date.now }
});

studentSchema.index({ studentId: 1 });
studentSchema.index({ familyId: 1 });
studentSchema.index({ teacherId: 1 });

studentSchema.pre('save', function(next) {
  this.remainingBalance = this.feeAmount - this.paidAmount;
  next();
});

export const Student = mongoose.models.Student ?? mongoose.model('Student', studentSchema);