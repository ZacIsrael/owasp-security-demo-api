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
    // sameSite controls whether the browser sends this authentication cookie
    // along with requests that originate from a different site.
    //
    // CSRF attacks rely on the browser automatically including the victim’s
    // authentication cookie in a forged request sent from a malicious site.
    //
    // When sameSite is set to "strict":
    // - the browser will NOT send this cookie on cross-site requests
    // - this prevents malicious sites from performing authenticated actions
    //   on behalf of the user
    //
    // When sameSite is removed or disabled (as done here for demonstration):
    // - the browser WILL send the cookie with cross-site requests
    // - a malicious site can trigger requests to this API while the user is logged in
    // - the server receives a valid cookie and treats the request as legitimate
    //
    // In other words:
    // removing sameSite protection makes the API susceptible to CSRF attacks
    // because the browser will blindly include the user's auth cookie in forged requests
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
