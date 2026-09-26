import type { ReactNode } from 'react';

interface EmptyStateProps {
  /** One line of what will appear here. */
  line: ReactNode;
  glyph?: ReactNode;
  action?: { label: string; onRun: () => void };
}

/** Used by the shelf, clipboard, transfers, and agenda. */
export function EmptyState({ line, glyph, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {glyph && <span style={{ color: 'var(--ink-tertiary)' }}>{glyph}</span>}
      <p className="empty-state__line" style={{ margin: 0 }}>
        {line}
      </p>
      {action && (
        <button type="button" className="btn btn--quiet btn--small" onClick={action.onRun}>
          {action.label}
        </button>
      )}
    </div>
  );
}
