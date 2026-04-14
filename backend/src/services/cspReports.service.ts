// Define a flexible object type for unknown CSP report payload shapes
type UnknownRecord = Record<string, unknown>;

// Normalize the incoming payload into the most likely CSP report object
function extractCspReport(body: unknown): UnknownRecord {
  // Treat non-object payloads as empty so property access stays safe
  if (!body || typeof body !== "object") {
    return {};
  }

  // Cast the incoming body to a generic object for safe property lookups
  const parsedBody = body as UnknownRecord;

  // Pull the legacy csp-report object when browsers send that shape
  const legacyReport = parsedBody["csp-report"];

  // Return the legacy csp-report object when it is present and valid
  if (legacyReport && typeof legacyReport === "object") {
    return legacyReport as UnknownRecord;
  }

  // Pull the nested body object when reports arrive in that structure
  const nestedBody = parsedBody.body;

  // Return the nested body object when it is present and valid
  if (nestedBody && typeof nestedBody === "object") {
    return nestedBody as UnknownRecord;
  }

  // Fall back to the original parsed body when no nested report object exists
  return parsedBody;
}

// Safely read a string value from a report object by key
function getStringValue(
  report: UnknownRecord,
  key: string
): string | undefined {
  // Read the raw value from the report object
  const value = report[key];

  // Return the value only when it is actually a string
  return typeof value === "string" ? value : undefined;
}

// Normalize the blocked URI across legacy and modern field names
function getBlockedUri(report: UnknownRecord): string | undefined {
  // Prefer the legacy blocked-uri field when present
  const legacyBlockedUri = getStringValue(report, "blocked-uri");

  // Return the legacy value when available
  if (legacyBlockedUri) {
    return legacyBlockedUri;
  }

  // Fall back to the modern blockedURL field when present
  return getStringValue(report, "blockedURL");
}

// Normalize the violated directive across legacy and modern field names
function getViolatedDirective(report: UnknownRecord): string | undefined {
  // Prefer the legacy violated-directive field when present
  const legacyDirective = getStringValue(report, "violated-directive");

  // Return the legacy value when available
  if (legacyDirective) {
    return legacyDirective;
  }

  // Fall back to the modern effectiveDirective field when present
  return getStringValue(report, "effectiveDirective");
}

// Normalize the original policy across legacy and modern field names
function getOriginalPolicy(report: UnknownRecord): string | undefined {
  // Prefer the legacy original-policy field when present
  const legacyPolicy = getStringValue(report, "original-policy");

  // Return the legacy value when available
  if (legacyPolicy) {
    return legacyPolicy;
  }

  // Fall back to the modern originalPolicy field when present
  return getStringValue(report, "originalPolicy");
}

// Normalize the disposition field from the report object
function getDisposition(report: UnknownRecord): string | undefined {
  // Return the disposition when it exists as a string
  return getStringValue(report, "disposition");
}

// Process and log an incoming CSP violation report
export function processCspReport(headers: UnknownRecord, body: unknown): void {
  // Normalize the incoming payload into a consistent report object
  const report = extractCspReport(body);

  // Pull the blocked URI into a readable value for logging
  const blockedUri = getBlockedUri(report);

  // Pull the violated directive into a readable value for logging
  const violatedDirective = getViolatedDirective(report);

  // Pull the original policy into a readable value for logging
  const originalPolicy = getOriginalPolicy(report);

  // Pull the disposition into a readable value for logging
  const disposition = getDisposition(report);

  // Print a clear separator so CSP reports stand out in the server logs
  console.log("\n================ CSP VIOLATION REPORT ================\n");

  // Log the request headers so content type and origin details are visible
  console.log("Headers:", headers);

  // Log the raw parsed body so the full violation payload can be inspected
  console.log("Body:", JSON.stringify(body, null, 2));

  // Log the blocked URI so you can see which resource triggered the violation
  console.log("Blocked URI:", blockedUri);

  // Log the violated directive so you can see which policy was triggered
  console.log("Violated Directive:", violatedDirective);

  // Log the original policy so you can compare it against the violation
  console.log("Original Policy:", originalPolicy);

  // Log the disposition so you can tell enforce mode from report-only mode
  console.log("Disposition:", disposition);

  // Print a closing separator so each report is easy to find in the terminal
  console.log("\n======================================================\n");
}
