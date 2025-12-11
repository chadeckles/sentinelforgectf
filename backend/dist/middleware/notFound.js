"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
            statusCode: 404
        }
    });
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map