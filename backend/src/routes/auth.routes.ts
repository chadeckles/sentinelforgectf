import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import db from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).isAlphanumeric(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('country').optional().isLength({ max: 3 }),
    body('affiliation').optional().isLength({ max: 100 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error: ApiError = new Error('Validation failed');
        error.statusCode = 400;
        error.errors = errors.array();
        throw error;
      }

      const { username, email, password, country, affiliation } = req.body;

      // Check if user already exists
      const existingUser = await db('users')
        .where({ email })
        .orWhere({ username })
        .first();

      if (existingUser) {
        const error: ApiError = new Error('User already exists');
        error.statusCode = 409;
        throw error;
      }

      // Hash password
      const password_hash = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_ROUNDS || '12')
      );

      // Create user
      const [user] = await db('users')
        .insert({
          username,
          email,
          password_hash,
          country,
          affiliation,
          role: 'user'
        })
        .returning(['id', 'username', 'email', 'role', 'created_at']);

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        token,
        user
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error: ApiError = new Error('Validation failed');
        error.statusCode = 400;
        error.errors = errors.array();
        throw error;
      }

      const { email, password } = req.body;

      // Find user
      const user = await db('users').where({ email }).first();

      if (!user || !user.is_active) {
        const error: ApiError = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        const error: ApiError = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      // Update last login
      await db('users').where({ id: user.id }).update({ last_login: db.fn.now() });

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          country: user.country,
          affiliation: user.affiliation
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await db('users')
      .where({ id: req.user!.id })
      .first();

    if (!user) {
      const error: ApiError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Get user's score from scoreboard cache
    const scoreData = await db('scoreboard_cache')
      .where({ user_id: user.id })
      .first();

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        country: user.country,
        affiliation: user.affiliation,
        score: scoreData?.total_points || 0,
        solves: scoreData?.challenges_solved || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put(
  '/profile',
  authenticate,
  [
    body('country').optional().isLength({ max: 3 }),
    body('affiliation').optional().isLength({ max: 100 }),
    body('currentPassword').optional().notEmpty(),
    body('newPassword').optional().isLength({ min: 8 })
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error: ApiError = new Error('Validation failed');
        error.statusCode = 400;
        error.errors = errors.array();
        throw error;
      }

      const { country, affiliation, currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      // Get current user
      const user = await db('users').where({ id: userId }).first();

      if (!user) {
        const error: ApiError = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      // Prepare update data
      const updateData: any = {};

      if (country !== undefined) updateData.country = country || null;
      if (affiliation !== undefined) updateData.affiliation = affiliation || null;

      // Handle password change
      if (currentPassword && newPassword) {
        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isValid) {
          const error: ApiError = new Error('Current password is incorrect');
          error.statusCode = 401;
          throw error;
        }

        // Hash new password
        updateData.password_hash = await bcrypt.hash(
          newPassword,
          parseInt(process.env.BCRYPT_ROUNDS || '12')
        );
      } else if (currentPassword || newPassword) {
        const error: ApiError = new Error('Both current and new password are required');
        error.statusCode = 400;
        throw error;
      }

      // Update user
      await db('users').where({ id: userId }).update(updateData);

      // Fetch updated user
      const updatedUser = await db('users').where({ id: userId }).first();

      // Get user's score
      const scoreData = await db('scoreboard_cache')
        .where({ user_id: userId })
        .first();

      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          country: updatedUser.country,
          affiliation: updatedUser.affiliation,
          score: scoreData?.total_points || 0,
          solves: scoreData?.challenges_solved || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
