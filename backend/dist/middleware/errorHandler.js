"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : 'Internal Server Error';
    // Always log errors server-side for debugging
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        statusCode,
        url: req.url,
        method: req.method
    });
    // NEVER send stack traces or detailed errors to clients in production
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(err.errors && { details: err.errors })
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map