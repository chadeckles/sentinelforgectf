import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import db from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { hashFlag, isValidFlagFormat } from '../utils/flagUtils';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Get all users with statistics
router.get('/users', async (req: AuthRequest, res, next) => {
  try {
    const users = await db('users')
      .leftJoin('scoreboard_cache', 'users.id', 'scoreboard_cache.user_id')
      .select(
        'users.*',
        'scoreboard_cache.total_points',
        'scoreboard_cache.challenges_solved'
      )
      .orderBy('users.created_at', 'desc');

    res.json({
      success: true,
      data: users.map((u: any) => {
        delete u.password_hash;
        return u;
      })
    });
  } catch (error) {
    next(error);
  }
});

// Create new challenge (with flag hashing)
router.post(
  '/challenges',
  [
    body('title').trim().isLength({ min: 3, max: 200 }),
    body('description').trim().notEmpty(),
    body('type').isIn(['qa', 'repo', 'terraform', 'container', 'file_upload', 'multi_part']),
    body('difficulty').isIn(['easy', 'medium', 'hard', 'expert']),
    body('category').trim().notEmpty(),
    body('points').isInt({ min: 1 }),
    body('flag').trim().notEmpty().custom(isValidFlagFormat),
    body('max_attempts').optional().isInt({ min: 1 })
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

      const {
        title,
        description,
        type,
        difficulty,
        category,
        points,
        flag,
        max_attempts,
        metadata
      } = req.body as any;

      // Hash the flag before storing
      const flag_hash = hashFlag(flag);

      const [challenge] = await db('challenges')
        .insert({
          title,
          description,
          type,
          difficulty,
          category,
          points,
          flag_hash, // Store only the hash
          max_attempts,
          metadata,
          is_active: true
        })
        .returning('*');

      // Don't return the hash in response
      delete challenge.flag_hash;

      res.status(201).json({
        success: true,
        data: challenge,
        message: 'Challenge created successfully. Flag has been securely hashed.'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Platform statistics
router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const [stats] = await db.raw(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
        (SELECT COUNT(*) FROM teams) as total_teams,
        (SELECT COUNT(*) FROM challenges WHERE is_active = true) as total_challenges,
        (SELECT COUNT(*) FROM submissions) as total_submissions,
        (SELECT COUNT(*) FROM submissions WHERE is_correct = true) as correct_submissions,
        (SELECT COUNT(DISTINCT user_id) FROM submissions WHERE is_correct = true) as users_with_solves
    `);

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export default router;
