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

  // Configure cookie options for authentication token.

  // These cookie security attributes are stored and enforced by the browser
  // whenever it decides whether the cookie may be sent or accessed.
  const options = {
    // Set expiration date for cookie (3 hours from the current moment in time)
    expires: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),

    // Prevent client-side JavaScript from reading the auth cookie
    // Browser still sends the cookie automatically with eligible requests
    httpOnly: true,

    // Setting sameSite to "strict" prevents browser from sending auth cookie in cross-site requests
    // Helps mitigate CSRF by restricting when the browser may attach the cookie.
    // Removing sameSite protection makes the API susceptible to CSRF attacks
    // because the browser will blindly include the user's auth cookie in forged requests
    sameSite: "strict" as const,

    // Make cookie available across entire app
    path: "/",

    // In production, require HTTPS before browser will send this cookie
    // Prevents auth token exposure over unencrypted HTTP connections
    secure: process.env.NODE_ENV === "production",
  };

  // Ensure that the hashed password is never returned to the client
  const safeUser = {
    ...user,
    password_hash: undefined,
  };

  // Browser receives Set-Cookie header and stores both the token value
  // and its associated security attributes for future enforcement
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user: safeUser,
    csrfToken,
  });
};
