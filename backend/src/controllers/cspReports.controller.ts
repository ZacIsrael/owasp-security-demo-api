// Import Express request/response types for a properly typed controller
import { Request, Response } from "express";

// Import the service that normalizes and logs CSP violation reports
import { processCspReport } from "../services/cspReports.service";

// Handle incoming CSP report requests from the browser
export function handleCspReport(req: Request, res: Response): void {
  // Pass the request headers and body to the service for processing/logging
  processCspReport(req.headers, req.body);

  // Return 204 because the browser does not need a response body for CSP reporting
  res.status(204).send();
}
