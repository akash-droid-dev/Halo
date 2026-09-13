import { MODULE_IDS, ONBOARDING_STEPS, TITLES } from '../../state/constants';
import { useHalo, useHaloApi } from '../../state/context';
import { CheckIcon } from '../primitives/Icon';
import { KeyCombo } from '../primitives/KeyCombo';

const TIPS = [
  { keys: ['⌘', 'K'], what: 'Open the command palette from anywhere' },
  { keys: ['⌥', '⇥'], what: 'Switch between simultaneous activities' },
  { keys: ['esc'], what: 'Dismiss whatever is open' },
] as const;

/**
 * Four steps: what the island is, which modules to enable, which access to
 * grant, and the keyboard summary. Access is only requested for modules the
 * user actually enabled, and every step is skippable.
 */
export function OnboardingWindow() {
  const { state } = useHalo();
  const { dispatch, toast } = useHaloApi();
  const step = state.onboardStep;
  const content = ONBOARDING_STEPS[step] ?? ONBOARDING_STEPS[0];

  const permissions = [
    {
      key: 'calendar' as const,
      label: 'Calendars',
      why: 'Needed by Meetings for the next event and join links.',
      granted: state.calendarPerm === 'granted',
      grant: () => dispatch({ type: 'setCalendarPerm', value: 'granted' }),
    },
    {
      key: 'accessibility' as const,
      label: 'Accessibility',
      why: 'Needed by Windows to move and resize other apps.',
      granted: state.accessibilityPerm === 'granted',
      grant: () => dispatch({ type: 'setAccessibilityPerm', value: 'granted' }),
    },
    {
      key: 'notifications' as const,
      label: 'Notifications',
      why: 'Needed for timer completion and transfer alerts.',
      granted: state.perms.notifications === 'granted',
      grant: () => dispatch({ type: 'setPerm', key: 'notifications', value: 'granted' }),
    },
  ];

  return (
    <div
      className="onboarding halo-enter"
      role="dialog"
      aria-modal={false}
      aria-label="HALO setup"
      data-halo-surface
    >
      <div className="onboarding__body">
        <div className="onboarding__progress" aria-hidden>
          {ONBOARDING_STEPS.map((_, index) => (
            <span
              key={index}
              className="onboarding__progress-bar"
              data-reached={index <= step}
            />
          ))}
        </div>

        <div className="stack" style={{ gap: 7 }}>
          <div className="onboarding__step">Step {step + 1} of 4</div>
          <h1 className="onboarding__title" style={{ margin: 0 }}>
            {content.title}
          </h1>
          <p className="onboarding__text" style={{ margin: 0 }}>
            {content.body}
          </p>
        </div>

        {step === 0 && (
          <div className="onboarding__stage" aria-hidden>
            <span className="onboarding__notch" />
            <span className="onboarding__hint">
              <span className="onboarding__hint-dot halo-pulse" />
              Hover, then click to open
            </span>
          </div>
        )}

        {step === 1 && (
          <div className="checkbox-grid">
            {MODULE_IDS.map((id) => {
              const on = state.enabledModules.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  className="checkbox-tile"
                  aria-pressed={on}
                  onClick={() => dispatch({ type: 'toggleModule', id })}
                >
                  <span className="checkbox-tile__box" aria-hidden>
                    {on && <CheckIcon size={10} />}
                  </span>
                  <span className="truncate" style={{ flex: 1 }}>
                    {TITLES[id]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="stack" style={{ gap: 6 }}>
            {permissions.map((permission) => (
              <div key={permission.key} className="onboarding__perm">
                <div className="stack" style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <div style={{ fontSize: 12, fontWeight: 570, color: 'rgba(255,255,255,.9)' }}>
                    {permission.label}
                  </div>
                  <div className="onboarding__perm-why">{permission.why}</div>
                </div>
                <button
                  type="button"
                  className="btn btn--small"
                  style={{
                    flex: 'none',
                    border: '0.5px solid var(--hairline-strong)',
                    background: permission.granted
                      ? 'rgba(48,209,88,.18)'
                      : 'rgba(10,132,255,.85)',
                    color: permission.granted ? '#7DE2A0' : '#fff',
                    fontWeight: 600,
                  }}
                  disabled={permission.granted}
                  onClick={permission.grant}
                >
                  {permission.granted ? 'Granted' : 'Allow'}
                </button>
              </div>
            ))}
            <p className="note" style={{ margin: 0 }}>
              Access is requested only for modules you enabled. You can skip all of this and grant
              access later.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="stack" style={{ gap: 7 }}>
            {TIPS.map((tip) => (
              <div key={tip.what} className="onboarding__tip">
                <KeyCombo keys={tip.keys} />
                <span style={{ flex: 1, minWidth: 0 }}>{tip.what}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="onboarding__footer">
        <button
          type="button"
          className="onboarding__skip"
          onClick={() => {
            dispatch({ type: 'onboardClose' });
            toast(
              'Setup skipped — enable modules later in Settings',
              'Executed by prototype',
              '#BF5AF2',
            );
          }}
        >
          Skip setup
        </button>
        <div style={{ flex: 1 }} />
        {step > 0 && (
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => dispatch({ type: 'onboardStep', delta: -1 })}
          >
            Back
          </button>
        )}
        <button
          type="button"
          className="btn btn--primary"
          style={{ padding: '8px 18px', fontWeight: 640 }}
          onClick={() =>
            step === 3
              ? dispatch({ type: 'onboardClose' })
              : dispatch({ type: 'onboardStep', delta: 1 })
          }
        >
          {step === 3 ? 'Start using HALO' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
