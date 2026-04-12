import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/User';

export class UserService {
  private userRepository = new UserRepository();

  async createUser(data: any) {
    // Hash password
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Generate teacherId if teacher
    if (data.role === 'teacher') {
      data.teacherId = this.generateTeacherId();
    }

    // Generate studentId if family (but family is auto-created, studentId for students? Wait, students are not users now.

    // In new system, students are not separate users, only teachers and families.

    // For family, generate username/email as fatherName + phone @gmail.com with suffix for uniqueness
    if (data.role === 'family') {
      const normalizedFatherName = data.fatherName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'parent';
      let familyEmail = `${normalizedFatherName}@gmail.com`;
      let suffix = 1;
      while (await this.userRepository.findByEmail(familyEmail)) {
        familyEmail = `${normalizedFatherName}${suffix}@gmail.com`;
        suffix++;
      }
      data.email = familyEmail;
      data.password = await bcrypt.hash(data.phone, 10);
    }

    return this.userRepository.create(data);
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }
    return user;
  }

  async updateUser(id: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.userRepository.update(id, data);
  }

  private generateTeacherId() {
    return 'T' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
  }

  async getTeachers() {
    return this.userRepository.findTeachers();
  }

  async getFamilies() {
    return this.userRepository.findFamilies();
  }
}