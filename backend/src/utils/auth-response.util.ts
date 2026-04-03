import type { Response } from "express";
import type { User } from "../interfaces/user.interface";

// Sends JWT cookie + safe user data + CSRF token in response
export const sendTokenResponse = (
  user: User,
  token: string,
  csrfToken: string,
  statusCode: number,
  res: Response
): void => {
  // Get cookie expiration (in days) from env or default to 3 hours (0.125 days)
  const expiresInDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 0.125;

  // Configure cookie options for authentication token
  const options = {
    // Set expiration date for cookie (3 hours from the current moment in time)
    expires: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    // Prevent JavaScript access to cookie (mitigates XSS)
    httpOnly: true,

    // Restrict cookie to same-site requests
    // Removing sameSite protection makes the API susceptible to CSRF attacks
    // because the browser will blindly include the user's auth cookie in forged requests
    sameSite: "strict" as const,

    // Make cookie available across entire app
    path: "/",

    // Only send cookie over HTTPS in production
    secure: process.env.NODE_ENV === "production",
  };

  // Ensure that the hashed password is never returned to the client
  const safeUser = {
    ...user,
    password_hash: undefined,
  };

  // Send response with cookie + user data + CSRF token
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user: safeUser,
    csrfToken,
  });
};
