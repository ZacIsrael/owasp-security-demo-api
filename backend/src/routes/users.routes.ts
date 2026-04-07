// Import the Express framework for building HTTP servers
import express from "express";
import { getAllUsers, getUserById } from "../controllers/users.controller";

const router = express.Router();

// Retrieves all users
router.get("/", getAllUsers);

// Retrieves a user by its id
router.get("/:id", getUserById);

export default router;
