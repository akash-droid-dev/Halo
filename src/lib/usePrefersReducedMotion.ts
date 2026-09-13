import { useEffect } from 'react';

/**
 * The brief asks the app to read the system reduce-motion setting and observe
 * changes to it, rather than relying on the in-app toggle alone. On the web
 * that is `prefers-reduced-motion`.
 */
export function useSystemReducedMotion(onChange: (reduced: boolean) => void): void {
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (query.matches) onChange(true);
    const listener = (event: MediaQueryListEvent) => onChange(event.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, [onChange]);
}
