interface SegmentProps<T extends string> {
  value: T;
  options: readonly (readonly [T, string])[];
  label: string;
  onPick: (value: T) => void;
}

/** Segmented control — used for settings, presets, and density. */
export function Segment<T extends string>({ value, options, label, onPick }: SegmentProps<T>) {
  return (
    <div className="segment" role="group" aria-label={label}>
      {options.map(([key, text]) => (
        <button
          key={key}
          type="button"
          className="segment__option"
          aria-pressed={value === key}
          onClick={() => onPick(key)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
