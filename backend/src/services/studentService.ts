import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Student } from '../models/Student';
import { Family } from '../models/Family';
import { SalaryTransaction } from '../models/SalaryTransaction';
import { User } from '../models/User';
import { UserService } from './userService';

export class StudentService {
  private userService = new UserService();

  async registerStudent(data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if family exists by phone
      let family = await Family.findOne({ guardianPhone: data.familyPhone }).session(session);
      let familyUser: any = null;

      if (!family) {
        // Create family
        const normalizedFatherName = data.fatherName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'parent';
        let familyEmail = `${normalizedFatherName}@gmail.com`;
        let suffix = 1;
        while (await User.findOne({ email: familyEmail }).session(session)) {
          familyEmail = `${normalizedFatherName}${suffix}@gmail.com`;
          suffix++;
        }
        family = await Family.create([{
          guardianName: data.fatherName,
          guardianEmail: familyEmail,
          guardianPhone: data.familyPhone,
          students: []
        }], { session });

        // Create family user account
        familyUser = await User.create([{
          name: data.fatherName,
          email: familyEmail,
          phone: data.familyPhone,
          password: await bcrypt.hash(data.familyPhone, 10),
          role: 'family'
        }], { session });
      } else {
        familyUser = await User.findOne({ email: family.guardianEmail }).session(session);
      }

      // Generate studentId
      const studentId = this.generateStudentId();

      // Create student
      const student = await Student.create([{
        studentId,
        firstName: data.firstName,
        lastName: data.lastName,
        fatherName: data.fatherName,
        familyPhone: data.familyPhone,
        classId: data.classId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        feeAmount: data.feeAmount,
        paidAmount: data.paidAmount || 0,
        remainingBalance: data.feeAmount - (data.paidAmount || 0),
        familyId: family._id
      }], { session });

      // Add student to family
      await Family.findByIdAndUpdate(family._id, { $push: { students: student[0]._id } }, { session });

      // Calculate teacher salary
      const teacher = await User.findById(data.teacherId).session(session);
      if (!teacher) throw new Error('Teacher not found');

      let earnedAmount = 0;
      if (teacher.salaryType === 'percentage') {
        const percentage = teacher.customPercentage || teacher.percentageRate;
        earnedAmount = (data.feeAmount * percentage) / 100;
      } else {
        // Fixed salary, perhaps monthly, not per student
        // For now, skip or handle differently
      }

      if (earnedAmount > 0) {
        // Create salary transaction
        await SalaryTransaction.create([{
          teacherId: data.teacherId,
          studentId: student[0]._id,
          subjectId: data.subjectId,
          classId: data.classId,
          feeAmount: data.feeAmount,
          percentage: teacher.customPercentage || teacher.percentageRate,
          earnedAmount
        }], { session });

        // Update teacher wallet and totals
        await User.findByIdAndUpdate(data.teacherId, {
          $inc: {
            walletBalance: earnedAmount,
            totalSalaryEarned: earnedAmount,
            totalStudents: 1
          }
        }, { session });
      }

      await session.commitTransaction();
      return student[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private generateStudentId() {
    return 'S' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
  }

  async getStudentsByFamily(familyId: string) {
    return Student.find({ familyId });
  }

  async getStudentsByTeacher(teacherId: string) {
    return Student.find({ teacherId });
  }
}