interface ProgressBarProps {
  /** 0–1. Ignored when `indeterminate`. */
  value?: number;
  color?: string;
  failed?: boolean;
  indeterminate?: boolean;
  thin?: boolean;
  label?: string;
}

/**
 * Determinate and indeterminate variants, used by transfers, workflows, and
 * AI actions. A failure turns the fill red and stops motion.
 */
export function ProgressBar({
  value = 0,
  color,
  failed = false,
  indeterminate = false,
  thin = false,
  label,
}: ProgressBarProps) {
  return (
    <div
      className={thin ? 'progress progress--thin' : 'progress'}
      data-failed={failed}
      data-indeterminate={indeterminate}
      role="progressbar"
      aria-label={label}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(value * 100)}
      style={color ? ({ '--progress-color': color } as React.CSSProperties) : undefined}
    >
      <div
        className="progress__fill"
        style={indeterminate ? undefined : { width: `${Math.min(100, value * 100)}%` }}
      />
    </div>
  );
}
