interface SecondaryChipProps {
  label: string;
  color: string;
  title: string;
  /** An unhandled urgent event pulses until it is acknowledged. */
  urgent: boolean;
  onSwitch: () => void;
}

/**
 * The next-highest activity. Clicking it promotes that activity to the primary
 * slot, which is what keeps every simultaneous activity one click away.
 */
export function SecondaryChip({ label, color, title, urgent, onSwitch }: SecondaryChipProps) {
  return (
    <button
      type="button"
      className={urgent ? 'secondary-chip secondary-chip--urgent' : 'secondary-chip'}
      title={title}
      aria-label={title}
      onClick={(event) => {
        // Do not also trigger the shoulder's own open handler.
        event.stopPropagation();
        onSwitch();
      }}
      style={{ '--chip-color': color } as React.CSSProperties}
    >
      <span className={urgent ? 'secondary-chip__dot halo-pulse' : 'secondary-chip__dot'} />
      <span className="secondary-chip__label">{label}</span>
    </button>
  );
}
