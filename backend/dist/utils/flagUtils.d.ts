/**
 * Hash a flag using SHA-256
 * Flags are case-insensitive and trimmed before hashing
 */
export declare function hashFlag(flag: string): string;
/**
 * Verify a submitted flag against a stored hash
 */
export declare function verifyFlag(submittedFlag: string, storedHash: string): boolean;
/**
 * Generate a cryptographically secure random flag
 * Useful for dynamic challenges
 */
export declare function generateFlag(prefix?: string, length?: number): string;
/**
 * Validate flag format
 */
export declare function isValidFlagFormat(flag: string): boolean;
//# sourceMappingURL=flagUtils.d.ts.map