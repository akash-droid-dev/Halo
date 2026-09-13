/** `m:ss` — used for short countdowns and elapsed positions. */
export function fmt(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** `h:mm:ss` once an hour is on the clock, `m:ss` below that. */
export function fmtLong(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

export function pct(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

export function shortId(prefix: string): string {
  return prefix + Math.random().toString(36).slice(2, 7);
}

export function timeOfDay(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** Extension used for the shelf tile, capped at four characters. */
export function fileExt(name: string): string {
  const ext = name.split('.').pop() ?? 'file';
  return ext.slice(0, 4).toUpperCase();
}

export function fileExtRaw(name: string): string {
  return (name.split('.').pop() ?? 'file').toLowerCase();
}
