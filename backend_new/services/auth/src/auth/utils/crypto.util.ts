import * as crypto from 'crypto';

/**
 * Generates a cryptographically secure random session ID
 * @returns A secure random string suitable for session IDs
 */
export function generateSecureId(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a secure random token
 * @param length The length in bytes (default: 32)
 * @returns A secure random token as hex string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hashes a string using SHA-256
 * @param input The string to hash
 * @returns The SHA-256 hash as hex string
 */
export function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}
