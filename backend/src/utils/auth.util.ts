import jwt, { SignOptions } from "jsonwebtoken";

// Loads environment variables from a `.env` file into process.env
// Used for storing sensitive data like database credentials, API keys, etc.
import dotenv from "dotenv";

import crypto from "crypto";

// Must be called immediately after importing to make env vars available
dotenv.config();

// Represents the result of generating a JWT for an authenticated session.
interface GenerateJwtResult {
  token: string;
  sessionId: string;
}

// Generates a signed JWT for user authentication during login.
// Includes a unique session identifier so downstream middleware can
// bind CSRF validation to a specific authenticated session.
export const generateJwt = (userId: string): GenerateJwtResult => {
  const secret = process.env.JWT_SECRET as string;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const expiresIn: SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "3h";

  // Generate a unique session identifier for this authenticated session.
  const sessionId = crypto.randomUUID();

  // Sign and return a JWT containing the user id and session id.
  const token = jwt.sign(
    // payload
    { id: userId, jti: sessionId },
    secret,
    {
      expiresIn,
    }
  );

  return {
    token,
    sessionId,
  };
};
