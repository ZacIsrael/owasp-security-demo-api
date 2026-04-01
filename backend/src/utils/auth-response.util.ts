import type { Response } from "express";
import type { User } from "../interfaces/user.interface";

export const sendTokenResponse = (
  user: User,
  token: string,
  statusCode: number,
  res: Response
): void => {
  const expiresInDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 0.125;

  const options = {
    expires: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "strict" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };

  // Ensure that the hashed password is never returned to the client
  const safeUser = {
    ...user,
    password_hash: undefined,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user: safeUser,
  });
};
