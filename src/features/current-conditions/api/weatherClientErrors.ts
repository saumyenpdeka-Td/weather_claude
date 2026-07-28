/** The device couldn't reach the network at all (no connectivity, DNS, etc.). */
export class NetworkError extends Error {
  constructor() {
    super("Network error — check your connection");
    this.name = "NetworkError";
  }
}

/** The Weather Provider responded with a failure but gave no explicit error reason. */
export class ProviderUnreachableError extends Error {
  constructor() {
    super("Weather Provider is unreachable");
    this.name = "ProviderUnreachableError";
  }
}

/** The Weather Provider responded with an explicit error (e.g. invalid request). */
export class ProviderError extends Error {
  constructor(reason?: string) {
    super(reason ?? "Weather Provider returned an error");
    this.name = "ProviderError";
  }
}

/** The Weather Provider responded successfully but had no conditions for this Location. */
export class NoDataError extends Error {
  constructor() {
    super("No data available for this Location");
    this.name = "NoDataError";
  }
}
