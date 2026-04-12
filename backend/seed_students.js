const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nokta_academy';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ['super_admin', 'admin', 'teacher', 'student', 'family_student', 'accountant', 'librarian'] },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function main() {
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB:', mongoUri);

  const password = 'Student123!';
  const hashed = await bcrypt.hash(password, 10);

  const students = Array.from({ length: 30 }).map((_, index) => {
    const id = index + 1;
    return {
      name: `Student ${id}`,
      email: `student${id}@nokta.com`,
      password: hashed,
      role: 'student',
      active: true
    };
  });

  for (const student of students) {
    const existing = await User.findOne({ email: student.email }).lean();
    if (existing) {
      console.log(`Already exists: ${student.email}`);
      continue;
    }
    await User.create(student);
    console.log(`Created student: ${student.email}`);
  }

  console.log('Seed complete: 30 student accounts are now present.');
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Failed to seed students:', error);
  process.exit(1);
});
