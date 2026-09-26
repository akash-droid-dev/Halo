import { WINDOW_ACTIONS, WINDOW_TARGETS } from '../state/constants';
import { useHalo, useHaloApi } from '../state/context';
import { PermissionCard } from '../components/primitives/PermissionCard';

/**
 * Window arrangement. Accessibility access is requested the first time a
 * window action runs, not at launch, so the module is browsable without it.
 */
export function WindowsModule() {
  const { state } = useHalo();
  const { dispatch, toast, runWindowAction } = useHaloApi();
  const target = WINDOW_TARGETS[state.windowsTarget % WINDOW_TARGETS.length]!;
  const needsAccess = state.accessibilityPerm !== 'granted';

  return (
    <div className="module-stack" style={{ gap: 11 }}>
      <div className="window-target">
        <span className="traffic-lights" aria-hidden>
          <span className="traffic-lights__dot" style={{ background: '#FF5F57' }} />
          <span className="traffic-lights__dot" style={{ background: '#FEBC2E' }} />
          <span className="traffic-lights__dot" style={{ background: '#28C840' }} />
        </span>
        <div className="stack" style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <div
            className="truncate"
            style={{ fontSize: 12, fontWeight: 590, color: 'var(--ink-primary)' }}
          >
            {target.title}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-meta)' }}>
            Target window · {target.display}
          </div>
        </div>
        <button
          type="button"
          className="btn btn--quiet btn--small"
          style={{ flex: 'none' }}
          onClick={() => dispatch({ type: 'windowCycleTarget' })}
        >
          Change
        </button>
      </div>

      {needsAccess && (
        <PermissionCard
          title="Accessibility access needed"
          reason="Moving and resizing other applications’ windows requires Accessibility permission. HALO asks for it the first time you use a window action, not at launch."
          actions={[
            {
              label: 'Grant access',
              primary: true,
              onRun: () => {
                dispatch({ type: 'setAccessibilityPerm', value: 'granted' });
                toast(
                  'Accessibility access granted — window actions enabled',
                  'Simulated permission change',
                  '#30D158',
                );
              },
            },
          ]}
        />
      )}

      <div className="window-actions">
        {WINDOW_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            className="window-action"
            title={
              needsAccess
                ? `${action.label} — needs Accessibility access`
                : `${action.label} — ${target.title}`
            }
            onClick={() => runWindowAction(action.label)}
          >
            <span className="window-action__frame" aria-hidden>
              <span
                className="window-action__proxy"
                style={
                  {
                    '--proxy-fill': action.fill,
                    left: action.x,
                    top: action.y,
                    width: action.w,
                    height: action.h,
                  } as React.CSSProperties
                }
              />
            </span>
            <span className="window-action__label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
