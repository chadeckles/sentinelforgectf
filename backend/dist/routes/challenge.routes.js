"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// Get all challenges
router.get('/', async (req, res, next) => {
    try {
        const challenges = await (0, database_1.default)('challenges')
            .where({ is_active: true })
            .select('id', 'title', 'description', 'type', 'difficulty', 'category', 'points', 'metadata', 'created_at')
            .orderBy('difficulty')
            .orderBy('points');
        // Get solve counts for each challenge
        const solveCounts = await (0, database_1.default)('submissions')
            .select('challenge_id')
            .count('* as solves')
            .where({ is_correct: true })
            .groupBy('challenge_id');
        const solveMap = Object.fromEntries(solveCounts.map((s) => [s.challenge_id, parseInt(s.solves)]));
        const challengesWithStats = challenges.map((c) => ({
            ...c,
            metadata: typeof c.metadata === 'string' ? JSON.parse(c.metadata) : c.metadata,
            solves: solveMap[c.id] || 0
        }));
        res.json({
            success: true,
            challenges: challengesWithStats
        });
    }
    catch (error) {
        next(error);
    }
});
// Get single challenge
router.get('/:id', async (req, res, next) => {
    try {
        const challenge = await (0, database_1.default)('challenges')
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
        const hints = await (0, database_1.default)('hints')
            .where({ challenge_id: challenge.id })
            .select('id', 'penalty_points', 'order')
            .orderBy('order');
        // Get files
        const files = await (0, database_1.default)('challenge_files')
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
    }
    catch (error) {
        next(error);
        return;
    }
});
// Get hints for a challenge
router.get('/:id/hints', auth_1.authenticate, async (req, res, next) => {
    try {
        const hints = await (0, database_1.default)('hints')
            .where({ challenge_id: req.params.id })
            .select('id', 'content', 'penalty_points', 'order')
            .orderBy('order');
        res.json({
            success: true,
            data: hints
        });
    }
    catch (error) {
        next(error);
    }
});
// Unlock a hint (deduct points)
router.post('/:id/hints/:hintIndex', auth_1.authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const challengeId = req.params.id;
        const hintIndex = parseInt(req.params.hintIndex);
        // Get challenge metadata
        const challenge = await (0, database_1.default)('challenges')
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
        const existingUnlock = await (0, database_1.default)('hint_unlocks')
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
        await (0, database_1.default)('hint_unlocks').insert({
            user_id: userId,
            challenge_id: challengeId,
            hint_index: hintIndex,
            points_deducted: cost
        });
        // Update user's scoreboard cache (deduct points)
        const userCache = await (0, database_1.default)('scoreboard_cache')
            .where({ user_id: userId })
            .first();
        if (userCache) {
            await (0, database_1.default)('scoreboard_cache')
                .where({ user_id: userId })
                .update({
                total_points: Math.max(0, userCache.total_points - cost),
                updated_at: database_1.default.fn.now()
            });
        }
        res.json({
            success: true,
            hint: hint.text,
            points_deducted: cost
        });
    }
    catch (error) {
        next(error);
    }
});
// Get unlocked hints for a user on a specific challenge
router.get('/:id/unlocked-hints', auth_1.authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const challengeId = req.params.id;
        const unlockedHints = await (0, database_1.default)('hint_unlocks')
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=challenge.routes.js.map