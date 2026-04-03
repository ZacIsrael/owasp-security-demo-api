// Import types for Express middleware function signature
import type { NextFunction, Response } from "express";

// Import custom request type that includes authenticated user
import type { AuthenticatedRequest } from "./auth.middleware";

// Import function to retrieve stored CSRF token for a user
import { getCsrfTokenForUser } from "../utils/csrf-token-store";

// Define HTTP methods that do NOT modify server state
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

// Define trusted frontend origins allowed to make requests
const TRUSTED_ORIGINS = ["http://localhost:3000"];

// CSRF protection middleware for state-changing requests
export const csrfProtection = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Skip CSRF checks for safe (read-only) requests
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  // Extract Fetch Metadata header to determine request origin context
  const fetchSite = req.header("sec-fetch-site");

  // Block requests coming from cross-site contexts
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site") {
    return res.status(403).json({
      success: false,
      error: "CSRF protection: cross-site request blocked",
    });
  }

  // Ensure request is authenticated (protect middleware in routes should run first)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: no authenticated user",
    });
  }

  // Extract CSRF token from custom request header
  const csrfHeader = req.header("x-csrf-token");

  // Reject request if CSRF header is missing
  if (!csrfHeader) {
    return res.status(403).json({
      success: false,
      error: "CSRF protection: missing x-csrf-token header",
    });
  }

  // Retrieve expected CSRF token for authenticated user
  const expectedToken = getCsrfTokenForUser(req.user.id);

  // Reject request if no token exists server-side
  if (!expectedToken) {
    return res.status(403).json({
      success: false,
      error: "CSRF protection: no server-side CSRF token found",
    });
  }

  // Reject request if provided token does not match expected token
  if (csrfHeader !== expectedToken) {
    return res.status(403).json({
      success: false,
      error: "CSRF protection: invalid CSRF token",
    });
  }

  // Extract Origin header to validate request source
  const origin = req.header("origin");

  // Reject request if origin is present but not trusted
  if (origin && !TRUSTED_ORIGINS.includes(origin)) {
    return res.status(403).json({
      success: false,
      error: "CSRF protection: untrusted request origin",
    });
  }

  // Extract Referer header as fallback when Origin is missing
  const referer = req.header("referer");

  // Validate Referer against trusted origins if Origin is not present
  if (!origin && referer) {
    const isTrustedReferer = TRUSTED_ORIGINS.some((trustedOrigin) =>
      referer.startsWith(trustedOrigin)
    );

    // Reject request if Referer does not match trusted origins
    if (!isTrustedReferer) {
      return res.status(403).json({
        success: false,
        error: "CSRF protection: untrusted request referer",
      });
    }
  }

  // All CSRF checks passed — allow request to proceed
  next();
};
