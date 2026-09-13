import { PERMISSION_LOOK } from '../../state/constants';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '../primitives/Icon';
import { KeyCombo } from '../primitives/KeyCombo';
import { Segment } from '../primitives/Segment';
import { Toggle } from '../primitives/Toggle';
import type { SettingRow } from './rows';

/** One renderer for every row type, so panes stay declarative. */
export function SettingRowView({ row }: { row: SettingRow }) {
  const labelId = `setting-${row.label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="setting-row">
      <div className="setting-row__head">
        <div className="stack" style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <div className="setting-row__label" id={labelId}>
            {row.label}
          </div>
          {'sub' in row && row.sub && <div className="setting-row__sub">{row.sub}</div>}
        </div>

        {row.kind === 'toggle' && (
          <Toggle on={row.on} label={row.label} onToggle={row.onToggle} />
        )}

        {row.kind === 'segment' && (
          <Segment
            value={row.value}
            options={row.options}
            label={row.label}
            onPick={row.onPick}
          />
        )}

        {row.kind === 'slider' && (
          <div className="setting-row__slider">
            <input
              className="slider"
              type="range"
              min={row.min}
              max={row.max}
              step={row.step}
              value={row.value}
              aria-labelledby={labelId}
              style={{ width: 140 }}
              onChange={(event) => row.onInput(Number.parseInt(event.target.value, 10))}
            />
            <span className="setting-row__slider-value">{row.valueLabel}</span>
          </div>
        )}

        {row.kind === 'permission' &&
          (() => {
            const look = PERMISSION_LOOK[row.state] ?? PERMISSION_LOOK.notRequested!;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 'none' }}>
                <span
                  className="setting-row__perm"
                  style={
                    { '--perm-bg': look.bg, '--perm-ink': look.color } as React.CSSProperties
                  }
                >
                  {look.label}
                </span>
                <button type="button" className="btn btn--quiet btn--small" onClick={row.onFix}>
                  {look.fix}
                </button>
              </div>
            );
          })()}

        {row.kind === 'button' && (
          <button
            type="button"
            className={row.tone === 'danger' ? 'btn btn--danger' : 'btn btn--quiet'}
            style={{ flex: 'none', fontSize: 11.5 }}
            onClick={row.onRun}
          >
            {row.buttonLabel}
          </button>
        )}

        {row.kind === 'keys' && <KeyCombo keys={row.keys} />}
      </div>

      {row.kind === 'order' && (
        <div className="order-list">
          {row.items.map((item, index) => (
            <div key={item.label} className="order-list__item">
              <span className="order-list__rank">{index + 1}</span>
              <span className="dot" style={{ '--dot': item.dot } as React.CSSProperties} />
              <span
                className="truncate"
                style={{ flex: 1, fontSize: 12, color: 'var(--ink-body)' }}
              >
                {item.label}
              </span>
              <div style={{ display: 'flex', gap: 3, flex: 'none' }}>
                <button
                  type="button"
                  className="icon-btn"
                  style={{ width: 24, height: 24, borderRadius: 6 }}
                  title="Move up"
                  aria-label={`Move ${item.label} up`}
                  disabled={index === 0}
                  onClick={() => row.onMove(index, -1)}
                >
                  <ChevronUpIcon size={11} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  style={{ width: 24, height: 24, borderRadius: 6 }}
                  title="Move down"
                  aria-label={`Move ${item.label} down`}
                  disabled={index === row.items.length - 1}
                  onClick={() => row.onMove(index, 1)}
                >
                  <ChevronDownIcon size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {row.kind === 'checkboxes' && (
        <div className="checkbox-grid">
          {row.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="checkbox-tile"
              aria-pressed={item.on}
              onClick={() => row.onToggle(item.id)}
            >
              <span className="checkbox-tile__box" aria-hidden>
                {item.on && <CheckIcon size={10} />}
              </span>
              <span className="truncate" style={{ flex: 1 }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
