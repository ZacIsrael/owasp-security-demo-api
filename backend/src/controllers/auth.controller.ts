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

//
const login = asyncHandler(
  async (reg: Request, res: Response, next: NextFunction) => {}
);
