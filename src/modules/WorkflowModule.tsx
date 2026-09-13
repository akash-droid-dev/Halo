import { useHalo, useHaloApi } from '../state/context';
import { ProgressBar } from '../components/primitives/ProgressBar';

/** Saved workflows. Each run reports its own progress, result, and failure. */
export function WorkflowModule() {
  const { state } = useHalo();
  const { dispatch, toast, runWorkflow, hold, release } = useHaloApi();

  return (
    <div className="module-stack module-stack--tight">
      {state.workflows.map((workflow) => {
        const running = workflow.status === 'running';
        const failed = workflow.status === 'failed';
        const done = workflow.status === 'done';
        const statusColor = failed ? '#FF6961' : done ? '#30D158' : '#BF5AF2';

        return (
          <div
            key={workflow.id}
            className="workflow-card"
            style={
              {
                '--row-bg': failed ? 'rgba(255,69,58,.08)' : 'var(--surface-raised)',
                '--row-border': failed ? 'rgba(255,69,58,.22)' : 'var(--hairline-soft)',
              } as React.CSSProperties
            }
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div className="stack" style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <div className="workflow-card__name">{workflow.name}</div>
                <div className="workflow-card__desc">{workflow.desc}</div>
              </div>
              <button
                type="button"
                className="btn btn--small"
                style={{
                  flex: 'none',
                  fontSize: 11.5,
                  fontWeight: 620,
                  background: running ? 'rgba(255,255,255,.1)' : 'rgba(191,90,242,.9)',
                  color: running ? 'var(--ink-secondary)' : '#fff',
                }}
                disabled={running}
                onClick={() => runWorkflow(workflow.id)}
              >
                {running ? 'Running' : 'Run'}
              </button>
            </div>

            {workflow.param !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <label
                  htmlFor={`wf-${workflow.id}`}
                  style={{ fontSize: 10.5, color: 'var(--ink-meta)', whiteSpace: 'nowrap' }}
                >
                  {workflow.paramLabel}
                </label>
                <input
                  id={`wf-${workflow.id}`}
                  className="field"
                  style={{ flex: 1, padding: '6px 9px', fontSize: 11.5 }}
                  value={workflow.param}
                  onFocus={hold}
                  onBlur={release}
                  onChange={(event) =>
                    dispatch({
                      type: 'workflowSetParam',
                      id: workflow.id,
                      value: event.target.value,
                    })
                  }
                />
              </div>
            )}

            {running && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ flex: 1 }}>
                  <ProgressBar
                    value={workflow.pct}
                    color={statusColor}
                    thin
                    label={`${workflow.name} progress`}
                  />
                </div>
                <span
                  style={{ fontSize: 10.5, fontWeight: 580, color: statusColor, whiteSpace: 'nowrap' }}
                >
                  Step {Math.min(3, Math.floor(workflow.pct * 3) + 1)} of 3
                </span>
                <button
                  type="button"
                  className="btn btn--quiet"
                  style={{ padding: '4px 9px', fontSize: 10.5, fontWeight: 570, borderRadius: 7 }}
                  onClick={() => {
                    dispatch({ type: 'workflowCancel', id: workflow.id });
                    toast(`Cancelled ${workflow.name}`, 'Executed by prototype', '#BF5AF2');
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            {workflow.result && (
              <div
                className="workflow-card__result"
                style={
                  {
                    '--result-bg': failed ? 'rgba(255,69,58,.1)' : 'var(--surface-raised)',
                  } as React.CSSProperties
                }
              >
                <span
                  className="dot dot--sm"
                  style={{ '--dot': statusColor, marginTop: 5 } as React.CSSProperties}
                />
                <span style={{ flex: 1, minWidth: 0 }}>{workflow.result}</span>
                {failed && (
                  <button
                    type="button"
                    className="btn btn--primary"
                    style={{ flex: 'none', padding: '4px 10px', fontSize: 10.5, borderRadius: 7 }}
                    onClick={() => runWorkflow(workflow.id)}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
