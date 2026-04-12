import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, required: true, unique: true, trim: true },
  available: { type: Boolean, default: true },
  category: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now }
});

bookSchema.index({ title: 1, isbn: 1 });

export const Book = mongoose.models.Book ?? mongoose.model('Book', bookSchema);
