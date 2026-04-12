import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, trim: true },
  target: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

auditLogSchema.index({ actor: 1, createdAt: -1 });

export const AuditLog = mongoose.models.AuditLog ?? mongoose.model('AuditLog', auditLogSchema);
