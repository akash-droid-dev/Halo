import type { ReactNode } from 'react';

import { NOTCH_GUTTER } from '../../state/constants';

interface ShoulderRowProps {
  left: ReactNode;
  right: ReactNode;
  /** Shoulder inset: 13pt collapsed, 16pt expanded. */
  inset: string;
  /** Zero on a display with no camera housing. */
  gutter?: number;
}

/**
 * Left and right content lanes flanking the hardware, with a reserved centre
 * gutter equal to the measured notch width plus 8pt.
 */
export function ShoulderRow({ left, right, inset, gutter = NOTCH_GUTTER }: ShoulderRowProps) {
  return (
    <div className="shoulder-row" style={{ '--shoulder-inset': inset } as React.CSSProperties}>
      <div className="shoulder-row__lane shoulder-row__lane--left">{left}</div>
      <div className="shoulder-row__gutter" style={{ width: gutter }} aria-hidden />
      <div className="shoulder-row__lane shoulder-row__lane--right">{right}</div>
    </div>
  );
}
