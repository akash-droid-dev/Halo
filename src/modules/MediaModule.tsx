import { AUDIO_OUTPUTS, TRACKS } from '../state/constants';
import { useHalo, useHaloApi } from '../state/context';
import { artworkGradient } from '../state/selectors';
import { EmptyState } from '../components/primitives/EmptyState';
import { Scrubber } from '../components/primitives/Scrubber';
import {
  MusicNoteIcon,
  NextIcon,
  OutputIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  ShuffleIcon,
} from '../components/primitives/Icon';

/**
 * Now Playing. Cross-app now-playing is the highest-risk integration in the
 * brief, so the disconnected state is a first-class path, not an error.
 */
export function MediaModule() {
  const { state, mediaPos } = useHalo();
  const { dispatch, toast, hold, release } = useHaloApi();
  const track = TRACKS[state.trackIx] ?? TRACKS[0]!;
  const { media } = state;

  return (
    <div className="module-stack module-stack--loose">
      <div className="media__head">
        <div
          className="media__art"
          style={{ '--artwork': artworkGradient(state.trackIx) } as React.CSSProperties}
        >
          {track.art === null && (
            <span style={{ color: 'rgba(255,255,255,.5)' }}>
              <MusicNoteIcon size={26} />
            </span>
          )}
        </div>
        <div className="stack" style={{ flex: 1, minWidth: 0, gap: 4, paddingTop: 2 }}>
          <div className="media__title clamp-2">{track.title}</div>
          <div className="media__artist truncate">{track.artist || 'Unknown artist'}</div>
          <div className="media__source">
            <span
              className="dot dot--sm"
              style={{ '--dot': media.connected ? '#30D158' : '#FF9F0A' } as React.CSSProperties}
            />
            <span className="truncate">
              {media.connected
                ? `${media.source} → ${media.output}`
                : 'No source connected'}
            </span>
          </div>
        </div>
      </div>

      {media.connected ? (
        <>
          <Scrubber
            position={mediaPos}
            duration={track.durMs}
            reduceMotion={state.reduceMotion}
            onSeek={(fraction) => dispatch({ type: 'mediaSeek', fraction })}
            onHold={hold}
            onRelease={release}
          />

          <div className="media__transport">
            <button
              type="button"
              className={
                media.shuffle
                  ? 'transport-btn transport-btn--side transport-btn--active'
                  : 'transport-btn transport-btn--side'
              }
              aria-label="Shuffle"
              aria-pressed={media.shuffle}
              title="Shuffle"
              onClick={() => dispatch({ type: 'mediaToggleShuffle' })}
              style={
                {
                  '--tint-bg': 'rgba(255,154,107,.24)',
                  '--tint-ink': '#FFB68F',
                } as React.CSSProperties
              }
            >
              <ShuffleIcon size={15} />
            </button>

            <div className="media__transport-centre">
              <button
                type="button"
                className="transport-btn"
                aria-label="Previous track"
                title="Previous"
                onClick={() => dispatch({ type: 'mediaStep', delta: -1 })}
              >
                <PrevIcon size={17} />
              </button>
              <button
                type="button"
                className="transport-btn transport-btn--play"
                aria-label={media.playing ? 'Pause' : 'Play'}
                title={media.playing ? 'Pause' : 'Play'}
                onClick={() => dispatch({ type: 'mediaPlayPause' })}
              >
                {media.playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
              </button>
              <button
                type="button"
                className="transport-btn"
                aria-label="Next track"
                title="Next"
                onClick={() => dispatch({ type: 'mediaStep', delta: 1 })}
              >
                <NextIcon size={17} />
              </button>
            </div>

            <button
              type="button"
              className={
                media.outputOpen
                  ? 'transport-btn transport-btn--side transport-btn--active'
                  : 'transport-btn transport-btn--side'
              }
              aria-label="Audio output"
              aria-expanded={media.outputOpen}
              title="Audio output"
              onClick={() => dispatch({ type: 'mediaToggleOutputMenu' })}
              style={
                {
                  '--tint-bg': 'rgba(255,255,255,.18)',
                  '--tint-ink': '#fff',
                } as React.CSSProperties
              }
            >
              <OutputIcon size={15} />
            </button>
          </div>

          {/* An open child menu holds the panel open until it is dismissed. */}
          {media.outputOpen && (
            <div
              className="output-menu halo-enter"
              role="radiogroup"
              aria-label="Audio output"
              onMouseEnter={hold}
              onMouseLeave={release}
            >
              {AUDIO_OUTPUTS.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={media.output === name}
                  className="output-menu__item"
                  onClick={() => {
                    dispatch({ type: 'mediaPickOutput', output: name });
                    toast(`Output switched to ${name}`, 'Simulated system action', '#BF5AF2');
                  }}
                >
                  <span
                    className="dot"
                    style={
                      {
                        '--dot': media.output === name ? '#0A84FF' : 'rgba(255,255,255,.25)',
                      } as React.CSSProperties
                    }
                  />
                  <span className="truncate" style={{ flex: 1 }}>
                    {name}
                  </span>
                  <span className="tnum" style={{ fontSize: 10.5, color: 'var(--ink-meta)' }}>
                    {name === 'AirPods Pro' ? '41%' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          line={
            <>
              Playback source disconnected. Controls are unavailable until a supported player
              reports now-playing information.
            </>
          }
          action={{
            label: 'Reconnect source',
            onRun: () => {
              dispatch({ type: 'mediaReconnect' });
              toast('Now-playing source reconnected', 'Simulated system event', '#30D158');
            },
          }}
        />
      )}
    </div>
  );
}
