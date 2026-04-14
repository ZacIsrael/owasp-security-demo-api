// Import Next.js request/response types for middleware support
import { NextRequest, NextResponse } from "next/server";

// A CSP hash is a cryptographic fingerprint of approved inline
// script or style content defined in the Content Security Policy.
// The browser only executes inline code whose exact content matches
// one of the allowed hashes in the policy.

// Store the SHA-256 hash for the exact hash-based inline script in /app/csp-demo/page.tsx
const HASHED_INLINE_SCRIPT =
  "'sha256-rr1tXJsM0LHkVjaDvdtXLjA9r/OUNP46SCxie6uByXc='";

// Store the SHA-256 hash for the exact hash-based inline style in /app/csp-demo/page.tsx
const HASHED_INLINE_STYLE =
  "'sha256-IAhLpzUuzs2wgE0ykG3mf8KwlqlMHUg62plGA2RP8iY='";
/*
// A CSP nonce is a unique, cryptographically random value generated
// by the server for each response. Inline scripts/styles must include
// the matching nonce attribute or the browser will block them.
// nonce = temporary password for trusted inline code
*/

// Helper that generates a base64 nonce for each request
function generateNonce(): string {
  // Generate 16 random bytes using the Web Crypto API
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));

  // Convert the random bytes into a base64 string for CSP usage
  return Buffer.from(randomBytes).toString("base64");
}

// Build the CSP string for the /csp-demo route using the per-request nonce and static hashes
function buildCspHeader(nonce: string): string {
  // Return the CSP policy string with nonce and hash allowances included
  // Only run scripts/styles if they are:
  // - Loaded from this origin ('self')
  // - Have the correct nonce
  // - OR match one of these approved hashes
  return (
    `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' ${HASHED_INLINE_SCRIPT};
    style-src 'self' 'nonce-${nonce}' ${HASHED_INLINE_STYLE};
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self' http://localhost:8000;
    object-src 'none';
    base-uri 'self';
    frame-ancestors 'none';
    form-action 'self';
    frame-src 'self';
    report-uri http://localhost:8000/api/v1/csp-reports;
  `
      // Collapse repeated whitespace so the header value stays clean
      .replace(/\s{2,}/g, " ")
      // Remove leading/trailing whitespace from the final header value
      .trim()
  );
}

// Run middleware for matching requests before the page is rendered
export function middleware(request: NextRequest) {
  // Generate a fresh nonce for this specific request
  const nonce = generateNonce();

  // Read the URL query string to enable switching between enforce and report-only modes
  const mode = request.nextUrl.searchParams.get("mode");

  // Boolean variable that indicates report-only mode or not
  // Treat mode=report-only as report-only mode; everything else uses enforcement mode
  const isReportOnly = mode === "report-only";

  // Clone the incoming request headers so the nonce can be passed downstream
  const requestHeaders = new Headers(request.headers);

  // Attach the nonce to the request so the page can read it with headers()
  requestHeaders.set("x-nonce", nonce);

  // Build the CSP header value for this request using the generated nonce
  const cspHeader = buildCspHeader(nonce);

  // Continue the request while forwarding the modified request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set the report-only header when testing violations without blocking content
  if (isReportOnly) {
    // Send the policy in report-only mode so the browser reports but does not enforce
    response.headers.set("Content-Security-Policy-Report-Only", cspHeader);

    // Remove the enforced CSP header to avoid conflicting behavior on the same response
    response.headers.delete("Content-Security-Policy");
  }

  // Set the enforced CSP header when not explicitly using report-only mode
  else {
    // Send the standard CSP header so the browser actively enforces the policy
    response.headers.set("Content-Security-Policy", cspHeader);

    // Remove any report-only header so this response uses enforcement only
    response.headers.delete("Content-Security-Policy-Report-Only");
  }

  // Return the response with the correct CSP mode and nonce-aware policy attached
  return response;
}

// Limit this middleware to only the CSP demo route
export const config = {
  // Match the demo page so the nonce/CSP logic does not affect the whole app
  matcher: ["/csp-demo"],
};
