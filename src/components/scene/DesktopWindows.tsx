/** Two inert windows, so the island can be judged against real content. */
export function DesktopWindows() {
  return (
    <div className="desktop__windows" aria-hidden>
      <div
        className="fake-window"
        style={{ left: '7%', top: 190, width: 'min(430px, 38%)' }}
      >
        <div className="fake-window__bar">
          <span className="fake-window__lights">
            <span className="fake-window__light" style={{ background: '#FF5F57' }} />
            <span className="fake-window__light" style={{ background: '#FEBC2E' }} />
            <span className="fake-window__light" style={{ background: '#28C840' }} />
          </span>
          <span className="fake-window__title">Notes — Release plan</span>
        </div>
        <div className="fake-window__lines">
          <div style={{ fontSize: 14, fontWeight: 640, color: 'rgba(255,255,255,.9)' }}>
            Release plan
          </div>
          <span className="fake-window__line" style={{ width: '92%' }} />
          <span className="fake-window__line" style={{ width: '78%' }} />
          <span className="fake-window__line" style={{ width: '86%', opacity: 0.7 }} />
          <span className="fake-window__line" style={{ width: '54%', opacity: 0.7 }} />
        </div>
      </div>

      <div
        className="fake-window"
        style={{
          right: '6%',
          top: 300,
          width: 'min(360px, 32%)',
          background: 'rgba(22,22,26,.78)',
        }}
      >
        <div className="fake-window__bar" style={{ background: 'transparent' }}>
          <span className="fake-window__lights">
            <span className="fake-window__light" style={{ background: 'rgba(255,255,255,.22)' }} />
            <span className="fake-window__light" style={{ background: 'rgba(255,255,255,.22)' }} />
            <span className="fake-window__light" style={{ background: 'rgba(255,255,255,.22)' }} />
          </span>
          <span className="fake-window__title" style={{ color: 'rgba(255,255,255,.45)' }}>
            Terminal
          </span>
        </div>
        <div className="fake-window__terminal">
          <div>$ swift build -c release</div>
          <div style={{ color: 'rgba(48,209,88,.75)' }}>Compiling HALO (32 targets)</div>
          <div>$ _</div>
        </div>
      </div>
    </div>
  );
}
