import { artworkGradient } from '../../state/selectors';
import { SURFACE_GLYPHS } from '../primitives/Icon';
import type { SurfaceId } from '../../state/types';

interface CompactLeftProps {
  surface: SurfaceId;
  text: string;
  accent: string;
  trackIx: number;
  /** Narrower while compact so the value on the right always fits. */
  maxWidth: string;
  onOpen: () => void;
}

/** Left shoulder: the glyph or artwork tile plus a one-line summary. */
export function CompactLeft({
  surface,
  text,
  accent,
  trackIx,
  maxWidth,
  onOpen,
}: CompactLeftProps) {
  const Glyph = SURFACE_GLYPHS[surface as keyof typeof SURFACE_GLYPHS];

  return (
    <button
      type="button"
      className="compact-lane halo-enter"
      onClick={onOpen}
      title={text}
      style={{ '--compact-text-max': maxWidth } as React.CSSProperties}
    >
      {surface === 'media' ? (
        <span
          className="compact-lane__art"
          style={{ '--artwork': artworkGradient(trackIx) } as React.CSSProperties}
          aria-hidden
        />
      ) : Glyph ? (
        <span style={{ color: accent, display: 'flex', flex: 'none' }}>
          <Glyph size={19} />
        </span>
      ) : null}
      <span className="compact-lane__title truncate">{text}</span>
    </button>
  );
}

interface CompactRightProps {
  text: string;
  accent: string;
  /** A countdown ring for timers and transfers. */
  ring?: { offset: string } | undefined;
  /** Level bars while media is playing. */
  bars?: readonly number[] | undefined;
  onOpen: () => void;
}

/** Right shoulder: a live value, with a ring or level bars where it helps. */
export function CompactRight({ text, accent, ring, bars, onOpen }: CompactRightProps) {
  return (
    <button type="button" className="compact-lane compact-lane--right halo-enter" onClick={onOpen}>
      {ring && (
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          style={{ flex: 'none', transform: 'rotate(-90deg)' }}
          aria-hidden
        >
          <circle cx="12" cy="12" r="9.5" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2.6" />
          <circle
            cx="12"
            cy="12"
            r="9.5"
            fill="none"
            stroke={accent}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeDasharray="59.7"
            strokeDashoffset={ring.offset}
            style={{ transition: 'stroke-dashoffset 400ms linear' }}
          />
        </svg>
      )}
      {bars && (
        <span className="level-bars" aria-hidden>
          {bars.map((height, index) => (
            <span
              key={index}
              className="level-bars__bar"
              style={{ height, '--accent': accent } as React.CSSProperties}
            />
          ))}
        </span>
      )}
      <span className="compact-lane__value tnum">{text}</span>
    </button>
  );
}
