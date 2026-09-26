import { fmt, fmtLong, timeOfDay } from '../lib/format';
import { AGENDA } from '../state/constants';
import { useHalo, useHaloApi } from '../state/context';
import { PermissionCard } from '../components/primitives/PermissionCard';
import { CamIcon, MicIcon } from '../components/primitives/Icon';

/** Next event, join, and in-call controls. Calendar access can be absent. */
export function MeetingModule() {
  const { state } = useHalo();
  const { dispatch, toast } = useHaloApi();
  const { meeting } = state;

  if (state.calendarPerm !== 'granted') {
    return (
      <div className="module-stack">
        <PermissionCard
          title="Calendar access denied"
          reason={
            <>
              HALO cannot read events. Every other module keeps working. Grant access in System
              Settings › Privacy &amp; Security › Calendars.
            </>
          }
          actions={[
            {
              label: 'Open System Settings',
              onRun: () =>
                toast(
                  'Opened System Settings › Privacy & Security › Calendars',
                  'Simulated system action',
                  '#BF5AF2',
                ),
            },
            {
              label: 'Re-check access',
              primary: true,
              onRun: () => {
                dispatch({ type: 'setCalendarPerm', value: 'granted' });
                toast(
                  'Calendar access granted — Meetings restored',
                  'Simulated permission change',
                  '#30D158',
                );
              },
            },
          ]}
        />
      </div>
    );
  }

  const live = meeting.phase === 'live';
  const until = meeting.at - state.now;
  const liveFor = meeting.joinedAt ? state.now - meeting.joinedAt : 0;
  // Amber inside two minutes, green once live.
  const color = live ? '#30D158' : until < 120_000 ? '#FF9F0A' : '#5E5CE6';

  return (
    <div className="module-stack">
      <div
        className="meeting-card"
        style={{ '--meeting-color': color } as React.CSSProperties}
      >
        <span className="meeting-card__spine" aria-hidden />
        <div className="stack" style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <div className="meeting-card__title">{meeting.title}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.52)' }}>
            {live
              ? `In progress — ${meeting.app}`
              : `${timeOfDay(meeting.at)} — ${Math.max(0, Math.round(until / 60_000))} min away`}
          </div>
          <div className="truncate" style={{ fontSize: 11.5, color: 'var(--ink-meta)' }}>
            {meeting.location}
          </div>
        </div>
        <div className="stack" style={{ alignItems: 'flex-end', gap: 6 }}>
          <div className="meeting-card__countdown">
            {live ? fmtLong(liveFor) : until > 0 ? fmt(until) : 'Now'}
          </div>
          <button
            type="button"
            className="btn"
            style={{
              background: live ? 'rgba(255,255,255,.16)' : 'rgba(94,92,230,.95)',
              color: '#fff',
              fontWeight: 620,
            }}
            onClick={() => {
              if (live) {
                toast(`Brought ${meeting.app} to the front`, 'Simulated system action', '#5E5CE6');
                return;
              }
              dispatch({ type: 'meetingJoin' });
              toast('Joined Design review in Zoom', 'Simulated system action', '#5E5CE6');
            }}
          >
            {live ? 'Open' : 'Join'}
          </button>
        </div>
      </div>

      {live && (
        <div className="stack" style={{ gap: 8 }}>
          <div className="section-label">Controls — {meeting.app}</div>
          <div className="call-controls">
            <button
              type="button"
              className="call-btn"
              aria-pressed={meeting.mic === 'off'}
              onClick={() => dispatch({ type: 'meetingToggleMic' })}
              style={
                {
                  '--call-bg':
                    meeting.mic === 'on' ? 'var(--control-fill-quiet)' : 'rgba(255,69,58,.16)',
                  '--call-border':
                    meeting.mic === 'on' ? 'var(--hairline-strong)' : 'rgba(255,69,58,.3)',
                  '--call-ink': meeting.mic === 'on' ? 'var(--ink-primary)' : '#FF8A82',
                } as React.CSSProperties
              }
            >
              <MicIcon size={15} />
              {meeting.mic === 'on' ? 'Mic on' : 'Muted'}
            </button>
            <button
              type="button"
              className="call-btn"
              aria-pressed={meeting.cam === 'off'}
              onClick={() => dispatch({ type: 'meetingToggleCam' })}
              style={
                {
                  '--call-bg':
                    meeting.cam === 'on' ? 'var(--control-fill-quiet)' : 'rgba(255,69,58,.16)',
                  '--call-border':
                    meeting.cam === 'on' ? 'var(--hairline-strong)' : 'rgba(255,69,58,.3)',
                  '--call-ink': meeting.cam === 'on' ? 'var(--ink-primary)' : '#FF8A82',
                } as React.CSSProperties
              }
            >
              <CamIcon size={15} />
              {meeting.cam === 'on' ? 'Camera on' : 'Camera off'}
            </button>
            <button
              type="button"
              className="call-btn call-btn--leave"
              onClick={() => {
                dispatch({ type: 'meetingLeave' });
                toast('Left the meeting', 'Simulated system action', '#5E5CE6');
              }}
            >
              Leave
            </button>
          </div>
          <p className="note" style={{ margin: 0 }}>
            Controls act on the frontmost {meeting.app} window. Native build requires per-app
            integration or Accessibility permission.
          </p>
        </div>
      )}

      <div className="stack" style={{ gap: 6 }}>
        <div className="section-label">Today</div>
        {AGENDA.map((event, index) => (
          <div
            key={`${event.time}-${event.title}`}
            className="agenda-row"
            style={
              {
                '--row-bg': index === 0 ? 'rgba(94,92,230,.12)' : 'rgba(255,255,255,.04)',
                '--row-ink': index === 0 ? '#5E5CE6' : 'rgba(255,255,255,.22)',
              } as React.CSSProperties
            }
          >
            <span className="agenda-row__spine" aria-hidden />
            <span className="agenda-row__time">{event.time}</span>
            <span className="agenda-row__title truncate">{event.title}</span>
            <span className="agenda-row__tag">{event.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
