import crypto from 'crypto';

/**
 * Hash a flag using SHA-256
 * Flags are case-insensitive and trimmed before hashing
 */
export function hashFlag(flag: string): string {
  return crypto
    .createHash('sha256')
    .update(flag.toLowerCase().trim())
    .digest('hex');
}

/**
 * Verify a submitted flag against a stored hash
 */
export function verifyFlag(submittedFlag: string, storedHash: string): boolean {
  const submittedHash = hashFlag(submittedFlag);
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(submittedHash),
    Buffer.from(storedHash)
  );
}

/**
 * Generate a cryptographically secure random flag
 * Useful for dynamic challenges
 */
export function generateFlag(prefix: string = 'SENTINEL', length: number = 16): string {
  const randomBytes = crypto.randomBytes(length);
  const randomString = randomBytes.toString('hex').substring(0, length);
  return `${prefix}{${randomString}}`;
}

/**
 * Validate flag format
 */
export function isValidFlagFormat(flag: string): boolean {
  // Flag must match format: SENTINEL{...}
  const flagRegex = /^SENTINEL\{[a-zA-Z0-9_\-]+\}$/;
  return flagRegex.test(flag.trim());
}
