import { accentFor, TITLES } from '../../state/constants';
import type { Activity, SurfaceId } from '../../state/types';
import { SearchIcon } from '../primitives/Icon';

interface ModuleSwitcherProps {
  activities: Activity[];
  current: SurfaceId;
  onPick: (id: Activity['id']) => void;
  onOpenPalette: () => void;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
}

/**
 * A rail of the live activities, the active one tinted by its accent. Also the
 * target of ⌥⇥.
 */
export function ModuleSwitcher({
  activities,
  current,
  onPick,
  onOpenPalette,
  onHoverEnter,
  onHoverLeave,
}: ModuleSwitcherProps) {
  return (
    <div
      className="switcher halo-enter"
      role="tablist"
      aria-label="Live activities"
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      {activities.map((activity) => {
        const label = TITLES[activity.id];
        return (
          <button
            key={activity.id}
            type="button"
            role="tab"
            className="switcher__item"
            title={`Switch to ${label}`}
            aria-label={`Switch to ${label}`}
            aria-pressed={current === activity.id}
            aria-selected={current === activity.id}
            onClick={() => onPick(activity.id)}
            style={{ '--dot-color': accentFor(activity.kind) } as React.CSSProperties}
          >
            <span className="switcher__dot" />
            {label}
          </button>
        );
      })}
      <button
        type="button"
        className="switcher__palette"
        title="Command palette (⌘K)"
        aria-label="Open command palette"
        onClick={onOpenPalette}
      >
        <SearchIcon size={12} />
        ⌘K
      </button>
    </div>
  );
}
