// This file is responsible for handling API requests that come in for authentication (register/login/logout)

import type { Request, Response, NextFunction } from "express";

import type { User } from "../interfaces/user.interface";

import crypto from "crypto";

// Import dotenv to load environment variables from a file
import dotenv from "dotenv";

// Import Node.js path utilities for resolving file paths
import path from "node:path";
import { asyncHandler } from "../middleware/async.middleware";
import { userService } from "../services/user.service";
import { ErrorResponse } from "../utils/errorResponse";
import { comparePassword } from "../utils/helpers";
import { generateJwt } from "../utils/auth.util";
import { sendTokenResponse } from "../utils/auth-response.util";

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // see what's in the body of the request
    console.log("register: req.body = ", req.body);

    // req.body has already been validated and sanitized by
    // validateBody(CreateUserDTO) in auth.route.ts.

    // To show the vulnerability, I'll just comment out
    // validateBody(CreateUserDTO) in that particular route.

    // Create the user via the service layer.
    const { user } = await userService.createUser(req.body);

    // Ensure the stored password hash is never returned to the client
    const safeUser = {
      ...user,
      password_hash: undefined,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please log in.",
      user: safeUser,
    });
  }
);

// Logs a user in
const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // req.body has already been validated and normalized by validateBody(LoginDTO)
    const { email, password } = req.body;

    // req.body has already been validated and sanitized by
    // validateBody(LoginDTO) in auth.route.ts.

    // To show the vulnerability, I'll just comment out
    // validateBody(LoginDTO) in that particular route.

    // look up user by email
    const { user } = await userService.getUserByEmail(email);

    // Invalid credentials (best practice not to reveal whether email exists)
    // Could be a 401 or 404...for now, I'll leave it as 401
    if (user === null) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    // Check if the password matches
    const isMatch = await comparePassword(password, user.password_hash);

    // Throw error if the password does not match
    if (!isMatch) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    // Client entered valid login credentials so generate jwt token using user id
    const token = generateJwt(user.id);

    // call sendTokenReponse
    sendTokenResponse(user, token, 200, res);
  }
);

// Logs a user out
const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Clear the auth cookie by overwriting it with an expired value
    res.cookie("token", "none", {
      // Prevents JavaScript (e.g., document.cookie) from accessing the cookie,
      // which helps protect against XSS attacks stealing the JWT
      httpOnly: true,

      // Sets the cookie to expire almost immediately (1 second from now),
      // effectively instructing the browser to delete it
      expires: new Date(Date.now() + 1000),

      // Restricts the browser from sending the cookie on cross-site requests,
      // providing protection against CSRF attacks
      sameSite: "strict",

      // Specifies that the cookie is valid for the entire application (all routes)
      path: "/",

      // Ensures the cookie is only sent over HTTPS in production environments,
      // preventing it from being exposed over insecure HTTP connections
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  }
);
