import { fmtLong } from '../lib/format';
import { useHalo, useHaloApi } from '../state/context';
import { timerRemaining } from '../state/selectors';
import { Toggle } from '../components/primitives/Toggle';
import { PauseIcon, PlayIcon, ResetIcon } from '../components/primitives/Icon';

const PRESETS = [5, 10, 25, 50] as const;
/** Circumference of the r=16 progress ring. */
const RING = 100.5;

/** Named timers, presets, and work/break cycles. */
export function TimerModule() {
  const { state } = useHalo();
  const { dispatch, addTimer, hold, release } = useHaloApi();

  return (
    <div className="module-stack">
      {state.timers.map((timer) => {
        const remaining = timerRemaining(timer, state.now);
        const elapsed = timer.done ? 1 : 1 - remaining / timer.durMs;
        const running = timer.running && !timer.done;
        const ink = timer.done
          ? '#FFD426'
          : running
            ? '#0A84FF'
            : 'rgba(255,255,255,.55)';
        const toggleLabel = running ? 'Pause timer' : 'Resume timer';

        return (
          <div
            key={timer.id}
            className="timer-row"
            style={
              {
                '--row-bg': timer.done ? 'rgba(255,212,38,.12)' : 'var(--surface-raised)',
                '--row-border': timer.done ? 'rgba(255,212,38,.3)' : 'var(--hairline-soft)',
                '--row-ink': ink,
              } as React.CSSProperties
            }
          >
            <svg
              width={38}
              height={38}
              viewBox="0 0 40 40"
              style={{ flex: 'none', transform: 'rotate(-90deg)' }}
              aria-hidden
            >
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="3.4" />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke={ink}
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeDasharray={RING}
                strokeDashoffset={(RING * (1 - elapsed)).toFixed(1)}
                style={{ transition: 'stroke-dashoffset 400ms linear' }}
              />
            </svg>

            <div className="stack" style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <div className="timer-row__name truncate">{timer.name}</div>
              <div
                className="timer-row__sub"
                style={{ color: timer.done ? '#FFD426' : 'var(--ink-meta)' }}
              >
                {timer.done
                  ? 'Completed — tap reset to run again'
                  : running
                    ? `${Math.round(timer.durMs / 60_000)} min timer`
                    : 'Paused'}
              </div>
            </div>

            <div className="timer-row__readout">
              {timer.done ? 'Done' : fmtLong(remaining)}
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 30, height: 30, borderRadius: 9 }}
                aria-label={toggleLabel}
                title={toggleLabel}
                onClick={() => dispatch({ type: 'timerToggle', id: timer.id })}
              >
                {running ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
              </button>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 30, height: 30, borderRadius: 9 }}
                aria-label="Reset timer"
                title="Reset"
                onClick={() => dispatch({ type: 'timerReset', id: timer.id })}
              >
                <ResetIcon size={13} />
              </button>
            </div>
          </div>
        );
      })}

      <div className="stack" style={{ gap: 7 }}>
        <div className="section-label">Presets</div>
        <div className="preset-row">
          {PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              className="btn btn--quiet btn--small"
              onClick={() => addTimer(`${minutes} min focus`, minutes)}
            >
              {minutes} min
            </button>
          ))}
        </div>
      </div>

      {/* A focused field holds the panel open so typing is never interrupted. */}
      <div
        style={{ display: 'flex', gap: 6, alignItems: 'center' }}
        onMouseEnter={hold}
        onMouseLeave={release}
      >
        <input
          className="field"
          style={{ flex: 1 }}
          value={state.draftName}
          placeholder="Timer name"
          aria-label="New timer name"
          onFocus={hold}
          onBlur={release}
          onChange={(event) => dispatch({ type: 'setDraftName', value: event.target.value })}
        />
        <input
          className="field field--mins"
          value={state.draftMins}
          inputMode="numeric"
          aria-label="Minutes"
          onFocus={hold}
          onBlur={release}
          onChange={(event) => dispatch({ type: 'setDraftMins', value: event.target.value })}
        />
        <button
          type="button"
          className="btn btn--primary"
          style={{ flex: 'none' }}
          onClick={() =>
            addTimer(state.draftName || 'Timer', Number.parseFloat(state.draftMins) || 10)
          }
        >
          Start
        </button>
      </div>

      <div className="inline-setting">
        <div className="stack" style={{ gap: 2 }}>
          <div className="inline-setting__label">Work / break cycles</div>
          <div className="inline-setting__sub">
            {state.cycles ? '25 min work, 5 min break, repeating' : 'Off — timers run once'}
          </div>
        </div>
        <Toggle
          on={state.cycles}
          label="Work break cycles"
          onToggle={() => dispatch({ type: 'toggleCycles' })}
        />
      </div>
    </div>
  );
}
