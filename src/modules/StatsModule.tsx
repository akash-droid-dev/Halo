import { useMemo } from 'react';

import { useHalo, useHaloApi } from '../state/context';

const BAR_COUNT = 18;

/**
 * A deterministic sparkline from the sample seed. Using the seed rather than
 * `Math.random` keeps the chart stable across re-renders, so it only moves
 * when the sampler actually refreshes.
 */
function sparkline(base: number, spread: number, seed: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) =>
    Math.round(
      base + Math.sin((i + seed) * 0.9) * spread + Math.cos((i + seed) * 2.1) * spread * 0.4,
    ),
  );
}

/** CPU, memory, storage, and network. */
export function StatsModule() {
  const { state } = useHalo();
  const { dispatch } = useHaloApi();
  const seed = state.statsSeed;

  const blocks = useMemo(
    () => [
      {
        label: 'CPU',
        value: String(18 + (seed % 7)),
        unit: '% of 12 cores',
        color: '#30D158',
        bars: sparkline(42, 26, seed),
        sub: 'Sampled every 2 s',
      },
      {
        label: 'Memory',
        value: '11.4',
        unit: 'GB of 18 GB',
        color: '#64D2FF',
        bars: sparkline(58, 12, seed),
        sub: 'Pressure: normal',
      },
      {
        label: 'Storage',
        value: '312',
        unit: 'GB free of 1 TB',
        color: '#BF5AF2',
        bars: sparkline(68, 4, seed),
        sub: 'Updated on volume change',
      },
      {
        label: 'Network',
        value: (2.4 + (seed % 5) / 10).toFixed(1),
        unit: 'MB/s down',
        color: '#FF9F0A',
        bars: sparkline(34, 30, seed),
        sub: 'Wi-Fi — 5 GHz',
      },
    ],
    [seed],
  );

  return (
    <div className="module-stack" style={{ gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: 10.5,
            color: state.statsStale ? '#FFC55E' : 'var(--ink-meta)',
          }}
        >
          {state.statsStale
            ? 'Data is stale — the sampler was paused on battery'
            : 'Live — sampled every 2 s'}
        </span>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className="btn btn--quiet btn--small"
          onClick={() => dispatch({ type: 'statsRefresh' })}
        >
          Refresh now
        </button>
      </div>

      <div className="stats-grid">
        {blocks.map((block) => (
          <div
            key={block.label}
            className="stat-card"
            style={
              {
                '--stat-color': block.color,
                '--stat-opacity': state.statsStale ? 0.3 : 0.85,
              } as React.CSSProperties
            }
          >
            <div className="stat-card__head">
              <span className="section-label">{block.label}</span>
              <div style={{ flex: 1 }} />
              <span className="stat-card__value">{block.value}</span>
              <span className="stat-card__unit">{block.unit}</span>
            </div>
            <div className="stat-card__spark" aria-hidden>
              {block.bars.map((height, index) => (
                <span key={index} className="stat-card__bar" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="stat-card__sub">{block.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
