"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Register
router.post('/register', [
    (0, express_validator_1.body)('username').trim().isLength({ min: 3, max: 50 }).isAlphanumeric(),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 8 }),
    (0, express_validator_1.body)('country').optional().isLength({ max: 3 }),
    (0, express_validator_1.body)('affiliation').optional().isLength({ max: 100 })
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 400;
            error.errors = errors.array();
            throw error;
        }
        const { username, email, password, country, affiliation } = req.body;
        // Check if user already exists
        const existingUser = await (0, database_1.default)('users')
            .where({ email })
            .orWhere({ username })
            .first();
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }
        // Hash password
        const password_hash = await bcrypt_1.default.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));
        // Create user
        const [user] = await (0, database_1.default)('users')
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, username: user.username, role: user.role }, process.env.JWT_SECRET || 'fallback-secret-key', { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            token,
            user
        });
    }
    catch (error) {
        next(error);
    }
});
// Login
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 400;
            error.errors = errors.array();
            throw error;
        }
        const { email, password } = req.body;
        // Find user
        const user = await (0, database_1.default)('users').where({ email }).first();
        if (!user || !user.is_active) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }
        // Verify password
        const isValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isValid) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }
        // Update last login
        await (0, database_1.default)('users').where({ id: user.id }).update({ last_login: database_1.default.fn.now() });
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, username: user.username, role: user.role }, process.env.JWT_SECRET || 'fallback-secret-key', { expiresIn: '7d' });
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
    }
    catch (error) {
        next(error);
    }
});
// Get current user
router.get('/me', auth_1.authenticate, async (req, res, next) => {
    try {
        const user = await (0, database_1.default)('users')
            .where({ id: req.user.id })
            .first();
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        // Get user's score from scoreboard cache
        const scoreData = await (0, database_1.default)('scoreboard_cache')
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
    }
    catch (error) {
        next(error);
    }
});
// Update user profile
router.put('/profile', auth_1.authenticate, [
    (0, express_validator_1.body)('country').optional().isLength({ max: 3 }),
    (0, express_validator_1.body)('affiliation').optional().isLength({ max: 100 }),
    (0, express_validator_1.body)('currentPassword').optional().notEmpty(),
    (0, express_validator_1.body)('newPassword').optional().isLength({ min: 8 })
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 400;
            error.errors = errors.array();
            throw error;
        }
        const { country, affiliation, currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        // Get current user
        const user = await (0, database_1.default)('users').where({ id: userId }).first();
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        // Prepare update data
        const updateData = {};
        if (country !== undefined)
            updateData.country = country || null;
        if (affiliation !== undefined)
            updateData.affiliation = affiliation || null;
        // Handle password change
        if (currentPassword && newPassword) {
            // Verify current password
            const isValid = await bcrypt_1.default.compare(currentPassword, user.password_hash);
            if (!isValid) {
                const error = new Error('Current password is incorrect');
                error.statusCode = 401;
                throw error;
            }
            // Hash new password
            updateData.password_hash = await bcrypt_1.default.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));
        }
        else if (currentPassword || newPassword) {
            const error = new Error('Both current and new password are required');
            error.statusCode = 400;
            throw error;
        }
        // Update user
        await (0, database_1.default)('users').where({ id: userId }).update(updateData);
        // Fetch updated user
        const updatedUser = await (0, database_1.default)('users').where({ id: userId }).first();
        // Get user's score
        const scoreData = await (0, database_1.default)('scoreboard_cache')
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map