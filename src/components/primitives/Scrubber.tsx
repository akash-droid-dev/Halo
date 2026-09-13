import { useCallback, useRef, useState } from 'react';

import { fmt } from '../../lib/format';

interface ScrubberProps {
  /** Elapsed position in ms. */
  position: number;
  duration: number;
  onSeek: (fraction: number) => void;
  /** Acquire/release the collapse guard for the duration of the drag. */
  onHold: () => void;
  onRelease: () => void;
  reduceMotion: boolean;
}

/**
 * Track, elapsed fill, knob on hover, tap-to-seek plus drag. Collapse is
 * suppressed for the whole gesture so the panel cannot close mid-scrub.
 */
export function Scrubber({
  position,
  duration,
  onSeek,
  onHold,
  onRelease,
  reduceMotion,
}: ScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const seekTo = useCallback(
    (clientX: number) => {
      const element = trackRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0) return;
      onSeek(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)));
    },
    [onSeek],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      onHold();
      setDragging(true);
      seekTo(event.clientX);

      const move = (moveEvent: PointerEvent) => seekTo(moveEvent.clientX);
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        setDragging(false);
        onRelease();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    },
    [onHold, onRelease, seekTo],
  );

  // Keyboard seeking in 5-second steps, so the control is not pointer-only.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const step = 5000 / duration;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        onSeek(Math.min(1, position / duration + step));
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        onSeek(Math.max(0, position / duration - step));
      } else if (event.key === 'Home') {
        event.preventDefault();
        onSeek(0);
      }
    },
    [duration, onSeek, position],
  );

  const percent = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;
  // While dragging, or under reduced motion, the fill must not lag the pointer.
  const transition =
    dragging || reduceMotion ? 'none' : 'width 260ms linear, left 260ms linear';

  return (
    <div className="stack" style={{ gap: 6 }}>
      <div
        ref={trackRef}
        className="scrubber"
        data-dragging={dragging}
        role="slider"
        tabIndex={0}
        aria-label="Playback position"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration / 1000)}
        aria-valuenow={Math.round(position / 1000)}
        aria-valuetext={`${fmt(position)} of ${fmt(duration)}`}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        onFocus={onHold}
        onBlur={onRelease}
      >
        <div className="scrubber__track" />
        <div className="scrubber__fill" style={{ width: `${percent}%`, transition }} />
        <div className="scrubber__knob" style={{ left: `${percent}%`, transition }} />
      </div>
      <div className="scrubber__times">
        <span>{fmt(position)}</span>
        <span>-{fmt(Math.max(0, duration - position))}</span>
      </div>
    </div>
  );
}
