// Import the Express framework for building HTTP servers
import express from "express";

import { register, login, logout } from "../controllers/auth.controller";

import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";

import { validateBody } from "../middleware/validate.middleware";

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

export default router;
