import type { ConditionsStatus } from "./useCurrentConditions";
import type { DisplayConditions, UnitsSystem } from "./unitsConversion";
import { weatherCodeSummary } from "./weatherCodeSummary";
import { formatObservedTime } from "./formatObservedTime";
import { UnitsToggle } from "./UnitsToggle";
import styles from "./CurrentConditionsCard.module.css";

// COMPONENT-SIZE-JUSTIFICATION: renders every status branch (unavailable /
// loading / ready) of the "observation slip" in one place — splitting per
// branch would scatter one cohesive layout with no independent reuse.

interface CurrentConditionsCardProps {
  locationName: string;
  status: ConditionsStatus;
  display: DisplayConditions | null;
  fetchedAt: number | null;
  isStale: boolean;
  unitsSystem: UnitsSystem;
  onUnitsChange: (unitsSystem: UnitsSystem) => void;
}

/** The "station observation slip" current-conditions display (AC-1, 2, 4, 6, 7). */
export function CurrentConditionsCard({
  locationName,
  status,
  display,
  fetchedAt,
  isStale,
  unitsSystem,
  onUnitsChange,
}: CurrentConditionsCardProps) {
  return (
    <div className={styles.slip}>
      <div className={styles.header}>
        <span className={styles.location}>{locationName.toUpperCase()}</span>
        <span className={styles.timestamp}>
          {fetchedAt ? `OBS ${formatObservedTime(fetchedAt)}` : "OBS —"}
        </span>
      </div>

      {status === "unavailable" && (
        <div className={styles.unavailable}>
          <span className={styles.stamp}>NO SIGNAL</span>
          <p>Conditions unavailable — station not responding.</p>
        </div>
      )}

      {status === "loading" && !display && <p className={styles.loading}>Reading station…</p>}

      {display && (
        <>
          <div className={styles.heroRow}>
            <span className={styles.hero}>
              {display.temperature}
              {display.temperatureUnit}
            </span>
            {isStale ? (
              <span className={styles.staleStamp}>STALE</span>
            ) : (
              <span className={styles.liveDot}>LIVE</span>
            )}
          </div>
          <p className={styles.feelsLike}>
            feels like {display.feelsLike}
            {display.temperatureUnit}
          </p>
          <div className={styles.instrumentRow}>
            <span>RH {display.humidityPct}%</span>
            <span>
              WIND {display.windSpeed} {display.windSpeedUnit}
            </span>
            <span>
              PRECIP {display.precipitation} {display.precipitationUnit}
            </span>
          </div>
          <p className={styles.summary}>{weatherCodeSummary(display.weatherCode)}</p>
        </>
      )}

      <UnitsToggle value={unitsSystem} onChange={onUnitsChange} />
    </div>
  );
}
