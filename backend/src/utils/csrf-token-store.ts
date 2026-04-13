//   CSRF token store for synchronizer token pattern.
//   Generates and manages tokens tied to authenticated users.
//   Used to verify that state-changing requests are intentional.
//   In-memory only (for the purpose of the demonstration; not production-safe).

// In production, this in-memory CSRF token store would typically be replaced
// by a shared session store such as Redis, allowing token persistence across
// application restarts and horizontal scaling across multiple server instances.

// Node.js crypto module used to generate cryptographically secure random values.
// Required for creating unpredictable CSRF tokens.
import crypto from "crypto";

// In-memory store mapping a sessionId to a csrfToken.
// This allows the server to verify that the token sent by the client
// matches the one originally issued for that specific authenticated session.
const csrfTokenStore = new Map<string, string>();

// Generates a cryptographically secure random CSRF token.
// Tokens must be unpredictable to prevent attackers from guessing them
// crypto module used for strong randomness
export const generateCsrfToken = (): string => {
  // returns a hex-encoded string representing the CSRF token
  return crypto.randomBytes(32).toString("hex");
};

// Stores a CSRF token for a specific authenticated session.
// sessionId - The authenticated session identifier (for example, a JWT jti)
// token - The CSRF token generated for that session
// This function:
// - Associates the token with the session in memory
// - Overwrites any existing token for that same session
export const saveCsrfTokenForSession = (
  sessionId: string,
  token: string
): void => {
  csrfTokenStore.set(sessionId, token);
};

// Retrieves the CSRF token associated with a specific authenticated session.
// sessionId - The authenticated session identifier
// Used during CSRF validation in middleware.
export const getCsrfTokenForSession = (
  sessionId: string
): string | undefined => {
  return csrfTokenStore.get(sessionId);
};

// Deletes the CSRF token for a specific authenticated session.
// sessionId - The authenticated session identifier
// This function is needed because it:
// - Prevents reuse of old tokens after logout
// - Helps reduce attack surface if a token is compromised
// Used during logout flow.
export const deleteCsrfTokenForSession = (sessionId: string): void => {
  csrfTokenStore.delete(sessionId);
};
