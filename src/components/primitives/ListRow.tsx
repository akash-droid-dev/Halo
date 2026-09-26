import type { ReactNode } from 'react';

interface ListRowProps {
  /** Leading glyph or artwork tile. */
  leading?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  /** Trailing action cluster, right-aligned. */
  trailing?: ReactNode;
  background?: string;
  borderColor?: string;
}

/**
 * Leading glyph or tile, title, meta, trailing action cluster. The title
 * truncates with a tail ellipsis and meta stays right-aligned.
 */
export function ListRow({
  leading,
  title,
  meta,
  trailing,
  background,
  borderColor,
}: ListRowProps) {
  return (
    <div
      className="list-row"
      style={{
        ...(background ? { background } : {}),
        ...(borderColor ? { borderColor } : {}),
      }}
    >
      {leading}
      <div className="list-row__body">
        <div className="list-row__title truncate">{title}</div>
        {meta != null && <div className="list-row__meta">{meta}</div>}
      </div>
      {trailing && <div className="list-row__trailing">{trailing}</div>}
    </div>
  );
}
