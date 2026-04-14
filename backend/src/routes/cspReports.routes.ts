// Import the Express framework for building HTTP servers
import express from "express";

// Import the controller that will handle incoming CSP reports
import { handleCspReport } from "../controllers/cspReports.controller";

// Create a dedicated router for CSP report endpoints
const router = express.Router();

// Accept POST requests containing CSP violation reports from the browser
router.post("/", handleCspReport);

// Export the router so it can be mounted in server.ts
export default router;
