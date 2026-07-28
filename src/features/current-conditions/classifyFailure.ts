import { NetworkError, ProviderError, NoDataError } from "./api/weatherClient";

export type FailureType = "no-data" | "provider-unreachable" | "provider-error" | "network-error";

/** Maps a thrown fetchCurrentConditions error to a distinct failure type for display. */
export function classifyFailure(error: unknown): FailureType {
  if (error instanceof NetworkError) return "network-error";
  if (error instanceof ProviderError) return "provider-error";
  if (error instanceof NoDataError) return "no-data";
  return "provider-unreachable";
}
