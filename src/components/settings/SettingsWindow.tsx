import { SETTINGS_PANES } from '../../state/constants';
import { useHalo, useHaloApi } from '../../state/context';
import { paneContent } from './panes';
import { SettingRowView } from './SettingRowView';

/** The Settings window: twelve panes over one row renderer. */
export function SettingsWindow() {
  const { state } = useHalo();
  const { dispatch, toast } = useHaloApi();
  const content = paneContent(state.settings.pane, { state, dispatch, toast });

  return (
    <div
      className="settings-window halo-enter"
      role="dialog"
      aria-modal={false}
      aria-label="HALO Settings"
      data-halo-surface
    >
      <div className="settings-window__sidebar">
        <div className="settings-window__titlebar">
          <button
            type="button"
            className="settings-window__light settings-window__light--close"
            title="Close"
            aria-label="Close settings"
            onClick={() => dispatch({ type: 'settingsClose' })}
          />
          <span className="settings-window__light" aria-hidden />
          <span className="settings-window__light" aria-hidden />
        </div>
        <nav className="settings-window__panes" aria-label="Settings sections">
          {SETTINGS_PANES.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="settings-window__pane-item"
              aria-current={state.settings.pane === id}
              onClick={() => dispatch({ type: 'settingsPane', pane: id })}
            >
              <span className="settings-window__pane-dot" aria-hidden />
              <span className="truncate" style={{ flex: 1 }}>
                {label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="settings-window__main">
        <div className="settings-window__head">
          <h1 className="settings-window__title" style={{ margin: 0 }}>
            {content.title}
          </h1>
          <p className="settings-window__sub" style={{ margin: 0 }}>
            {content.sub}
          </p>
        </div>
        <div className="settings-window__rows">
          {content.rows.map((row, index) => (
            <SettingRowView key={`${row.kind}-${row.label}-${index}`} row={row} />
          ))}
        </div>
      </div>
    </div>
  );
}
