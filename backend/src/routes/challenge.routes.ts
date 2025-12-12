import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import db from '../config/database';

const router = Router();

// Get all challenges
router.get('/', async (req, res, next) => {
  try {
    const challenges = await db('challenges')
      .where({ is_active: true })
      .select(
        'id',
        'title',
        'description',
        'difficulty',
        'category',
        'points',
        'metadata',
        'created_at'
      )
      .orderBy('difficulty')
      .orderBy('points');

    // Get solve counts for each challenge
    const solveCounts = await db('submissions')
      .select('challenge_id')
      .count('* as solves')
      .where({ is_correct: true })
      .groupBy('challenge_id');

    const solveMap = Object.fromEntries(
      solveCounts.map((s: any) => [s.challenge_id, parseInt(s.solves)])
    );

    const challengesWithStats = challenges.map((c: any) => ({
      ...c,
      metadata: typeof c.metadata === 'string' ? JSON.parse(c.metadata) : c.metadata,
      solves: solveMap[c.id] || 0
    }));

    res.json({
      success: true,
      challenges: challengesWithStats
    });
  } catch (error) {
    next(error);
  }
});

// Get single challenge
router.get('/:id', async (req, res, next): Promise<void> => {
  try {
    const challenge = await db('challenges')
      .where({ id: req.params.id, is_active: true })
      .select('*')
      .first();

    if (!challenge) {
      res.status(404).json({
        success: false,
        error: { message: 'Challenge not found' }
      });
      return;
    }

    // Get hints
    const hints = await db('hints')
      .where({ challenge_id: challenge.id })
      .select('id', 'penalty_points', 'order')
      .orderBy('order');

    // Get files
    const files = await db('challenge_files')
      .where({ challenge_id: challenge.id })
      .select('id', 'filename', 'file_type', 'description');

    // Remove flag_hash from response (security - never expose to client)
    delete challenge.flag_hash;

    // Parse metadata if it's a string (MSSQL stores JSON as string)
    if (typeof challenge.metadata === 'string') {
      challenge.metadata = JSON.parse(challenge.metadata);
    }

    res.json({
      success: true,
      challenge: {
        ...challenge,
        hints,
        files
      }
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// Get hints for a challenge
router.get('/:id/hints', authenticate, async (req, res, next) => {
  try {
    const hints = await db('hints')
      .where({ challenge_id: req.params.id })
      .select('id', 'content', 'penalty_points', 'order')
      .orderBy('order');

    res.json({
      success: true,
      data: hints
    });
  } catch (error) {
    next(error);
  }
});

// Unlock a hint (deduct points)
router.post('/:id/hints/:hintIndex', authenticate, async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const challengeId = req.params.id;
    const hintIndex = parseInt(req.params.hintIndex);

    // Get challenge metadata
    const challenge = await db('challenges')
      .where({ id: challengeId })
      .first();

    if (!challenge) {
      res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
      return;
    }

    // Parse metadata
    const metadata = typeof challenge.metadata === 'string' 
      ? JSON.parse(challenge.metadata) 
      : challenge.metadata;

    if (!metadata?.hints || !metadata.hints[hintIndex]) {
      res.status(404).json({
        success: false,
        error: 'Hint not found'
      });
      return;
    }

    const hint = metadata.hints[hintIndex];
    const cost = hint.cost || 0;

    // Check if hint already unlocked
    const existingUnlock = await db('hint_unlocks')
      .where({
        user_id: userId,
        challenge_id: challengeId,
        hint_index: hintIndex
      })
      .first();

    if (existingUnlock) {
      res.status(400).json({
        success: false,
        error: 'Hint already unlocked'
      });
      return;
    }

    // Record hint unlock
    await db('hint_unlocks').insert({
      user_id: userId,
      challenge_id: challengeId,
      hint_index: hintIndex,
      points_deducted: cost
    });

    // Update user's scoreboard cache (deduct points)
    const userCache = await db('scoreboard_cache')
      .where({ user_id: userId })
      .first();

    if (userCache) {
      await db('scoreboard_cache')
        .where({ user_id: userId })
        .update({
          total_points: Math.max(0, userCache.total_points - cost),
          updated_at: db.fn.now()
        });
    }

    res.json({
      success: true,
      hint: hint.text,
      points_deducted: cost
    });
  } catch (error) {
    next(error);
  }
});

// Get unlocked hints for a user on a specific challenge
router.get('/:id/unlocked-hints', authenticate, async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const challengeId = req.params.id;

    const unlockedHints = await db('hint_unlocks')
      .where({
        user_id: userId,
        challenge_id: challengeId
      })
      .select('hint_index')
      .orderBy('hint_index');

    res.json({
      success: true,
      unlockedHints: unlockedHints.map(h => h.hint_index)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
