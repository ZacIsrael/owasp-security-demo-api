// Import the Express framework for building HTTP servers
import express from "express";
import { getAllUsers, getUserById } from "../controllers/users.controller";
import { validateParams } from "../middleware/validate.middleware";
import { IdParamDTO } from "../dtos/params.dto";

const router = express.Router();

// Retrieves all users
router.get("/", getAllUsers);

// Retrieves a user by its id
router.get("/:id", validateParams(IdParamDTO), getUserById);

export default router;
