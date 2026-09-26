/** Renders a shortcut as individual key caps. */
export function KeyCombo({ keys }: { keys: readonly string[] }) {
  return (
    <div style={{ display: 'flex', gap: 4, flex: 'none' }}>
      {keys.map((key) => (
        <kbd key={key} className="keycap">
          {key}
        </kbd>
      ))}
    </div>
  );
}
