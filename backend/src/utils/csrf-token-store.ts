//   CSRF token store for synchronizer token pattern.
//   Generates and manages tokens tied to authenticated users.
//   Used to verify that state-changing requests are intentional.
//   In-memory only (for the purpose of the demonstartion; not production-safe).

import crypto from "crypto";

// In-memory store mapping a userId to a csrfToken
// This allows the server to verify that the token sent by the client
// matches the one originally issued for that specific user
const csrfTokenStore = new Map<string, string>();

// Generates a cryptographically secure random CSRF token.
// Tokens must be unpredictable to prevent attackers from guessing them
// crypto module used for strong randomness
export const generateCsrfToken = (): string => {
  // returns a hex-encoded string representing the CSRF token
  return crypto.randomBytes(32).toString("hex");
};

// Stores a CSRF token for a specific user.
// userId - The authenticated user's ID
// token - The CSRF token generated for that user
// This function:
// - Associates the token with the user in memory
// - Overwrites any existing token for that user (single active token)
export const saveCsrfTokenForUser = (userId: string, token: string): void => {
  csrfTokenStore.set(userId, token);
};

// Retrieves the CSRF token associated with a specific user.
// userId - The authenticated user's ID
// Used during CSRF validation in middleware

export const getCsrfTokenForUser = (userId: string): string | undefined => {
  // returns the CSRF token if it exists, returns undefined if it does not exist
  return csrfTokenStore.get(userId);
};

// Deletes the CSRF token for a user.
// userId - The authenticated user's ID
// This function is needed because it:
// -  Prevents reuse of old tokens after logout
// - Helps reduce attack surface if a token is compromised
// Used during Logout flow (in logout controller function)
export const deleteCsrfTokenForUser = (userId: string): void => {
  csrfTokenStore.delete(userId);
};
