import type { HaloState } from './types';

/** The demonstration scene the prototype opens in. */
export function createInitialState(now = Date.now()): HaloState {
  return {
    mode: 'compact',
    pinned: false,
    forced: null,
    override: null,
    hovering: false,
    hold: 0,
    now,

    reduceMotion: false,
    reduceTransparency: false,
    increaseContrast: false,
    wallpaperLight: false,
    hoverIntent: 250,
    demoOpen: true,

    trackIx: 0,
    media: {
      connected: true,
      playing: true,
      posMs: 62_000,
      lastAt: now,
      shuffle: false,
      source: 'Music · macOS',
      outputOpen: false,
      output: 'MacBook Pro Speakers',
    },

    timers: [
      {
        id: 't1',
        name: 'Deep work',
        durMs: 25 * 60_000,
        endAt: now + 14 * 60_000 + 22_000,
        running: true,
        done: false,
      },
    ],
    cycles: false,
    draftName: '',
    draftMins: '10',

    meeting: {
      phase: 'soon',
      title: 'Design review — HALO island states',
      at: now + 9 * 60_000 + 40_000,
      location: 'Zoom · Studio room',
      app: 'Zoom',
      mic: 'on',
      cam: 'off',
      joinedAt: null,
    },
    calendarPerm: 'granted',

    battery: {
      level: 0.62,
      charging: false,
      accessories: [
        { name: 'Magic Trackpad', pct: 0.78 },
        { name: 'AirPods Pro', pct: 0.41 },
      ],
    },

    paletteQuery: '',
    paletteSel: 0,
    toasts: [],

    shelf: [
      { id: 'f1', name: 'island-motion-spec.mov', size: '42.6 MB', kind: 'QuickTime movie' },
      {
        id: 'f2',
        name: 'HALO — capability matrix (final, reviewed by platform team).numbers',
        size: '1.2 MB',
        kind: 'Numbers spreadsheet',
      },
    ],
    shelfHot: false,

    transfers: [
      {
        id: 'd1',
        name: 'Xcode_17.2.xip',
        src: 'Safari — developer.apple.com',
        pct: 0.34,
        state: 'active',
        pausable: true,
      },
      {
        id: 'd2',
        name: 'brand-assets.zip',
        src: 'Messages — Priya',
        pct: 1,
        state: 'done',
        pausable: false,
      },
      {
        id: 'd3',
        name: 'sonoma-wallpapers.tar',
        src: 'Chrome — cdn.example.com',
        pct: 0.71,
        state: 'failed',
        pausable: false,
      },
    ],

    clipCapture: false,
    clipQuery: '',
    clipRetention: '7 days',
    clipPaused: false,
    clips: [
      {
        id: 'c1',
        type: 'link',
        text: 'https://developer.apple.com/design/human-interface-guidelines/materials',
        app: 'Safari',
        ago: '2 min ago',
        pinned: true,
      },
      {
        id: 'c2',
        type: 'text',
        text: 'Expansion 280 ms, small feedback 160 ms, spring damping 0.86 — confirm against device capture before locking the motion spec.',
        app: 'Notes',
        ago: '11 min ago',
        pinned: false,
      },
      {
        id: 'c3',
        type: 'secure',
        text: 'Hidden — copied from a secure text field',
        app: 'Passwords',
        ago: '18 min ago',
        pinned: false,
      },
      {
        id: 'c4',
        type: 'image',
        text: 'Screenshot 2026-09-12 at 14.02.png — 1512 × 982',
        app: 'Screenshot',
        ago: '26 min ago',
        pinned: false,
      },
      {
        id: 'c5',
        type: 'text',
        text: 'auxiliaryTopLeftArea / auxiliaryTopRightArea',
        app: 'Xcode',
        ago: '41 min ago',
        pinned: false,
      },
    ],

    workflows: [
      {
        id: 'w1',
        name: 'Start work',
        desc: 'Opens Xcode and Figma, sets Do Not Disturb, starts a 50 minute focus timer.',
        param: null,
        status: 'idle',
        pct: 0,
        result: null,
      },
      {
        id: 'w2',
        name: 'Share shelf via AirDrop',
        desc: 'Sends every file in the shelf to a chosen nearby device.',
        param: 'Priya’s MacBook Pro',
        paramLabel: 'Recipient',
        status: 'idle',
        pct: 0,
        result: null,
      },
      {
        id: 'w3',
        name: 'Archive meeting notes',
        desc: 'Exports today’s notes to the Archive folder and clears the shelf.',
        param: null,
        status: 'failed',
        pct: 0,
        result:
          'Failed: the Archive folder could not be found. Choose a new destination or retry.',
      },
    ],

    windowsTarget: 0,
    accessibilityPerm: 'notRequested',

    statsStale: false,
    statsSeed: 1,

    audioOutput: 'MacBook Pro Speakers',
    bt: [
      { name: 'AirPods Pro', state: 'Connected — automatic switching on', pct: 0.41 },
      { name: 'Magic Trackpad', state: 'Connected', pct: 0.78 },
      { name: 'Magic Keyboard', state: 'Not connected', pct: null },
    ],

    plugins: [
      {
        id: 'p1',
        name: 'Linear — Issue peek',
        vendor: 'Sample plugin',
        desc: 'Shows the issue you are assigned and lets you move it between states.',
        perms: 'Network, keychain token',
        enabled: true,
        health: 'ok',
      },
      {
        id: 'p2',
        name: 'Home — Scene control',
        vendor: 'Sample plugin',
        desc: 'Runs a HomeKit scene from the island.',
        perms: 'Home data',
        enabled: false,
        health: 'update',
      },
      {
        id: 'p3',
        name: 'Stage — Presenter clock',
        vendor: 'Sample plugin',
        desc: 'Countdown and next-slide preview while presenting.',
        perms: 'Screen recording',
        enabled: true,
        health: 'error',
      },
    ],

    ai: {
      enabled: false,
      provider: 'Not configured',
      busy: false,
      pct: 0,
      result: null,
      error: false,
    },

    settings: {
      open: false,
      pane: 'general',
      density: 'comfortable',
      appearance: 'match',
      activation: 'hover',
      fullscreen: 'hide',
      launchAtLogin: true,
      persist: true,
      suppress: true,
      collapseOutside: true,
      neverInterruptTyping: true,
      followActiveDisplay: true,
      notchless: 'menubar',
    },

    priorityOrder: [
      'Urgent events',
      'Calls & meetings',
      'Timers & transfers',
      'Media',
      'Passive system info',
    ],

    enabledModules: [
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
    ],

    onboardOpen: false,
    onboardStep: 0,

    perms: {
      reminders: 'notRequested',
      screen: 'restricted',
      files: 'granted',
      notifications: 'granted',
      automation: 'denied',
    },
  };
}

/** Fields `Reset demonstration data` restores; settings are left alone. */
export function demoResetPatch(now = Date.now()): Partial<HaloState> {
  const fresh = createInitialState(now);
  return {
    mode: 'compact',
    pinned: false,
    forced: null,
    override: null,
    trackIx: 0,
    calendarPerm: 'granted',
    media: fresh.media,
    timers: fresh.timers,
    meeting: fresh.meeting,
    battery: fresh.battery,
    paletteQuery: '',
    paletteSel: 0,
    cycles: false,
    toasts: [],
  };
}
