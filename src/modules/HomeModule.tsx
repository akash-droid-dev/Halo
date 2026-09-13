import { accentFor, MODULE_IDS, TITLES } from '../state/constants';
import { useHalo, useHaloApi } from '../state/context';
import { moduleStatus } from '../state/selectors';

/** The module grid — everything HALO can show, plus Settings. */
export function HomeModule() {
  const { state, surface } = useHalo();
  const { dispatch, open } = useHaloApi();

  const tiles = [
    ...MODULE_IDS.filter((id) => state.enabledModules.includes(id)).map((id) => ({
      id,
      label: TITLES[id],
      state: moduleStatus(state, id),
      dot: accentFor(id),
      onPick: () => open(id),
    })),
    {
      id: 'settings' as const,
      label: 'Settings',
      state: 'Preferences',
      dot: 'rgba(255,255,255,.4)',
      onPick: () => dispatch({ type: 'settingsOpen' }),
    },
  ];

  return (
    <div className="module-grid">
      {tiles.map((tile) => (
        <button
          key={tile.id}
          type="button"
          className="module-grid__tile"
          aria-current={surface === tile.id}
          onClick={tile.onPick}
          style={{ '--dot': tile.dot } as React.CSSProperties}
        >
          <span className="module-grid__dot" aria-hidden />
          <span className="module-grid__label">{tile.label}</span>
          <span className="module-grid__state">{tile.state}</span>
        </button>
      ))}
    </div>
  );
}
