import type { UnitsSystem } from "./unitsConversion";
import styles from "./UnitsToggle.module.css";

interface UnitsToggleProps {
  value: UnitsSystem;
  onChange: (unitsSystem: UnitsSystem) => void;
}

/** A rocker-style °C/°F switch — not a generic pill toggle — for the active Units System. */
export function UnitsToggle({ value, onChange }: UnitsToggleProps) {
  return (
    <div className={styles.rocker} role="group" aria-label="Units System">
      <button
        type="button"
        className={styles.rockerButton}
        aria-pressed={value === "metric"}
        onClick={() => onChange("metric")}
      >
        °C
      </button>
      <button
        type="button"
        className={styles.rockerButton}
        aria-pressed={value === "imperial"}
        onClick={() => onChange("imperial")}
      >
        °F
      </button>
    </div>
  );
}
