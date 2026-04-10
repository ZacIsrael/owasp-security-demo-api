// Import Next.js config type for strong typing and IntelliSense support
import type { NextConfig } from "next";

// Define the Content Security Policy (CSP) string that controls what resources the browser is allowed to load/execute
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self' http://localhost:8000;
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
  form-action 'self';
  frame-src *;
`
  .replace(/\s{2,}/g, " ")
  .trim();

// Allows iframes from ANY origin
// frame-src *;

// Restrict iframes to load content only from the same origin (this app)
// Prevents attacker-controlled external pages from being embedded inside the application
// frame-src 'self';

// Define Next.js configuration object with proper typing
const nextConfig: NextConfig = {
  // Configure custom HTTP headers for all routes
  async headers() {
    // Return an array of header rules
    return [
      // Apply this rule to all routes in the application
      {
        source: "/:path*",
        // Define headers to be sent with matching responses
        headers: [
          // Set the Content-Security-Policy header
          {
            key: "Content-Security-Policy",
            // Use the CSP string defined above as the header value
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

// Export the Next.js configuration so it is applied at runtime
export default nextConfig;
