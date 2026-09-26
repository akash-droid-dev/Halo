import { useHalo } from '../../state/context';
import { clockLabel } from '../../state/selectors';
import { AppleIcon, WifiIcon } from '../primitives/Icon';

const MENUS = ['File', 'Edit', 'View', 'Window', 'Help'] as const;

/**
 * The menu bar behind the island. Its centre gutter matches the island's, so
 * menu titles never disappear under the camera housing.
 */
export function MenuBar() {
  const { state } = useHalo();
  const level = Math.round(state.battery.level * 100);
  const color = state.battery.charging
    ? '#30D158'
    : state.battery.level <= 0.2
      ? '#FF453A'
      : 'rgba(255,255,255,.85)';

  return (
    <div className="menubar" role="presentation">
      <div className="menubar__lane menubar__lane--left">
        <span style={{ opacity: 0.9, flex: 'none', display: 'flex' }}>
          <AppleIcon size={14} />
        </span>
        <span style={{ fontWeight: 650 }}>HALO</span>
        {MENUS.map((menu) => (
          <span key={menu} className="menubar__item">
            {menu}
          </span>
        ))}
      </div>

      <div className="menubar__gutter" aria-hidden />

      <div className="menubar__lane menubar__lane--right">
        <span style={{ opacity: 0.8, flex: 'none', display: 'flex' }}>
          <WifiIcon size={15} />
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: 0.85 }}>
          <span className="tnum" style={{ fontSize: 11.5 }}>
            {level}%
          </span>
          <span
            className="menubar__battery"
            style={{ '--battery-color': color } as React.CSSProperties}
          >
            <span className="menubar__battery-fill" style={{ width: `${Math.max(6, level)}%` }} />
          </span>
        </span>
        <span className="tnum" style={{ opacity: 0.9 }}>
          {clockLabel(state.now)}
        </span>
      </div>
    </div>
  );
}
