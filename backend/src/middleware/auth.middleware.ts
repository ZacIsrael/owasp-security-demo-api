// Library used to sign and verify JSON Web Tokens
import jwt from "jsonwebtoken";

// Wrapper to handle async errors and pass them to Express error middleware
import { asyncHandler } from "./async.middleware";

import type { NextFunction, Request, Response } from "express";
import type { User } from "../interfaces/user.interface";

// postgres client object that allows interaction with the database
import { db } from "../database/postgres/connection";

// Load environment variables from config file
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Extend Express Request so req.user is properly typed
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// JWT payload shape expected from your app
interface JwtPayload {
  id: string;
}

// Middleware to protect routes by requiring a valid JWT
export const protect = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Only accept token from HTTP-only cookie
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // If no token is found, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route",
      });
    }

    try {
      // Ensure JWT secret exists before verifying
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }

      // Verify token and decode payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Make sure the token payload contains a valid user id
      if (
        typeof decoded !== "object" ||
        decoded === null ||
        !("id" in decoded) ||
        typeof decoded.id !== "string"
      ) {
        throw new Error("Invalid token payload");
      }

      const { id } = decoded as JwtPayload;

      // Query PostgreSQL for the authenticated user
      const result = await db.query(
        `SELECT id, email, password_hash, display_name, bio, role, is_active, created_at, updated_at
         FROM users
         WHERE id = $1
         LIMIT 1`,
        [id]
      );

      const user: User | undefined = result.rows[0];

      // If no user is found, deny access
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Not authorized to access this route",
        });
      }

      // Optional but recommended: prevent inactive users from accessing routes
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          error: "User account is inactive",
        });
      }

      // Attach authenticated user row to request object
      req.user = user;

      // Continue to next middleware/route handler
      next();
    } catch (err) {
      console.log("auth.middleware: jwt verify error =", err);

      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route",
      });
    }
  }
);

// Middleware to allow or deny access to certain routes depending on a user's role
export const authorize = (...roles: User["role"][]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Make sure protect middleware ran first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route",
      });
    }

    // Check whether the authenticated user's role is included in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is unauthorized to access this route`,
      });
    }

    // User has an allowed role — proceed
    next();
  };
};
