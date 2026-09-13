import { useHalo } from '../state/context';
import { EmptyState } from '../components/primitives/EmptyState';
import { ListRow } from '../components/primitives/ListRow';
import { BoltIcon } from '../components/primitives/Icon';

/** Charge level, status, and accessories reporting their own battery. */
export function BatteryModule() {
  const { state } = useHalo();
  const { battery } = state;
  const level = Math.round(battery.level * 100);
  const low = battery.level <= 0.2;
  const color = battery.charging ? '#30D158' : low ? '#FF453A' : 'rgba(255,255,255,.85)';

  return (
    <div className="module-stack module-stack--loose">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          className="battery-gauge"
          style={{ '--battery-color': color } as React.CSSProperties}
          role="meter"
          aria-label="Battery level"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={level}
        >
          {/* Never let the fill vanish entirely — it still reads as a gauge. */}
          <div className="battery-gauge__fill" style={{ width: `${Math.max(6, level)}%` }} />
          <span className="battery-gauge__nub" aria-hidden />
          {battery.charging && (
            <span className="battery-gauge__bolt" aria-hidden>
              <BoltIcon size={18} />
            </span>
          )}
        </div>
        <div className="stack" style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <div className="battery-readout">{level}%</div>
          <div
            style={{
              fontSize: 12,
              color: battery.charging ? '#30D158' : low ? '#FF6961' : 'var(--ink-secondary)',
            }}
          >
            {battery.charging ? 'Charging' : low ? 'Low battery' : 'On battery power'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-tertiary)' }}>
            {battery.charging
              ? 'Time estimate unavailable while charging stabilises'
              : low
                ? 'About 35 min remaining'
                : 'About 4 hr 20 min remaining'}
          </div>
        </div>
      </div>

      <div className="stack" style={{ gap: 6 }}>
        <div className="section-label">Accessories</div>
        {battery.accessories.length === 0 ? (
          <EmptyState line="No accessories reporting battery level." />
        ) : (
          battery.accessories.map((accessory) => {
            const pct = Math.round(accessory.pct * 100);
            return (
              <ListRow
                key={accessory.name}
                title={accessory.name}
                trailing={
                  <>
                    <div
                      className="mini-meter"
                      style={
                        {
                          '--meter-color':
                            accessory.pct <= 0.2 ? '#FF453A' : 'rgba(255,255,255,.75)',
                        } as React.CSSProperties
                      }
                    >
                      <div className="mini-meter__fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div
                      className="tnum"
                      style={{
                        width: 38,
                        textAlign: 'right',
                        fontSize: 11,
                        color: accessory.pct <= 0.2 ? '#FF6961' : 'var(--ink-secondary)',
                      }}
                    >
                      {pct}%
                    </div>
                  </>
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
