import { AUDIO_OUTPUTS } from '../state/constants';
import { useHalo, useHaloApi } from '../state/context';
import { ListRow } from '../components/primitives/ListRow';

/** Audio output and Bluetooth accessories. */
export function DevicesModule() {
  const { state } = useHalo();
  const { dispatch, toast } = useHaloApi();

  return (
    <div className="module-stack" style={{ gap: 11 }}>
      <div className="stack" style={{ gap: 6 }}>
        <div className="section-label">Audio output</div>
        <div role="radiogroup" aria-label="Audio output" className="stack" style={{ gap: 6 }}>
          {AUDIO_OUTPUTS.map((name) => {
            const active = state.media.output === name;
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={active}
                className="place-row"
                style={{
                  border: '0.5px solid var(--hairline-soft)',
                  borderRadius: 'var(--radius-card)',
                  padding: '9px 11px',
                  ...(active ? { background: 'rgba(10,132,255,.22)' } : {}),
                }}
                onClick={() => {
                  dispatch({ type: 'mediaPickOutput', output: name });
                  toast(`Output switched to ${name}`, 'Simulated system action', '#BF5AF2');
                }}
              >
                <span
                  className="dot"
                  style={
                    { '--dot': active ? '#0A84FF' : 'rgba(255,255,255,.25)' } as React.CSSProperties
                  }
                />
                <span
                  className="truncate"
                  style={{ flex: 1, fontSize: 12, color: 'var(--ink-body)' }}
                >
                  {name}
                </span>
                <span className="tnum" style={{ fontSize: 10.5, color: 'var(--ink-meta)' }}>
                  {name === 'AirPods Pro' ? '41%' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="stack" style={{ gap: 6 }}>
        <div className="section-label">Bluetooth accessories</div>
        {state.bt.map((device) => {
          const connected = device.pct !== null;
          return (
            <ListRow
              key={device.name}
              leading={
                <span
                  className="dot"
                  style={
                    {
                      '--dot': connected ? '#30D158' : 'rgba(255,255,255,.22)',
                    } as React.CSSProperties
                  }
                />
              }
              title={device.name}
              meta={device.state}
              trailing={
                <span
                  className="tnum"
                  style={{
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                    color:
                      device.pct === null
                        ? 'var(--ink-quaternary)'
                        : device.pct <= 0.2
                          ? '#FF6961'
                          : 'var(--ink-secondary)',
                  }}
                >
                  {device.pct === null ? '—' : `${Math.round(device.pct * 100)}%`}
                </span>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
