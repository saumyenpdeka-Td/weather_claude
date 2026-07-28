import type { FailureType } from "./classifyFailure";

const MESSAGES: Record<FailureType, string> = {
  "no-data": "No data for this Location.",
  "provider-unreachable": "Weather Provider unreachable.",
  "provider-error": "Weather Provider returned an error.",
  "network-error": "No network connection.",
};

/** A distinct, specific message per failure type — never a generic catch-all. */
export function failureMessage(failureType: FailureType): string {
  return MESSAGES[failureType];
}
