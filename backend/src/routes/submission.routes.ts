import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import db from '../config/database';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// Submit flag
router.post(
  '/',
  authenticate,
  [
    body('challenge_id').isUUID(),
    body('flag').trim().notEmpty()
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

      const { challenge_id, flag } = req.body;
      const user_id = req.user!.id;

      // Get challenge
      const challenge = await db('challenges')
        .where({ id: challenge_id, is_active: true })
        .first();

      if (!challenge) {
        const error: ApiError = new Error('Challenge not found');
        error.statusCode = 404;
        throw error;
      }

      // Check if already solved
      const existingSolve = await db('submissions')
        .where({
          challenge_id,
          user_id,
          is_correct: true
        })
        .first();

      if (existingSolve) {
        const error: ApiError = new Error('Challenge already solved');
        error.statusCode = 409;
        throw error;
      }

      // Check max attempts if configured
      if (challenge.max_attempts) {
        const attemptCount = await db('submissions')
          .where({ challenge_id, user_id })
          .count('* as count')
          .first();

        if (parseInt(String(attemptCount?.count ?? '0'), 10) >= challenge.max_attempts) {
          const error: ApiError = new Error(
            `Maximum attempts (${challenge.max_attempts}) exceeded for this challenge`
          );
          error.statusCode = 429;
          throw error;
        }
      }

      // Import flag verification utility
      const { verifyFlag } = await import('../utils/flagUtils');
      
      // Verify flag against stored hash (timing-safe comparison)
      const is_correct = verifyFlag(flag, challenge.flag_hash);
      let points_awarded = 0;
      let is_first_blood = false;

      if (is_correct) {
        // Check for first blood
        const firstSolve = await db('submissions')
          .where({ challenge_id, is_correct: true })
          .first();

        is_first_blood = !firstSolve;

        // Calculate points
        points_awarded = challenge.points;
        if (is_first_blood) {
          points_awarded += parseInt(process.env.FIRST_BLOOD_BONUS || '50');
        }

        // Deduct hint penalties
        const hintsUsed = await db('hint_unlocks')
          .join('hints', function() {
            this.on('hint_unlocks.challenge_id', '=', 'hints.challenge_id')
                .andOn('hint_unlocks.hint_index', '=', 'hints.order')
          })
          .where({
            'hint_unlocks.user_id': user_id,
            'hint_unlocks.challenge_id': challenge_id
          })
          .sum('hints.penalty_points as total_penalty');

        if (hintsUsed[0]?.total_penalty) {
          points_awarded -= hintsUsed[0].total_penalty;
          points_awarded = Math.max(points_awarded, 0);
        }
      }

      // Get user's team
      const teamMember = await db('team_members')
        .where({ user_id })
        .first();

      // Create submission
      const [submission] = await db('submissions')
        .insert({
          challenge_id,
          user_id,
          team_id: teamMember?.team_id || null,
          submitted_flag: flag,
          is_correct,
          points_awarded,
          is_first_blood
        })
        .returning('*');

      // Update scoreboard cache if correct
      if (is_correct) {
        await updateScoreboardCache(user_id, teamMember?.team_id);
      }

      res.status(is_correct ? 200 : 400).json({
        success: is_correct,
        correct: is_correct,
        points_awarded,
        is_first_blood,
        message: is_correct
          ? is_first_blood
            ? '🩸 First Blood! Flag correct!'
            : '✅ Flag correct!'
          : '❌ Incorrect flag'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Helper function to update scoreboard
async function updateScoreboardCache(user_id: string, team_id?: string) {
  try {
    // Update user cache - use 1 for MSSQL boolean compatibility
    const userStats = await db('submissions')
      .where({ user_id, is_correct: 1 })
      .select(
        db.raw('SUM(points_awarded) as total_points'),
        db.raw('COUNT(DISTINCT challenge_id) as challenges_solved'),
        db.raw('MAX(submitted_at) as last_solve_time')
      )
      .first();

    // Check if user cache exists
    const existingUserCache = await db('scoreboard_cache')
      .where({ user_id })
      .first();

    if (existingUserCache) {
      // Update existing
      await db('scoreboard_cache')
        .where({ user_id })
        .update({
          total_points: userStats.total_points || 0,
          challenges_solved: userStats.challenges_solved || 0,
          last_solve_time: userStats.last_solve_time,
          updated_at: db.fn.now()
        });
    } else {
      // Insert new
      await db('scoreboard_cache').insert({
        user_id,
        team_id: null,
        total_points: userStats.total_points || 0,
        challenges_solved: userStats.challenges_solved || 0,
        last_solve_time: userStats.last_solve_time
      });
    }

    // Update team cache if applicable
    if (team_id) {
      const teamStats = await db('submissions')
        .where({ team_id, is_correct: 1 })
        .select(
          db.raw('SUM(points_awarded) as total_points'),
          db.raw('COUNT(DISTINCT challenge_id) as challenges_solved'),
          db.raw('MAX(submitted_at) as last_solve_time')
        )
        .first();

      // Check if team cache exists
      const existingTeamCache = await db('scoreboard_cache')
        .where({ team_id })
        .first();

      if (existingTeamCache) {
        // Update existing
        await db('scoreboard_cache')
          .where({ team_id })
          .update({
            total_points: teamStats.total_points || 0,
            challenges_solved: teamStats.challenges_solved || 0,
            last_solve_time: teamStats.last_solve_time,
            updated_at: db.fn.now()
          });
      } else {
        // Insert new
        await db('scoreboard_cache').insert({
          user_id: null,
          team_id,
          total_points: teamStats.total_points || 0,
          challenges_solved: teamStats.challenges_solved || 0,
          last_solve_time: teamStats.last_solve_time
        });
      }
    }
  } catch (error) {
    // Log error but don't throw - scoreboard update shouldn't fail submission
    console.error('Error updating scoreboard cache:', error);
  }
}

// Get user's submissions
router.get('/my-submissions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const submissions = await db('submissions')
      .join('challenges', 'submissions.challenge_id', 'challenges.id')
      .where({ 'submissions.user_id': req.user!.id })
      .select(
        'submissions.*',
        'challenges.title as challenge_title',
        'challenges.category'
      )
      .orderBy('submissions.submitted_at', 'desc');

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
});

export default router;
