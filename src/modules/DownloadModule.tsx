import { useHalo, useHaloApi } from '../state/context';
import { EmptyState } from '../components/primitives/EmptyState';
import { ProgressBar } from '../components/primitives/ProgressBar';
import type { Transfer } from '../state/types';

interface TransferAction {
  label: string;
  title: string;
  onRun: () => void;
  disabled?: boolean;
  primary?: boolean;
}

/**
 * Transfers. Pause is only offered where the source actually reports the
 * capability — the rest show a disabled control with the reason, rather than
 * a button that silently does nothing.
 */
export function DownloadModule() {
  const { state } = useHalo();
  const { dispatch, toast } = useHaloApi();

  const actionsFor = (transfer: Transfer): TransferAction[] => {
    const actions: TransferAction[] = [];
    const { state: phase } = transfer;

    if (phase === 'active' || phase === 'paused') {
      actions.push(
        transfer.pausable
          ? {
              label: phase === 'paused' ? 'Resume' : 'Pause',
              title: 'Supported by this integration',
              onRun: () => dispatch({ type: 'transferTogglePause', id: transfer.id }),
            }
          : {
              label: 'Pause',
              title: 'This source does not report a pause capability',
              disabled: true,
              onRun: () => {},
            },
      );
      actions.push({
        label: 'Cancel',
        title: 'Cancel transfer',
        onRun: () => {
          dispatch({ type: 'transferCancel', id: transfer.id });
          toast(`Cancelled ${transfer.name}`, 'Simulated system action', '#64D2FF');
        },
      });
    }

    if (phase === 'failed') {
      actions.push({
        label: 'Retry',
        title: 'Retry transfer',
        primary: true,
        onRun: () => dispatch({ type: 'transferRetry', id: transfer.id }),
      });
    }

    if (phase === 'done' || phase === 'failed') {
      actions.push({
        label: 'Reveal in Finder',
        title: 'Reveal in Finder',
        onRun: () =>
          toast(`Revealed ${transfer.name} in Finder`, 'Simulated system action', '#BF5AF2'),
      });
    }

    return actions;
  };

  if (state.transfers.length === 0) {
    return (
      <div className="module-stack module-stack--tight">
        <EmptyState line="No transfers in the last 24 hours." />
      </div>
    );
  }

  return (
    <div className="module-stack module-stack--tight">
      {state.transfers.map((transfer) => {
        const failed = transfer.state === 'failed';
        const done = transfer.state === 'done';
        const paused = transfer.state === 'paused';
        const color = failed
          ? '#FF453A'
          : done
            ? '#30D158'
            : paused
              ? 'rgba(255,255,255,.55)'
              : '#64D2FF';
        const stateLabel = failed
          ? 'Failed'
          : done
            ? 'Complete'
            : paused
              ? 'Paused'
              : `${Math.round(transfer.pct * 100)}%`;

        return (
          <div
            key={transfer.id}
            className="transfer-card"
            style={
              {
                '--row-bg': failed ? 'rgba(255,69,58,.09)' : 'var(--surface-raised)',
                '--row-border': failed ? 'rgba(255,69,58,.24)' : 'var(--hairline-soft)',
                '--row-ink': color,
              } as React.CSSProperties
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="stack" style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <div className="transfer-card__name truncate">{transfer.name}</div>
                <div className="transfer-card__src truncate">{transfer.src}</div>
              </div>
              <div className="transfer-card__state">{stateLabel}</div>
            </div>

            {!done && (
              <ProgressBar
                value={transfer.pct}
                color={color}
                failed={failed}
                label={`${transfer.name} progress`}
              />
            )}

            <div className="transfer-card__actions">
              {actionsFor(transfer).map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className={
                    action.primary ? 'btn btn--primary btn--small' : 'btn btn--quiet btn--small'
                  }
                  title={action.title}
                  disabled={action.disabled}
                  onClick={action.onRun}
                >
                  {action.label}
                </button>
              ))}
              {!transfer.pausable && (transfer.state === 'active' || paused) && (
                <span className="transfer-card__note">This source does not expose pause</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
