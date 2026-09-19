import { useCallback, useEffect, useRef } from 'react';

import { useHaloApi } from '../state/context';

/**
 * A collapse hold that cannot be leaked.
 *
 * Holds are acquired on pointer-enter and on field focus, and released on the
 * matching exit — but React does not fire `onMouseLeave` or `onBlur` when a
 * component unmounts. A module that unmounts while still holding (the palette
 * closing with its autofocused input, or switching modules with the pointer
 * inside one) would leave the count positive forever, and every later collapse
 * would fail the `hold > 0` guard.
 *
 * This wrapper tracks what the calling component still owns and releases
 * exactly that much on unmount, so the count always returns to where it
 * started.
 */
export function useCollapseHold(): { hold: () => void; release: () => void } {
  const { hold: acquire, release: relinquish } = useHaloApi();
  const owned = useRef(0);

  const hold = useCallback(() => {
    owned.current += 1;
    acquire();
  }, [acquire]);

  const release = useCallback(() => {
    if (owned.current === 0) return;
    owned.current -= 1;
    relinquish();
  }, [relinquish]);

  useEffect(
    () => () => {
      // Give back whatever this component still holds.
      for (let i = 0; i < owned.current; i += 1) relinquish();
      owned.current = 0;
    },
    [relinquish],
  );

  return { hold, release };
}
