# Business Domain Knowledge — Weather App

This file is the canonical glossary and business-rules reference for this
project. Read it before writing any story title or acceptance criterion.
Terminology here must be used verbatim in stories.

## Core Entities

| Term | Definition |
| --- | --- |
| Location | A place the user has searched for or selected — identified by city name, region, country, or geographic coordinates (latitude/longitude). |
| Current Conditions | The most recent observed weather data for a Location: temperature, "feels like" temperature, humidity, wind speed/direction, precipitation, and a short condition summary (e.g. "Clear", "Rain"). |
| Refresh Interval | The fixed period on which the app re-fetches Current Conditions for the active Location without user action. Default: 10 minutes. |
| Weather Provider | The third-party weather data API the app calls to obtain Current Conditions. Selection of a specific provider is a Solution Architect decision, not an Analyst one. |
| Units System | The measurement system used for display — Metric (°C, km/h) or Imperial (°F, mph). |
| Saved Location | A Location the user has explicitly marked to revisit without re-searching. |

## Business Rules

| Rule | Value | Notes |
| --- | --- | --- |
| Refresh Interval (default) | 10 minutes | Configurable range: 1–60 minutes. Confirmed default pending stakeholder sign-off — see ANALYST NOTES in the handoff. |
| Location search scope | Global — any city or coordinate pair resolvable by the Weather Provider | "All over the world" resolves to provider coverage, not a hand-maintained list. |
| Stale data threshold | Data older than 2× the Refresh Interval is flagged "stale" in the UI | Prevents silently showing outdated conditions if a refresh fails. |
| Default units | Metric | User can switch to Imperial; app remembers the last selection. |

## State Machines

### Location data lifecycle

```
Searching → Loaded → Refreshing → Loaded
                 └→ Failed (shows error, retries on next interval or manual refresh)
```

## Usage in stories

- Role names in story titles come from `stakeholders.md` in this same directory.
- Entity names above must be capitalised exactly as shown when used as proper
  nouns in acceptance criteria ("the Current Conditions for the Location").
- Business rules are acceptance-criterion inputs (e.g. "Given the Refresh
  Interval has elapsed"), not outputs.
