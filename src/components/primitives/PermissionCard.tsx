import type { ReactNode } from 'react';

import { WarningIcon } from './Icon';

interface PermissionAction {
  label: string;
  onRun: () => void;
  primary?: boolean;
}

interface PermissionCardProps {
  title: string;
  /** One sentence of plain reason — why the feature needs this. */
  reason: ReactNode;
  actions: PermissionAction[];
  tone?: 'warning' | 'danger';
}

/**
 * State, one sentence of plain reason, and a recovery action. Rendered inline
 * in the module it blocks, never as a modal, so the rest of the app keeps
 * working while access is missing.
 */
export function PermissionCard({ title, reason, actions, tone = 'warning' }: PermissionCardProps) {
  const palette =
    tone === 'danger'
      ? { bg: 'rgba(255,69,58,.1)', border: 'rgba(255,69,58,.26)', ink: '#FF8A82' }
      : { bg: 'rgba(255,159,10,.1)', border: 'rgba(255,159,10,.26)', ink: '#FFC55E' };

  return (
    <div
      className="permission-card"
      role="group"
      aria-label={title}
      style={
        {
          '--perm-bg': palette.bg,
          '--perm-border': palette.border,
          '--perm-ink': palette.ink,
        } as React.CSSProperties
      }
    >
      <div className="permission-card__head">
        <WarningIcon size={16} />
        <span>{title}</span>
      </div>
      <p className="permission-card__reason" style={{ margin: 0 }}>
        {reason}
      </p>
      {actions.length > 0 && (
        <div className="permission-card__actions">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={action.primary ? 'btn btn--primary' : 'btn btn--quiet'}
              onClick={action.onRun}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
