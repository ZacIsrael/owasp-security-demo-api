import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middleware/async.middleware";
import { userService } from "../services/user.service";
import { ErrorResponse } from "../utils/errorResponse";

// Controller to fetch all users from the database
export const getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Call service layer to retrieve all users (already public-safe)
    const users = await userService.getAllUsers();

    // Return standardized success response with users array
    res.status(200).json({
      success: true,
      data: {
        users,
        count: users.length,
      },
    });
  }
);

// Controller to fetch a single user by ID
export const getUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract user ID from request params
    const { id } = req.params;

    if (typeof id !== "string") {
      throw new ErrorResponse("User id must be a string", 400);
    }

    // Fetch user from service layer by ID
    const user = await userService.getPublicUserById(id);

    // If user does not exist, throw 404 error
    if (user == null) {
      throw new ErrorResponse("User not found", 404);
    }

    // Return standardized success response with single user object
    res.status(200).json({
      success: true,
      data: { user },
    });
  }
);
