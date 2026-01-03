import { User } from '../models/user.js';
import { generateToken } from '../config/jwt.js';
import { body } from 'express-validator';

export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .isLength({ max: 128 })
    .withMessage('Password must be less than 128 characters')
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        code: 'EMAIL_EXISTS',
        message: 'Email already registered',
        details: {}
      });
    }

    const user = await User.create(email, password);
    const token = generateToken(user.id);

    res.status(201).json({
      code: 'SUCCESS',
      message: 'User registered successfully',
      data: {
        user: { id: user.id, email: user.email },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        details: {}
      });
    }

    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        details: {}
      });
    }

    const token = generateToken(user.id);

    res.json({
      code: 'SUCCESS',
      message: 'Login successful',
      data: {
        user: { id: user.id, email: user.email },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

