const MIN_QUERY_LENGTH = 2;

export interface QueryValidation {
  valid: boolean;
  reason?: "too-short";
}

/**
 * Validates a location search query before it reaches the Weather Provider.
 * A blank or under-2-character query (after trimming whitespace) is
 * "too-short" — the caller should show that message and skip the search
 * entirely rather than firing a request (AC-6).
 */
export function validateQuery(query: string): QueryValidation {
  if (query.trim().length < MIN_QUERY_LENGTH) {
    return { valid: false, reason: "too-short" };
  }
  return { valid: true };
}
