import { FAVOURITE_APPS, SAVED_PLACES } from '../state/constants';
import { useHaloApi } from '../state/context';

/** Favourite apps, folders, and links. */
export function AppsModule() {
  const { toast } = useHaloApi();
  const openItem = (name: string) =>
    toast(`Opened ${name}`, 'Simulated system action', '#BF5AF2');

  return (
    <div className="module-stack">
      <div className="stack" style={{ gap: 7 }}>
        <div className="section-label">Favourite apps</div>
        <div className="app-grid">
          {FAVOURITE_APPS.map((app) => (
            <button
              key={app.name}
              type="button"
              className="app-tile"
              title={`Open ${app.name}`}
              onClick={() => openItem(app.name)}
              style={
                {
                  '--tile-fill': `linear-gradient(160deg,${app.tint},rgba(0,0,0,.5))`,
                } as React.CSSProperties
              }
            >
              <span className="app-tile__icon" aria-hidden>
                {app.name[0]}
              </span>
              <span className="app-tile__name truncate">{app.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="stack" style={{ gap: 6 }}>
        <div className="section-label">Saved places &amp; links</div>
        {SAVED_PLACES.map((place) => (
          <button
            key={place.name}
            type="button"
            className="place-row"
            onClick={() => openItem(place.name)}
          >
            <span className="dot" style={{ '--dot': place.dot } as React.CSSProperties} />
            <span className="truncate" style={{ flex: 1, fontSize: 12, color: 'var(--ink-body)' }}>
              {place.name}
            </span>
            <span style={{ fontSize: 10.5, color: 'var(--ink-quaternary)' }}>{place.kind}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
