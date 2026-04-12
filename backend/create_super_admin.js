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

const accounts = [
  { email: 'superadmin@nokta.com', password: 'SuperAdmin123!', name: 'Super Admin', role: 'super_admin' },
  { email: 'admin@nokta.com', password: 'Admin123!', name: 'Admin User', role: 'admin' },
  { email: 'teacher@nokta.com', password: 'Teacher123!', name: 'Teacher User', role: 'teacher' },
  { email: 'student@nokta.com', password: 'Student123!', name: 'Student User', role: 'student' },
  { email: 'family@nokta.com', password: 'Family123!', name: 'Family Member', role: 'family_student' },
  { email: 'accountant@nokta.com', password: 'Accountant123!', name: 'Accountant User', role: 'accountant' },
  { email: 'librarian@nokta.com', password: 'Librarian123!', name: 'Librarian User', role: 'librarian' }
];

async function main() {
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB:', mongoUri);

  for (const account of accounts) {
    const existing = await User.findOne({ email: account.email }).lean();
    if (existing) {
      console.log(`Account already exists: ${account.email}`);
      continue;
    }

    const hashed = await bcrypt.hash(account.password, 10);
    const user = await User.create({ name: account.name, email: account.email, password: hashed, role: account.role });
    console.log(`Created ${account.role} account: ${account.email}`);
  }

  console.log('\nAll accounts created successfully!');
  console.log('See account file for login credentials.');
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Failed to create accounts:', error);
  process.exit(1);
});
