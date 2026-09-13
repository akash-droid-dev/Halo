import type { ActivityKind, ModuleId, SurfaceId, Track } from './types';

/** Each accent is a small signal only — never a surface fill. */
export const ACCENTS: Record<string, string> = {
  media: '#FF9A6B',
  timer: '#0A84FF',
  battery: '#30D158',
  meeting: '#5E5CE6',
  download: '#64D2FF',
  shelf: '#FFD426',
  call: '#FF453A',
  palette: '#0A84FF',
  clipboard: '#BF5AF2',
  workflow: '#BF5AF2',
  windows: '#64D2FF',
  stats: '#30D158',
  devices: '#5E5CE6',
  plugins: '#FF9F0A',
  ai: '#0A84FF',
  apps: '#64D2FF',
  home: '#0A84FF',
};

export const TITLES: Record<SurfaceId, string> = {
  media: 'Now Playing',
  timer: 'Timers',
  battery: 'Power',
  meeting: 'Meetings',
  download: 'Transfers',
  shelf: 'File Shelf',
  palette: 'Command Palette',
  clipboard: 'Clipboard',
  workflow: 'Workflows',
  windows: 'Windows',
  stats: 'System',
  devices: 'Devices',
  plugins: 'Plugins',
  ai: 'AI Actions',
  apps: 'Quick Actions',
  home: 'All Modules',
};

/**
 * Expanded height per surface. Width is fixed at 560 (620 for the palette) so
 * only the height varies between modules.
 */
export const HEIGHTS: Record<SurfaceId, number> = {
  media: 300,
  timer: 352,
  battery: 250,
  meeting: 340,
  download: 300,
  shelf: 340,
  palette: 392,
  clipboard: 380,
  workflow: 352,
  windows: 330,
  stats: 326,
  devices: 330,
  plugins: 368,
  ai: 330,
  apps: 300,
  home: 260,
};

/** Switcher and palette order. */
export const MODULE_IDS: ModuleId[] = [
  'media',
  'timer',
  'meeting',
  'battery',
  'shelf',
  'download',
  'clipboard',
  'apps',
  'workflow',
  'windows',
  'stats',
  'devices',
  'plugins',
  'ai',
];

export const MODULE_SUBTITLES: Record<ModuleId, string> = {
  media: 'Artwork, scrubbing, output',
  timer: 'Named timers and presets',
  meeting: 'Next event and call controls',
  battery: 'Charge level and accessories',
  shelf: 'Dropped files, share, reveal',
  download: 'Progress, retry, reveal',
  clipboard: 'Searchable recent items',
  apps: 'Favourite apps, folders, links',
  workflow: 'Shortcuts and saved workflows',
  windows: 'Arrange the target window',
  stats: 'CPU, memory, storage, network',
  devices: 'Audio output and accessories',
  plugins: 'Installed extensions',
  ai: 'Summarise and rewrite — off by default',
};

export const TRACKS: readonly Track[] = [
  {
    title: 'Ceremony in Blue Light',
    artist: 'Halvard Ness',
    album: 'Northbound',
    durMs: 252_000,
    art: ['#E8734A', '#8B2B4A'],
  },
  {
    title: 'A Long Walk Through the Very Quiet Part of the City at Night',
    artist: 'Meridian Quartet',
    album: 'Field Recordings, Vol. 2',
    durMs: 389_000,
    art: ['#3E7C8C', '#16303D'],
  },
  {
    title: 'Slow Harbour',
    artist: 'Ana Beaumont',
    album: '',
    durMs: 198_000,
    art: null,
  },
];

export const AUDIO_OUTPUTS = [
  'MacBook Pro Speakers',
  'AirPods Pro',
  'Studio Display',
] as const;

/** Island geometry per state — size and radius animate together. */
export const GEOMETRY = {
  rest: { w: 216, h: 32, r: 11 },
  compact: { w: 480, h: 34, r: 15 },
  preview: { w: 520, h: 112, r: 24 },
  expanded: { w: 560, h: 320, r: 30 },
  paletteWidth: 620,
} as const;

/** The reserved centre gutter: the measured notch width plus 8pt. */
export const NOTCH_GUTTER = 200;

export const SHOULDER_HEIGHT = 32;

/** Accent for an activity, falling back to the system blue. */
export function accentFor(key: ActivityKind | SurfaceId | string): string {
  return ACCENTS[key] ?? '#0A84FF';
}

export const WINDOW_TARGETS = [
  { title: 'Notes — Release plan', display: 'Built-in Retina display' },
  { title: 'Terminal — swift build', display: 'Built-in Retina display' },
  { title: 'Safari — developer.apple.com', display: 'Studio Display' },
] as const;

/** Label, accent, and the proxy rectangle drawn inside the 34×22 frame. */
export const WINDOW_ACTIONS = [
  { label: 'Left half', fill: '#0A84FF', x: '1px', y: '1px', w: '15px', h: '18px' },
  { label: 'Right half', fill: '#0A84FF', x: '16px', y: '1px', w: '15px', h: '18px' },
  { label: 'Maximize', fill: '#30D158', x: '1px', y: '1px', w: '30px', h: '18px' },
  { label: 'Centre', fill: '#64D2FF', x: '8px', y: '4px', w: '16px', h: '12px' },
  { label: 'Restore', fill: 'rgba(255,255,255,.5)', x: '4px', y: '3px', w: '18px', h: '13px' },
  { label: 'Next display', fill: '#BF5AF2', x: '18px', y: '5px', w: '13px', h: '10px' },
] as const;

export const FAVOURITE_APPS = [
  { name: 'Xcode', tint: '#1A6FE0' },
  { name: 'Figma', tint: '#A259FF' },
  { name: 'Safari', tint: '#2B7BD6' },
  { name: 'Notes', tint: '#D8A020' },
  { name: 'Music', tint: '#E0435C' },
] as const;

export const SAVED_PLACES = [
  { name: '~/Projects/halo', kind: 'Folder', dot: '#64D2FF' },
  { name: 'Motion spec — Figma', kind: 'Link', dot: '#BF5AF2' },
  { name: 'NSScreen geometry docs', kind: 'Link', dot: '#BF5AF2' },
] as const;

export const DOCK_APPS = [
  { initial: 'F', tint: '#2B7BD6', name: 'Finder' },
  { initial: 'S', tint: '#1D1D22', name: 'Safari' },
  { initial: 'M', tint: '#E0435C', name: 'Music' },
  { initial: 'C', tint: '#D9414A', name: 'Calendar' },
  { initial: 'X', tint: '#1A6FE0', name: 'Xcode' },
  { initial: 'G', tint: '#A259FF', name: 'Figma' },
  { initial: 'T', tint: '#2B2B30', name: 'Terminal' },
  { initial: 'N', tint: '#D8A020', name: 'Notes' },
] as const;

export const AGENDA = [
  { time: '11:00', title: 'Design review — HALO island states', tag: 'Zoom' },
  { time: '13:30', title: '1:1 with Priya', tag: 'Meet' },
  { time: '13:30', title: 'Platform sync (overlaps)', tag: 'Teams' },
  { time: '16:00', title: 'Motion spec walkthrough', tag: 'In person' },
] as const;

/** Shelf tile tints, keyed by file extension. */
export const EXT_TINTS: Record<string, string> = {
  mov: 'linear-gradient(160deg,#7D5BE0,#3A2A6E)',
  numbers: 'linear-gradient(160deg,#39B54A,#1C5B26)',
  pdf: 'linear-gradient(160deg,#E0504F,#6E2222)',
  png: 'linear-gradient(160deg,#3E9BD6,#1C4A6E)',
  zip: 'linear-gradient(160deg,#C0A040,#5E4A14)',
};

export const EXT_TINT_FALLBACK = 'linear-gradient(160deg,#55555E,#2A2A30)';

export const SETTINGS_PANES = [
  ['general', 'General'],
  ['activation', 'Activation'],
  ['appearance', 'Appearance'],
  ['motion', 'Motion'],
  ['shortcuts', 'Shortcuts'],
  ['priority', 'Activity priority'],
  ['displays', 'Displays'],
  ['modules', 'Modules'],
  ['integrations', 'Integrations'],
  ['plugins', 'Plugins'],
  ['privacy', 'Privacy'],
  ['reset', 'Reset'],
] as const;

/** Background, ink, status label, and recovery action per permission state. */
export const PERMISSION_LOOK: Record<
  string,
  { bg: string; color: string; label: string; fix: string }
> = {
  granted: { bg: 'rgba(48,209,88,.18)', color: '#7DE2A0', label: 'Granted', fix: 'Review' },
  denied: { bg: 'rgba(255,69,58,.18)', color: '#FF8A82', label: 'Denied', fix: 'Open Settings' },
  notRequested: {
    bg: 'rgba(255,255,255,.1)',
    color: 'rgba(255,255,255,.6)',
    label: 'Not requested',
    fix: 'Request',
  },
  restricted: {
    bg: 'rgba(255,159,10,.18)',
    color: '#FFC55E',
    label: 'Restricted',
    fix: 'Learn more',
  },
  revoked: { bg: 'rgba(255,159,10,.18)', color: '#FFC55E', label: 'Revoked', fix: 'Re-request' },
};

export const ONBOARDING_STEPS = [
  {
    title: 'This is the island',
    body: 'HALO lives in the black area around the notch. It stays quiet until something is happening, then grows downward — never behind the hardware.',
  },
  {
    title: 'Choose your modules',
    body: 'Pick what the island should handle. You can change this at any time, and disabled modules never ask for access.',
  },
  {
    title: 'Grant only what you need',
    body: 'HALO asks for access when a feature first needs it. Skip anything you are unsure about — the rest of the app keeps working.',
  },
  {
    title: 'You are set up',
    body: 'Hover the notch for a preview, click to open, and press Escape to dismiss. Everything is reachable from the keyboard.',
  },
] as const;
