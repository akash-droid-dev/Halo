interface ToggleProps {
  on: boolean;
  label: string;
  onToggle: () => void;
  /** Track width; the knob is sized to match. */
  size?: 'sm' | 'md';
}

/** A standard AppKit switch restyled for the dark island. */
export function Toggle({ on, label, onToggle, size = 'md' }: ToggleProps) {
  const width = size === 'md' ? 40 : 36;
  const height = size === 'md' ? 24 : 21;
  const knob = size === 'md' ? 19 : 17;
  const travel = width - knob - 2.5;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      data-on={on}
      className="toggle"
      style={{ width, height }}
      onClick={onToggle}
    >
      <span
        className="toggle__knob"
        style={{ width: knob, height: knob, left: on ? travel : 2.5 }}
      />
    </button>
  );
}
