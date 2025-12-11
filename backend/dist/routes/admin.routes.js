"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const flagUtils_1 = require("../utils/flagUtils");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('admin'));
// Get all users with statistics
router.get('/users', async (req, res, next) => {
    try {
        const users = await (0, database_1.default)('users')
            .leftJoin('scoreboard_cache', 'users.id', 'scoreboard_cache.user_id')
            .select('users.*', 'scoreboard_cache.total_points', 'scoreboard_cache.challenges_solved')
            .orderBy('users.created_at', 'desc');
        res.json({
            success: true,
            data: users.map((u) => {
                delete u.password_hash;
                return u;
            })
        });
    }
    catch (error) {
        next(error);
    }
});
// Create new challenge (with flag hashing)
router.post('/challenges', [
    (0, express_validator_1.body)('title').trim().isLength({ min: 3, max: 200 }),
    (0, express_validator_1.body)('description').trim().notEmpty(),
    (0, express_validator_1.body)('type').isIn(['qa', 'repo', 'terraform', 'container', 'file_upload', 'multi_part']),
    (0, express_validator_1.body)('difficulty').isIn(['easy', 'medium', 'hard', 'expert']),
    (0, express_validator_1.body)('category').trim().notEmpty(),
    (0, express_validator_1.body)('points').isInt({ min: 1 }),
    (0, express_validator_1.body)('flag').trim().notEmpty().custom(flagUtils_1.isValidFlagFormat),
    (0, express_validator_1.body)('max_attempts').optional().isInt({ min: 1 })
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 400;
            error.errors = errors.array();
            throw error;
        }
        const { title, description, type, difficulty, category, points, flag, max_attempts, metadata } = req.body;
        // Hash the flag before storing
        const flag_hash = (0, flagUtils_1.hashFlag)(flag);
        const [challenge] = await (0, database_1.default)('challenges')
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
    }
    catch (error) {
        next(error);
    }
});
// Platform statistics
router.get('/stats', async (req, res, next) => {
    try {
        const [stats] = await database_1.default.raw(`
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map