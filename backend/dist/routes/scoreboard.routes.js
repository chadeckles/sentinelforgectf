"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// Get scoreboard
router.get('/', async (req, res, next) => {
    try {
        const { type = 'user' } = req.query;
        if (type === 'team') {
            // Team scoreboard
            const teams = await (0, database_1.default)('scoreboard_cache')
                .join('teams', 'scoreboard_cache.team_id', 'teams.id')
                .whereNotNull('scoreboard_cache.team_id')
                .select('teams.id', 'teams.name', 'teams.country', 'teams.affiliation', 'scoreboard_cache.total_points', 'scoreboard_cache.challenges_solved', 'scoreboard_cache.last_solve_time')
                .orderBy('scoreboard_cache.total_points', 'desc')
                .orderBy('scoreboard_cache.last_solve_time', 'asc')
                .limit(100);
            // Calculate ranks with tie handling
            let currentRank = 1;
            const rankedTeams = teams.map((team, index) => {
                // If this team has the same score as previous, keep same rank
                if (index > 0 && teams[index - 1].total_points === team.total_points) {
                    // Same score = same rank
                }
                else {
                    // Different score = new rank (1-indexed position)
                    currentRank = index + 1;
                }
                return {
                    rank: currentRank,
                    ...team
                };
            });
            res.json({
                success: true,
                scoreboard: rankedTeams
            });
        }
        else {
            // User scoreboard
            const users = await (0, database_1.default)('scoreboard_cache')
                .join('users', 'scoreboard_cache.user_id', 'users.id')
                .whereNotNull('scoreboard_cache.user_id')
                .select('users.id', 'users.username', 'users.country', 'users.affiliation', 'scoreboard_cache.total_points', 'scoreboard_cache.challenges_solved', 'scoreboard_cache.last_solve_time')
                .orderBy('scoreboard_cache.total_points', 'desc')
                .orderBy('scoreboard_cache.last_solve_time', 'asc')
                .limit(100);
            // Calculate ranks with tie handling
            let currentRank = 1;
            const rankedUsers = users.map((user, index) => {
                // If this user has the same score as previous, keep same rank
                if (index > 0 && users[index - 1].total_points === user.total_points) {
                    // Same score = same rank
                }
                else {
                    // Different score = new rank (1-indexed position)
                    currentRank = index + 1;
                }
                return {
                    rank: currentRank,
                    ...user
                };
            });
            res.json({
                success: true,
                scoreboard: rankedUsers
            });
        }
    }
    catch (error) {
        next(error);
    }
});
// Get statistics
router.get('/stats', async (req, res, next) => {
    try {
        const isPostgres = database_1.default.client.config.client === 'pg';
        let stats;
        if (isPostgres) {
            const [result] = await database_1.default.raw(`
        SELECT
          (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
          (SELECT COUNT(*) FROM teams) as total_teams,
          (SELECT COUNT(*) FROM challenges WHERE is_active = true) as total_challenges,
          (SELECT COUNT(*) FROM submissions WHERE is_correct = true) as total_solves,
          (SELECT COUNT(DISTINCT user_id) FROM submissions WHERE is_correct = true) as active_users
      `);
            stats = result.rows[0];
        }
        else {
            // MSSQL version
            const [result] = await database_1.default.raw(`
        SELECT
          (SELECT COUNT(*) FROM users WHERE is_active = 1) as total_users,
          (SELECT COUNT(*) FROM teams) as total_teams,
          (SELECT COUNT(*) FROM challenges WHERE is_active = 1) as total_challenges,
          (SELECT COUNT(*) FROM submissions WHERE is_correct = 1) as total_solves,
          (SELECT COUNT(DISTINCT user_id) FROM submissions WHERE is_correct = 1) as active_users
      `);
            stats = result[0];
        }
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=scoreboard.routes.js.map