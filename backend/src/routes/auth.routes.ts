// Import the Express framework for building HTTP servers
import express from "express";

import { register, login, logout, getMe } from "../controllers/auth.controller";

import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";

import { validateBody } from "../middleware/validate.middleware";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// Register a user
// Vulnerable
router.post("/register", register);
// router.post("/register", validateBody(CreateUserDTO), register);

// User can login
// Vulnerable
router.post("/login", login);
// router.post("/login", validateBody(LoginUserDTO), login);

// Log a user out
router.post("/logout", logout);

// Retrieves the user that's currently logged in
router.get("/me", protect, getMe);

export default router;
