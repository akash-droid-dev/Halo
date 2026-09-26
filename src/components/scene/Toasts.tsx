import { useHalo } from '../../state/context';

/**
 * Bottom-left, stacked, self-dismissing. Each toast carries a provenance line
 * naming what performed the action, which the shipping app replaces with the
 * acting integration.
 */
export function Toasts() {
  const { state } = useHalo();

  return (
    <div className="toasts" role="status" aria-live="polite" aria-atomic={false}>
      {state.toasts.map((toast) => (
        <div key={toast.id} className="toast halo-enter">
          <span
            className="dot dot--sm"
            style={{ '--dot': toast.color, marginTop: 5 } as React.CSSProperties}
          />
          <div className="stack" style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <div className="toast__text">{toast.text}</div>
            <div className="toast__kind">{toast.kind}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
