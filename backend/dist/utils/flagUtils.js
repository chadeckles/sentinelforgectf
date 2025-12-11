"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashFlag = hashFlag;
exports.verifyFlag = verifyFlag;
exports.generateFlag = generateFlag;
exports.isValidFlagFormat = isValidFlagFormat;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Hash a flag using SHA-256
 * Flags are case-insensitive and trimmed before hashing
 */
function hashFlag(flag) {
    return crypto_1.default
        .createHash('sha256')
        .update(flag.toLowerCase().trim())
        .digest('hex');
}
/**
 * Verify a submitted flag against a stored hash
 */
function verifyFlag(submittedFlag, storedHash) {
    const submittedHash = hashFlag(submittedFlag);
    // Use timing-safe comparison to prevent timing attacks
    return crypto_1.default.timingSafeEqual(Buffer.from(submittedHash), Buffer.from(storedHash));
}
/**
 * Generate a cryptographically secure random flag
 * Useful for dynamic challenges
 */
function generateFlag(prefix = 'SENTINEL', length = 16) {
    const randomBytes = crypto_1.default.randomBytes(length);
    const randomString = randomBytes.toString('hex').substring(0, length);
    return `${prefix}{${randomString}}`;
}
/**
 * Validate flag format
 */
function isValidFlagFormat(flag) {
    // Flag must match format: SENTINEL{...}
    const flagRegex = /^SENTINEL\{[a-zA-Z0-9_\-]+\}$/;
    return flagRegex.test(flag.trim());
}
//# sourceMappingURL=flagUtils.js.map