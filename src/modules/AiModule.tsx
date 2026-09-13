import { useHalo, useHaloApi } from '../state/context';
import { ProgressBar } from '../components/primitives/ProgressBar';

/** The exact text that would leave the machine, shown before anything is sent. */
const SUBMISSION =
  'Expansion should remain anchored to the notch with continuous geometry and stable content placement. Use restrained spring motion and provide a reduced-motion alternative.';

/**
 * AI actions. Off by default, and nothing is ever sent automatically — the
 * content to be submitted is shown verbatim before any action is available.
 */
export function AiModule() {
  const { state } = useHalo();
  const { dispatch, toast, runAi, hold, release } = useHaloApi();
  const { ai } = state;

  if (!ai.enabled) {
    return (
      <div className="module-stack">
        <div className="opt-in">
          <div className="opt-in__title">AI actions are off</div>
          <p className="opt-in__body" style={{ margin: 0 }}>
            This module is disabled by default. When enabled, selected text or a clipboard entry
            you choose is sent to the provider you configure. HALO always shows the exact content
            before it is submitted, and never sends anything automatically.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => {
              dispatch({ type: 'aiEnable' });
              toast('AI actions enabled', 'Executed by prototype', '#0A84FF');
            }}
          >
            Enable AI actions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="module-stack"
      style={{ gap: 10 }}
      onMouseEnter={hold}
      onMouseLeave={release}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10.5, color: 'var(--ink-meta)' }}>
          Provider: {ai.provider}
        </span>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className="btn btn--quiet btn--small"
          onClick={() => dispatch({ type: 'aiDisable' })}
        >
          Turn off
        </button>
      </div>

      <div className="ai-preview">
        <div className="section-label">Content to be submitted</div>
        <p className="ai-preview__content" style={{ margin: 0 }}>
          {SUBMISSION}
        </p>
        <div style={{ fontSize: 10, color: 'var(--ink-quaternary)' }}>
          {SUBMISSION.length} characters — selected in Notes. Nothing is sent until you choose an
          action.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn--quiet btn--small"
          disabled={ai.busy}
          onClick={() => runAi('summary')}
        >
          Summarise
        </button>
        <button
          type="button"
          className="btn btn--quiet btn--small"
          disabled={ai.busy}
          onClick={() => runAi('rewrite')}
        >
          Rewrite clearly
        </button>
        <button
          type="button"
          className="btn btn--small"
          style={{
            border: '0.5px solid var(--hairline-strong)',
            background: 'rgba(255,69,58,.12)',
            color: '#FF8A82',
          }}
          onClick={() => runAi('error')}
        >
          Trigger an error
        </button>
      </div>

      {ai.busy && (
        <div className="ai-busy">
          <div style={{ flex: 1 }}>
            <ProgressBar value={ai.pct} color="#0A84FF" thin label="AI request progress" />
          </div>
          <span style={{ fontSize: 10.5, color: 'var(--ink-secondary)', whiteSpace: 'nowrap' }}>
            Sending to provider…
          </span>
          <button
            type="button"
            className="btn btn--quiet"
            style={{ flex: 'none', padding: '4px 10px', fontSize: 10.5, borderRadius: 7 }}
            onClick={() => dispatch({ type: 'aiCancel' })}
          >
            Cancel
          </button>
        </div>
      )}

      {ai.result && (
        <div
          className="ai-result"
          style={
            {
              '--result-bg': ai.error ? 'rgba(255,69,58,.12)' : 'rgba(48,209,88,.1)',
              '--result-border': ai.error ? 'rgba(255,69,58,.26)' : 'rgba(48,209,88,.24)',
            } as React.CSSProperties
          }
          role={ai.error ? 'alert' : 'status'}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11.5,
              lineHeight: 1.55,
              wordBreak: 'break-word',
              color: ai.error ? '#FF9A93' : 'var(--ink-body)',
            }}
          >
            {ai.result}
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {ai.error ? (
              <>
                <button
                  type="button"
                  className="btn btn--small"
                  style={{ background: 'rgba(255,255,255,.14)', color: '#fff', borderRadius: 7 }}
                  onClick={() => runAi('summary')}
                >
                  Retry
                </button>
                <button
                  type="button"
                  className="btn btn--small"
                  style={{ background: 'rgba(255,255,255,.14)', color: '#fff', borderRadius: 7 }}
                  onClick={() => dispatch({ type: 'aiClearResult' })}
                >
                  Dismiss
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn--small"
                  style={{ background: 'rgba(255,255,255,.14)', color: '#fff', borderRadius: 7 }}
                  onClick={() => toast('Result copied', 'Executed by prototype', '#0A84FF')}
                >
                  Copy result
                </button>
                <button
                  type="button"
                  className="btn btn--small"
                  style={{ background: 'rgba(255,255,255,.14)', color: '#fff', borderRadius: 7 }}
                  onClick={() => dispatch({ type: 'aiClearResult' })}
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
