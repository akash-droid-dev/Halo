import { DOCK_APPS } from '../../state/constants';
import { useHaloApi } from '../../state/context';

export function Dock() {
  const { toast } = useHaloApi();

  return (
    <div className="dock" role="list" aria-label="Dock">
      {DOCK_APPS.map((app) => (
        <button
          key={app.name}
          type="button"
          role="listitem"
          className="dock__item"
          title={app.name}
          aria-label={`Open ${app.name}`}
          onClick={() => toast(`Opened ${app.name}`, 'Simulated system action', '#BF5AF2')}
          style={
            {
              '--tile-fill': `linear-gradient(160deg,${app.tint},rgba(0,0,0,.55))`,
            } as React.CSSProperties
          }
        >
          {app.initial}
        </button>
      ))}
    </div>
  );
}
