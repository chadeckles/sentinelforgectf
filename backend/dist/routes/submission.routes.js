"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// Submit flag
router.post('/', auth_1.authenticate, [
    (0, express_validator_1.body)('challenge_id').isUUID(),
    (0, express_validator_1.body)('flag').trim().notEmpty()
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 400;
            error.errors = errors.array();
            throw error;
        }
        const { challenge_id, flag } = req.body;
        const user_id = req.user.id;
        // Get challenge
        const challenge = await (0, database_1.default)('challenges')
            .where({ id: challenge_id, is_active: true })
            .first();
        if (!challenge) {
            const error = new Error('Challenge not found');
            error.statusCode = 404;
            throw error;
        }
        // Check if already solved
        const existingSolve = await (0, database_1.default)('submissions')
            .where({
            challenge_id,
            user_id,
            is_correct: true
        })
            .first();
        if (existingSolve) {
            const error = new Error('Challenge already solved');
            error.statusCode = 409;
            throw error;
        }
        // Check max attempts if configured
        if (challenge.max_attempts) {
            const attemptCount = await (0, database_1.default)('submissions')
                .where({ challenge_id, user_id })
                .count('* as count')
                .first();
            if (parseInt(String(attemptCount?.count ?? '0'), 10) >= challenge.max_attempts) {
                const error = new Error(`Maximum attempts (${challenge.max_attempts}) exceeded for this challenge`);
                error.statusCode = 429;
                throw error;
            }
        }
        // Import flag verification utility
        const { verifyFlag } = await Promise.resolve().then(() => __importStar(require('../utils/flagUtils')));
        // Verify flag against stored hash (timing-safe comparison)
        const is_correct = verifyFlag(flag, challenge.flag_hash);
        let points_awarded = 0;
        let is_first_blood = false;
        if (is_correct) {
            // Check for first blood
            const firstSolve = await (0, database_1.default)('submissions')
                .where({ challenge_id, is_correct: true })
                .first();
            is_first_blood = !firstSolve;
            // Calculate points
            points_awarded = challenge.points;
            if (is_first_blood) {
                points_awarded += parseInt(process.env.FIRST_BLOOD_BONUS || '50');
            }
            // Deduct hint penalties
            const hintsUsed = await (0, database_1.default)('hint_unlocks')
                .join('hints', function () {
                this.on('hint_unlocks.challenge_id', '=', 'hints.challenge_id')
                    .andOn('hint_unlocks.hint_index', '=', 'hints.order');
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
        const teamMember = await (0, database_1.default)('team_members')
            .where({ user_id })
            .first();
        // Create submission
        const [submission] = await (0, database_1.default)('submissions')
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
    }
    catch (error) {
        next(error);
    }
});
// Helper function to update scoreboard
async function updateScoreboardCache(user_id, team_id) {
    try {
        // Update user cache - use 1 for MSSQL boolean compatibility
        const userStats = await (0, database_1.default)('submissions')
            .where({ user_id, is_correct: 1 })
            .select(database_1.default.raw('SUM(points_awarded) as total_points'), database_1.default.raw('COUNT(DISTINCT challenge_id) as challenges_solved'), database_1.default.raw('MAX(submitted_at) as last_solve_time'))
            .first();
        // Check if user cache exists
        const existingUserCache = await (0, database_1.default)('scoreboard_cache')
            .where({ user_id })
            .first();
        if (existingUserCache) {
            // Update existing
            await (0, database_1.default)('scoreboard_cache')
                .where({ user_id })
                .update({
                total_points: userStats.total_points || 0,
                challenges_solved: userStats.challenges_solved || 0,
                last_solve_time: userStats.last_solve_time,
                updated_at: database_1.default.fn.now()
            });
        }
        else {
            // Insert new
            await (0, database_1.default)('scoreboard_cache').insert({
                user_id,
                team_id: null,
                total_points: userStats.total_points || 0,
                challenges_solved: userStats.challenges_solved || 0,
                last_solve_time: userStats.last_solve_time
            });
        }
        // Update team cache if applicable
        if (team_id) {
            const teamStats = await (0, database_1.default)('submissions')
                .where({ team_id, is_correct: 1 })
                .select(database_1.default.raw('SUM(points_awarded) as total_points'), database_1.default.raw('COUNT(DISTINCT challenge_id) as challenges_solved'), database_1.default.raw('MAX(submitted_at) as last_solve_time'))
                .first();
            // Check if team cache exists
            const existingTeamCache = await (0, database_1.default)('scoreboard_cache')
                .where({ team_id })
                .first();
            if (existingTeamCache) {
                // Update existing
                await (0, database_1.default)('scoreboard_cache')
                    .where({ team_id })
                    .update({
                    total_points: teamStats.total_points || 0,
                    challenges_solved: teamStats.challenges_solved || 0,
                    last_solve_time: teamStats.last_solve_time,
                    updated_at: database_1.default.fn.now()
                });
            }
            else {
                // Insert new
                await (0, database_1.default)('scoreboard_cache').insert({
                    user_id: null,
                    team_id,
                    total_points: teamStats.total_points || 0,
                    challenges_solved: teamStats.challenges_solved || 0,
                    last_solve_time: teamStats.last_solve_time
                });
            }
        }
    }
    catch (error) {
        // Log error but don't throw - scoreboard update shouldn't fail submission
        console.error('Error updating scoreboard cache:', error);
    }
}
// Get user's submissions
router.get('/my-submissions', auth_1.authenticate, async (req, res, next) => {
    try {
        const submissions = await (0, database_1.default)('submissions')
            .join('challenges', 'submissions.challenge_id', 'challenges.id')
            .where({ 'submissions.user_id': req.user.id })
            .select('submissions.*', 'challenges.title as challenge_title', 'challenges.category')
            .orderBy('submissions.submitted_at', 'desc');
        res.json({
            success: true,
            data: submissions
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=submission.routes.js.map