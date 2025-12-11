"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('No token provided');
            error.statusCode = 401;
            throw error;
        }
        const token = authHeader.split(' ')[1];
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            const apiError = new Error('Invalid token');
            apiError.statusCode = 401;
            next(apiError);
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            const error = new Error('User not authenticated');
            error.statusCode = 401;
            return next(error);
        }
        if (!roles.includes(req.user.role)) {
            const error = new Error('Insufficient permissions');
            error.statusCode = 403;
            return next(error);
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map