import mongoose from 'mongoose';
import { createBaseSchema } from '../utils/schema';

const timetableSchema = createBaseSchema(
  {
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dayOfWeek: {
      type: String,
      enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      required: true,
      index: true
    },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    room: { type: String, trim: true, default: '' },
    deliveryMode: { type: String, enum: ['in_person', 'online', 'hybrid'], default: 'in_person' },
    onlineLink: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    active: { type: Boolean, default: true, index: true }
  },
  { collection: 'timetable' }
);

timetableSchema.index({ classId: 1, dayOfWeek: 1, startTime: 1 });
timetableSchema.index({ teacherId: 1, dayOfWeek: 1, startTime: 1 });

export const Timetable = mongoose.models.Timetable ?? mongoose.model('Timetable', timetableSchema);
