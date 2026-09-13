import { useMemo } from 'react';

import { useHalo, useHaloApi } from '../state/context';
import { EmptyState } from '../components/primitives/EmptyState';
import { CloseIcon, CopyIcon, PinIcon, SearchIcon } from '../components/primitives/Icon';
import type { Clip } from '../state/types';

const RETENTION_OPTIONS = ['1 hour', '7 days', 'Forever'] as const;

const BADGES: Record<Clip['type'], string> = {
  link: 'URL',
  image: 'IMG',
  secure: '••',
  text: 'TXT',
};

/**
 * Clipboard history. Capture is opt-in, secure-field content is never stored,
 * and the entry for one is rendered as unavailable rather than hidden — so the
 * exclusion is visible rather than implied.
 */
export function ClipboardModule() {
  const { state } = useHalo();
  const { dispatch, toast, hold, release } = useHaloApi();

  const items = useMemo(() => {
    const query = state.clipQuery.trim().toLowerCase();
    const matched = state.clips.filter(
      (clip) =>
        !query ||
        clip.text.toLowerCase().includes(query) ||
        clip.app.toLowerCase().includes(query),
    );
    // Pinned entries sort to the top, otherwise newest-first order is kept.
    return [...matched].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [state.clips, state.clipQuery]);

  if (!state.clipCapture) {
    return (
      <div className="module-stack">
        <div className="opt-in">
          <div className="opt-in__title">Clipboard history is off</div>
          <p className="opt-in__body" style={{ margin: 0 }}>
            Capture is opt-in. When enabled, HALO stores recent text, links, and images locally.
            Entries from secure fields are never stored, and excluded apps are skipped.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => {
              dispatch({ type: 'clipEnable' });
              toast(
                'Clipboard capture enabled — secure fields are excluded',
                'Executed by prototype',
                '#BF5AF2',
              );
            }}
          >
            Turn on capture
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="stack"
      style={{ gap: 9, height: '100%' }}
      onMouseEnter={hold}
      onMouseLeave={release}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            display: 'flex',
            flex: 1,
            minWidth: 0,
            alignItems: 'center',
            gap: 8,
            padding: '8px 11px',
            borderRadius: 'var(--radius-card)',
            background: 'rgba(255,255,255,.06)',
            border: '0.5px solid var(--hairline-strong)',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,.45)', flex: 'none', display: 'flex' }}>
            <SearchIcon size={14} />
          </span>
          <input
            className="field--bare"
            style={{ fontSize: 12.5 }}
            value={state.clipQuery}
            placeholder="Search clipboard history"
            aria-label="Search clipboard history"
            onFocus={hold}
            onBlur={release}
            onChange={(event) => dispatch({ type: 'clipSearch', value: event.target.value })}
          />
        </div>
        <button
          type="button"
          className="btn btn--quiet btn--small"
          style={{
            flex: 'none',
            ...(state.clipPaused
              ? { background: 'rgba(255,159,10,.18)', color: '#FFC55E' }
              : {}),
          }}
          title={
            state.clipPaused ? 'Resume capturing new entries' : 'Stop capturing new entries'
          }
          aria-pressed={state.clipPaused}
          onClick={() => dispatch({ type: 'clipTogglePause' })}
        >
          {state.clipPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="stack" style={{ flex: 1, minHeight: 0, gap: 5, overflowY: 'auto' }}>
        {items.map((clip) => {
          const locked = clip.type === 'secure';
          return (
            <div
              key={clip.id}
              className="clip-item"
              style={
                {
                  '--row-bg': clip.pinned ? 'rgba(191,90,242,.1)' : 'rgba(255,255,255,.045)',
                  '--row-border': clip.pinned
                    ? 'rgba(191,90,242,.24)'
                    : 'var(--hairline)',
                  '--clip-ink': locked ? 'var(--ink-meta)' : 'var(--ink-body)',
                } as React.CSSProperties
              }
            >
              <span className="clip-item__badge" aria-hidden>
                {BADGES[clip.type]}
              </span>
              <div className="stack" style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <div className="clip-item__text clamp-2">{clip.text}</div>
                <div className="clip-item__meta">
                  {clip.app} — {clip.ago}
                  {clip.pinned ? ' — pinned' : ''}
                </div>
              </div>
              <button
                type="button"
                className={
                  clip.pinned ? 'icon-btn icon-btn--xs icon-btn--pinned' : 'icon-btn icon-btn--xs'
                }
                title={clip.pinned ? 'Unpin' : 'Pin to top'}
                aria-label={clip.pinned ? 'Unpin entry' : 'Pin entry to top'}
                aria-pressed={clip.pinned}
                onClick={() => dispatch({ type: 'clipTogglePin', id: clip.id })}
              >
                <PinIcon size={12} />
              </button>
              <button
                type="button"
                className="icon-btn icon-btn--xs"
                disabled={locked}
                title={
                  locked
                    ? 'Unavailable — secure field content is never stored'
                    : 'Copy again'
                }
                aria-label={locked ? 'Unavailable for secure entries' : 'Copy again'}
                onClick={() => {
                  if (locked) return;
                  toast('Copied to the clipboard', 'Executed by prototype', '#BF5AF2');
                }}
              >
                <CopyIcon size={12} />
              </button>
              <button
                type="button"
                className="icon-btn icon-btn--xs icon-btn--danger"
                title="Delete entry"
                aria-label="Delete entry"
                onClick={() => dispatch({ type: 'clipDelete', id: clip.id })}
              >
                <CloseIcon size={11} />
              </button>
            </div>
          );
        })}

        {items.length === 0 && (
          <EmptyState
            line={
              state.clipQuery
                ? `Nothing in history matches “${state.clipQuery}”.`
                : 'History is empty. Copy something and it will appear here.'
            }
          />
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          paddingTop: 2,
        }}
      >
        <span className="clip-item__meta">Retention: {state.clipRetention}</span>
        <div style={{ display: 'flex', gap: 5 }} role="group" aria-label="Clipboard retention">
          {RETENTION_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className="btn btn--quiet"
              aria-pressed={state.clipRetention === option}
              style={{
                padding: '4px 9px',
                fontSize: 10.5,
                fontWeight: 570,
                borderRadius: 7,
                ...(state.clipRetention === option
                  ? { background: 'rgba(10,132,255,.22)', color: '#8FC4FF' }
                  : {}),
              }}
              onClick={() => dispatch({ type: 'clipSetRetention', value: option })}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
