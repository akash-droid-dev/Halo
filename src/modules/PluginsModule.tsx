import { useHalo, useHaloApi } from '../state/context';
import { Toggle } from '../components/primitives/Toggle';

/**
 * Installed extensions. Plugin cards are built from the same primitives as
 * built-in modules, which is what keeps third-party content visually
 * indistinguishable — and a failed plugin cannot affect the built-ins.
 */
export function PluginsModule() {
  const { state } = useHalo();
  const { dispatch, toast } = useHaloApi();

  return (
    <div className="module-stack module-stack--tight">
      {state.plugins.map((plugin) => {
        const broken = plugin.health === 'error';
        return (
          <div
            key={plugin.id}
            className="plugin-card"
            style={
              {
                '--row-bg': broken ? 'rgba(255,69,58,.08)' : 'var(--surface-raised)',
                '--row-border': broken ? 'rgba(255,69,58,.22)' : 'var(--hairline-soft)',
              } as React.CSSProperties
            }
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span className="plugin-card__icon" aria-hidden>
                {plugin.name[0]}
              </span>
              <div className="stack" style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span
                    className="truncate"
                    style={{ fontSize: 12.5, fontWeight: 620, color: 'var(--ink-primary)' }}
                  >
                    {plugin.name}
                  </span>
                  <span
                    className="badge"
                    style={{ fontSize: 9.5, fontWeight: 620, padding: '1.5px 6px' }}
                  >
                    {plugin.vendor}
                  </span>
                </div>
                <div className="workflow-card__desc">{plugin.desc}</div>
                <div className="plugin-card__perms">Permissions: {plugin.perms}</div>
              </div>
              <Toggle
                on={plugin.enabled}
                label={`Enable ${plugin.name}`}
                size="sm"
                onToggle={() => dispatch({ type: 'pluginToggle', id: plugin.id })}
              />
            </div>

            {plugin.health !== 'ok' && (
              <div
                className="plugin-card__banner"
                style={
                  {
                    '--banner-bg': broken ? 'rgba(255,69,58,.14)' : 'rgba(10,132,255,.14)',
                    '--banner-ink': broken ? '#FF9A93' : '#8FC4FF',
                  } as React.CSSProperties
                }
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  {broken
                    ? 'Disconnected — the plugin stopped responding and was suspended. Built-in modules are unaffected.'
                    : 'Update available — version 1.4 adds parameter support.'}
                </span>
                <button
                  type="button"
                  className="btn btn--small"
                  style={{
                    flex: 'none',
                    background: 'rgba(255,255,255,.16)',
                    color: '#fff',
                    fontSize: 10.5,
                    fontWeight: 620,
                    borderRadius: 7,
                  }}
                  onClick={() => {
                    dispatch({ type: 'pluginHeal', id: plugin.id });
                    toast(
                      `${plugin.name} ${broken ? 'reloaded' : 'updated to 1.4'}`,
                      'Simulated plugin action',
                      '#FF9F0A',
                    );
                  }}
                >
                  {broken ? 'Reload' : 'Update'}
                </button>
              </div>
            )}
          </div>
        );
      })}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '11px 12px',
          borderRadius: 11,
          background: 'rgba(255,255,255,.035)',
          border: '0.5px dashed var(--hairline-strong)',
        }}
      >
        <p className="note" style={{ margin: 0, flex: 1, minWidth: 0 }}>
          Plugin discovery is a concept in this prototype. The native build loads signed bundles
          from an on-disk directory and runs each in an isolated XPC service.
        </p>
        <button
          type="button"
          className="btn btn--quiet btn--small"
          style={{ flex: 'none' }}
          onClick={() =>
            toast(
              'Plugin discovery is a concept only in this prototype',
              'Not implemented',
              '#FF9F0A',
            )
          }
        >
          Browse
        </button>
      </div>
    </div>
  );
}
