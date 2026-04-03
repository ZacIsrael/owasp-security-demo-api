/**
 * CSRF token store for synchronizer token pattern.
 * Generates and manages tokens tied to authenticated users.
 * Used to verify that state-changing requests are intentional.
 * In-memory only (demo purpose, not production-safe).
 */

import crypto from "crypto";

// In-memory store mapping userId → csrfToken
// This allows the server to verify that the token sent by the client
// matches the one originally issued for that specific user
const csrfTokenStore = new Map<string, string>();

/**
 * Generates a cryptographically secure random CSRF token.
 *
 * Why this is important:
 * - Tokens must be unpredictable to prevent attackers from guessing them
 * - Uses Node.js crypto module for strong randomness
 *
 * Returns:
 * - A hex-encoded string representing the CSRF token
 */
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Stores a CSRF token for a specific user.
 *
 * @param userId - The authenticated user's ID
 * @param token - The CSRF token generated for that user
 *
 * Behavior:
 * - Associates the token with the user in memory
 * - Overwrites any existing token for that user (single active token)
 */
export const saveCsrfTokenForUser = (
  userId: string,
  token: string
): void => {
  csrfTokenStore.set(userId, token);
};

/**
 * Retrieves the CSRF token associated with a specific user.
 *
 * @param userId - The authenticated user's ID
 *
 * Returns:
 * - The stored CSRF token if it exists
 * - undefined if no token is found
 *
 * Used during:
 * - CSRF validation in middleware
 */
export const getCsrfTokenForUser = (
  userId: string
): string | undefined => {
  return csrfTokenStore.get(userId);
};

/**
 * Deletes the CSRF token for a user.
 *
 * @param userId - The authenticated user's ID
 *
 * Why this is important:
 * - Prevents reuse of old tokens after logout
 * - Helps reduce attack surface if a token is compromised
 *
 * Used during:
 * - Logout flow
 */
export const deleteCsrfTokenForUser = (userId: string): void => {
  csrfTokenStore.delete(userId);
};