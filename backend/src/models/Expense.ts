import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' }
});

expenseSchema.index({ date: -1 });

export const Expense = mongoose.models.Expense ?? mongoose.model('Expense', expenseSchema);
