import { useMemo } from 'react';

import { useHalo, useHaloApi } from '../../state/context';
import { Toggle } from '../primitives/Toggle';

interface Trigger {
  label: string;
  onFire: () => void;
}

/**
 * The presentation panel. Triggers here stand in for operating-system events
 * the web cannot observe; playback, timers, scrubbing, search, and settings
 * are genuinely executed by this implementation. Each toast says which.
 */
export function DemoPanel() {
  const { state } = useHalo();
  const { dispatch, toast } = useHaloApi();

  const triggers = useMemo<Trigger[]>(
    () => [
      {
        label: 'Music starts',
        onFire: () => {
          dispatch({ type: 'mediaStart' });
          toast('Now Playing reported by Music', 'Simulated system event', '#FF9A6B');
        },
      },
      { label: 'Music pauses', onFire: () => dispatch({ type: 'mediaPause' }) },
      {
        label: 'Meeting in 60s',
        onFire: () => {
          dispatch({ type: 'meetingSchedule', inMs: 60_000 });
          toast('Design review starts in 1 minute', 'Simulated calendar event', '#5E5CE6');
        },
      },
      {
        label: 'Timer completes',
        onFire: () => {
          const first = state.timers[0];
          if (!first) return;
          dispatch({ type: 'timerComplete', id: first.id });
          toast('Deep work timer finished', 'Simulated alert', '#FFD426');
        },
      },
      {
        label: 'Charging connected',
        onFire: () => {
          dispatch({ type: 'batterySet', charging: true });
          toast('96W USB-C power adapter connected', 'Simulated system event', '#30D158');
        },
      },
      {
        label: 'Low battery',
        onFire: () => {
          dispatch({ type: 'batterySet', charging: false, level: 0.09 });
          toast('Battery at 9%', 'Simulated system event', '#FF453A');
        },
      },
      {
        label: 'Source disconnects',
        onFire: () => {
          dispatch({ type: 'mediaDisconnect' });
          toast('Now-playing source disconnected', 'Simulated integration failure', '#FF9F0A');
        },
      },
      {
        label: 'Calendar access denied',
        onFire: () => {
          dispatch({ type: 'setCalendarPerm', value: 'denied' });
          dispatch({ type: 'openSurface', surface: 'meeting' });
          toast('EventKit authorization denied', 'Simulated permission state', '#FF9F0A');
        },
      },
      {
        label: 'Everything at once',
        onFire: () => {
          // Four simultaneous activities, to watch the scheduler resolve them.
          dispatch({ type: 'mediaStart' });
          dispatch({ type: 'meetingSchedule', inMs: 75_000 });
          dispatch({ type: 'batterySet', charging: true });
          dispatch({ type: 'timerAdd', name: 'Deep work', minutes: 4 });
          dispatch({ type: 'setMode', mode: 'compact' });
          toast(
            'Four activities active — priority resolved to the meeting',
            'Simulated system events',
            '#BF5AF2',
          );
        },
      },
      {
        label: 'Restore defaults',
        onFire: () => {
          dispatch({ type: 'demoReset' });
          toast('Demo state reset', 'Executed by prototype', '#BF5AF2');
        },
      },
    ],
    [dispatch, toast, state.timers],
  );

  const prefs = [
    { label: 'Reduce motion', on: state.reduceMotion, flag: 'reduceMotion' as const },
    {
      label: 'Reduce transparency',
      on: state.reduceTransparency,
      flag: 'reduceTransparency' as const,
    },
    { label: 'Increase contrast', on: state.increaseContrast, flag: 'increaseContrast' as const },
    { label: 'Bright wallpaper', on: state.wallpaperLight, flag: 'wallpaperLight' as const },
  ];

  return (
    <div className="demo-panel" style={{ width: state.demoOpen ? 318 : 208 }} data-halo-surface>
      <button
        type="button"
        className="demo-panel__toggle"
        aria-expanded={state.demoOpen}
        onClick={() => dispatch({ type: 'toggleDemoPanel' })}
      >
        <span
          className="dot"
          style={{ '--dot': '#BF5AF2', width: 7, height: 7 } as React.CSSProperties}
        />
        <span className="demo-panel__title">Presentation panel</span>
        <span style={{ fontSize: 10.5, color: 'var(--ink-tertiary)', whiteSpace: 'nowrap' }}>
          {state.demoOpen ? 'Hide' : 'Show'}
        </span>
      </button>

      {state.demoOpen && (
        <div className="demo-panel__body">
          <p className="note" style={{ margin: 0 }}>
            Triggers below simulate operating-system events. Playback, timers, scrubbing, search,
            and settings are genuinely executed by this implementation.
          </p>

          <div className="demo-panel__triggers">
            {triggers.map((trigger) => (
              <button
                key={trigger.label}
                type="button"
                className="demo-panel__trigger"
                onClick={trigger.onFire}
              >
                {trigger.label}
              </button>
            ))}
          </div>

          <div className="demo-panel__rule" />

          <div className="stack" style={{ gap: 7 }}>
            {prefs.map((pref) => (
              <div key={pref.flag} className="demo-panel__pref">
                <span style={{ flex: 1, minWidth: 0 }}>{pref.label}</span>
                <Toggle
                  on={pref.on}
                  label={pref.label}
                  size="sm"
                  onToggle={() => dispatch({ type: 'toggleFlag', flag: pref.flag })}
                />
              </div>
            ))}

            <div className="demo-panel__pref">
              <label htmlFor="hover-intent" style={{ flex: 1, minWidth: 0 }}>
                Hover intent {state.hoverIntent} ms
              </label>
              <input
                id="hover-intent"
                className="slider"
                type="range"
                min={0}
                max={600}
                step={50}
                value={state.hoverIntent}
                style={{ width: 104 }}
                onChange={(event) =>
                  dispatch({ type: 'setHoverIntent', ms: Number.parseInt(event.target.value, 10) })
                }
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn--danger"
            onClick={() => {
              dispatch({ type: 'demoReset' });
              toast('Demo state reset', 'Executed by prototype', '#BF5AF2');
            }}
          >
            Reset demo state
          </button>
        </div>
      )}
    </div>
  );
}
