import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { validate } from '../middleware/validate';
import { createResponse, createError } from '../utils/response';
import { User } from '../models/User';
import { config } from '../config';
import { authenticate } from '../middleware/auth';
import type { RoleType } from '../types.d';

const router = Router();

const authSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
});

function signToken(payload: { userId: string; role: RoleType }, secret: string, expiresIn: string) {
  return jwt.sign(payload, secret as any, { expiresIn: expiresIn } as any);
}

const authService = {
  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password').lean() as any;
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    return user;
  }
};

router.post('/login', validate(authSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('LOGIN BODY:', req.body);

    const user = await User.findOne({ email }).select('+password');

    console.log('USER FOUND:', user);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password as string);

    console.log('PASSWORD MATCH:', passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid password'
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      config.jwtSecret,
      {
        expiresIn: '7d'
      }
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      classId: user.classId,
      teacherId: user.teacherId,
      familyId: user.familyId,
      fee: user.fee,
      salaryType: user.salaryType,
      salaryValue: user.salaryValue,
      active: user.active,
      createdAt: user.createdAt
    };

    return res.status(200).json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.body.refreshToken;
    if (!token) return res.status(400).json(createError('Refresh token missing'));
    const payload = jwt.verify(token, config.refreshSecret) as { userId: string; role: RoleType };
    const user = await User.findById(payload.userId).lean();
    if (!user) return res.status(401).json(createError('Invalid refresh token'));
    const accessToken = signToken({ userId: payload.userId, role: payload.role }, config.jwtSecret, config.jwtExpiresIn);
    res.json(createResponse({ accessToken }));
  } catch (error) {
    return res.status(401).json(createError('Refresh token invalid')); 
  }
});

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json(createError('Authentication required'));
    const user = await User.findById(req.user.userId).select('-password').lean() as any;
    if (!user) return res.status(404).json(createError('User not found'));
    res.json(createResponse(user));
  } catch (error) {
    next(error);
  }
});

export const authRouter = router;
