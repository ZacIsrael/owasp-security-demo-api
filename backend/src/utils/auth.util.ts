import jwt, { SignOptions } from "jsonwebtoken";

// Loads environment variables from a `.env` file into process.env
// Used for storing sensitive data like database credentials, API keys, etc.
import dotenv from "dotenv";

// Must be called immediately after importing to make env vars available
dotenv.config();

// Generates a signed JWT for user authentication during login
export const generateJwt = (userId: string): string => {
  const secret = process.env.JWT_SECRET as string;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const expiresIn: SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "3h";

  return jwt.sign(
    // payload
    { id: userId },
    secret,
    {
      expiresIn,
    }
  );
};
