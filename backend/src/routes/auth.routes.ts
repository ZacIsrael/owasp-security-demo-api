// Import the Express framework for building HTTP servers
import express from "express";

import {
  register,
  login,
  logout,
  getMe,
  updateDetails,
} from "../controllers/auth.controller";

import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";

import { validateBody } from "../middleware/validate.middleware";
import { protect } from "../middleware/auth.middleware";
import { csrfProtection } from "../middleware/csrf.middleware";

const router = express.Router();

// Register a user
// Vulnerable
// router.post("/register", register);
router.post("/register", validateBody(CreateUserDTO), register);

// User can login
// Vulnerable
// router.post("/login", login);
router.post("/login", validateBody(LoginUserDTO), login);

// Log a user out
router.post("/logout", protect, csrfProtection, logout);

// Retrieves the user that's currently logged in
router.get("/me", protect, getMe);

// Executed when a user wants to update their display_name, email, or bio
router.patch(
  "/updatedetails",
  protect,
  // Add csrf protection; if this line is commented out,
  // then the API is to susceptible to csrf attacks
  csrfProtection,
  validateBody(UpdateUserDTO),
  updateDetails
);

// Temporary route to showcase CSRF vulnerability
router.post(
  "/updatedetails-demo",
  protect,
  // Add csrf protection; if this line is commented out,
  // then the API is to susceptible to csrf attacks
  csrfProtection,
  validateBody(UpdateUserDTO),
  updateDetails
);

// vulnerable
/*
router.patch(
  "/updatedetails",
  protect,
  updateDetails
);
*/

export default router;
