import { useEffect } from 'react';

export interface Hotkey {
  /** Matched case-insensitively against `event.key`. */
  key: string;
  meta?: boolean;
  alt?: boolean;
  ctrl?: boolean;
  run: () => void;
}

/**
 * Window-level shortcuts. Every gesture in HALO has a keyboard equivalent, so
 * these are registered globally rather than on a focused element.
 */
export function useHotkeys(hotkeys: Hotkey[]): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      for (const hotkey of hotkeys) {
        if (event.key.toLowerCase() !== hotkey.key.toLowerCase()) continue;
        // `⌘` and `⌃` are interchangeable so the shortcuts work off a Mac too.
        const wantsCommand = Boolean(hotkey.meta || hotkey.ctrl);
        const hasCommand = event.metaKey || event.ctrlKey;
        if (wantsCommand !== hasCommand) continue;
        if (Boolean(hotkey.alt) !== event.altKey) continue;
        event.preventDefault();
        hotkey.run();
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkeys]);
}
