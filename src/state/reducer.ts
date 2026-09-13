import { AUDIO_OUTPUTS, TRACKS } from './constants';
import { createInitialState, demoResetPatch } from './initialState';
import type {
  Clip,
  HaloState,
  IslandMode,
  ModuleId,
  PermissionState,
  SettingsPane,
  SettingsState,
  ShelfFile,
  SurfaceId,
  Toast,
} from './types';

export type Action =
  // ---- island shell
  | { type: 'tick'; now: number }
  | { type: 'setMode'; mode: IslandMode }
  | { type: 'hoverEnter' }
  | { type: 'hoverLeave' }
  | { type: 'holdAcquire' }
  | { type: 'holdRelease' }
  | { type: 'openSurface'; surface: SurfaceId }
  | { type: 'collapse'; viaEscape?: boolean }
  | { type: 'togglePin' }
  | { type: 'unpin' }
  | { type: 'switchActivity'; id: ModuleId }
  | { type: 'cycleActivity'; ids: ModuleId[]; current: SurfaceId }
  // ---- accessibility / scene
  | { type: 'setFlag'; flag: 'reduceMotion' | 'reduceTransparency' | 'increaseContrast' | 'wallpaperLight'; value: boolean }
  | { type: 'toggleFlag'; flag: 'reduceMotion' | 'reduceTransparency' | 'increaseContrast' | 'wallpaperLight' }
  | { type: 'setHoverIntent'; ms: number }
  | { type: 'toggleDemoPanel' }
  // ---- media
  | { type: 'mediaPlayPause' }
  | { type: 'mediaSeek'; fraction: number }
  | { type: 'mediaStep'; delta: number }
  | { type: 'mediaToggleShuffle' }
  | { type: 'mediaToggleOutputMenu' }
  | { type: 'mediaPickOutput'; output: string }
  | { type: 'mediaReconnect' }
  | { type: 'mediaDisconnect' }
  | { type: 'mediaStart' }
  | { type: 'mediaPause' }
  // ---- timers
  | { type: 'timerAdd'; name: string; minutes: number }
  | { type: 'timerToggle'; id: string }
  | { type: 'timerReset'; id: string }
  | { type: 'timerComplete'; id: string }
  | { type: 'timersExpire'; ids: string[] }
  | { type: 'setDraftName'; value: string }
  | { type: 'setDraftMins'; value: string }
  | { type: 'toggleCycles' }
  // ---- meeting
  | { type: 'meetingJoin' }
  | { type: 'meetingLeave' }
  | { type: 'meetingToggleMic' }
  | { type: 'meetingToggleCam' }
  | { type: 'meetingSchedule'; inMs: number }
  | { type: 'setCalendarPerm'; value: PermissionState }
  // ---- battery
  | { type: 'batterySet'; charging?: boolean; level?: number }
  // ---- palette
  | { type: 'paletteQuery'; value: string }
  | { type: 'paletteMove'; delta: number; count: number }
  | { type: 'paletteSelect'; index: number }
  // ---- toasts
  | { type: 'toastPush'; toast: Toast }
  | { type: 'toastDismiss'; id: string }
  // ---- shelf
  | { type: 'shelfAdd'; files: ShelfFile[] }
  | { type: 'shelfRemove'; id: string }
  | { type: 'shelfClear' }
  | { type: 'shelfHot'; value: boolean }
  // ---- transfers
  | { type: 'transferAdvance'; step: number }
  | { type: 'transferTogglePause'; id: string }
  | { type: 'transferCancel'; id: string }
  | { type: 'transferRetry'; id: string }
  // ---- clipboard
  | { type: 'clipEnable' }
  | { type: 'clipTogglePause' }
  | { type: 'clipSearch'; value: string }
  | { type: 'clipTogglePin'; id: string }
  | { type: 'clipDelete'; id: string }
  | { type: 'clipSetRetention'; value: HaloState['clipRetention'] }
  | { type: 'clipClearAll' }
  // ---- workflows
  | { type: 'workflowStart'; id: string }
  | { type: 'workflowProgress'; id: string; pct: number }
  | { type: 'workflowFinish'; id: string; ok: boolean; result: string }
  | { type: 'workflowCancel'; id: string }
  | { type: 'workflowSetParam'; id: string; value: string }
  // ---- windows
  | { type: 'windowCycleTarget' }
  | { type: 'setAccessibilityPerm'; value: PermissionState }
  // ---- stats
  | { type: 'statsRefresh' }
  // ---- plugins
  | { type: 'pluginToggle'; id: string }
  | { type: 'pluginHeal'; id: string }
  // ---- ai
  | { type: 'aiEnable' }
  | { type: 'aiDisable' }
  | { type: 'aiStart' }
  | { type: 'aiProgress'; pct: number }
  | { type: 'aiFinish'; result: string; error: boolean }
  | { type: 'aiCancel' }
  | { type: 'aiClearResult' }
  // ---- settings
  | { type: 'settingsOpen' }
  | { type: 'settingsClose' }
  | { type: 'settingsPane'; pane: SettingsPane }
  | { type: 'settingsPatch'; patch: Partial<SettingsState> }
  | { type: 'settingsReset' }
  | { type: 'movePriority'; index: number; delta: number }
  | { type: 'toggleModule'; id: ModuleId }
  | { type: 'setPerm'; key: keyof HaloState['perms']; value: PermissionState }
  // ---- onboarding
  | { type: 'onboardOpen' }
  | { type: 'onboardClose' }
  | { type: 'onboardStep'; delta: number }
  // ---- demo
  | { type: 'demoReset' };

/** Position the media module is at right now, accounting for elapsed playback. */
export function mediaPosition(state: HaloState, now = Date.now()): number {
  const track = TRACKS[state.trackIx] ?? TRACKS[0]!;
  const raw = state.media.playing
    ? state.media.posMs + (now - state.media.lastAt)
    : state.media.posMs;
  return Math.min(track.durMs, Math.max(0, raw));
}

function trackDuration(state: HaloState): number {
  return (TRACKS[state.trackIx] ?? TRACKS[0]!).durMs;
}

export function haloReducer(state: HaloState, action: Action): HaloState {
  switch (action.type) {
    // ---------------------------------------------------------------- shell
    case 'tick':
      return { ...state, now: action.now };

    case 'setMode':
      return { ...state, mode: action.mode };

    case 'hoverEnter':
      return { ...state, hovering: true };

    case 'hoverLeave':
      return { ...state, hovering: false };

    case 'holdAcquire':
      return { ...state, hold: state.hold + 1 };

    case 'holdRelease':
      return { ...state, hold: Math.max(0, state.hold - 1) };

    case 'openSurface':
      return {
        ...state,
        mode: 'expanded',
        forced: action.surface,
        // Opening a module also makes it the primary activity, if it is one.
        override: action.surface === 'palette' || action.surface === 'home'
          ? state.override
          : (action.surface as ModuleId),
        ...(action.surface === 'palette' ? { paletteQuery: '', paletteSel: 0 } : {}),
      };

    case 'collapse':
      // An open child menu absorbs the first dismiss.
      if (state.media.outputOpen) {
        return { ...state, media: { ...state.media, outputOpen: false } };
      }
      // A pinned panel is left by unpinning only — Escape and outside clicks
      // are ignored. The explicit close button still dismisses it.
      if (state.pinned && action.viaEscape) return state;
      return {
        ...state,
        mode: 'compact',
        pinned: false,
        forced: null,
        paletteQuery: '',
        paletteSel: 0,
      };

    case 'togglePin':
      return { ...state, pinned: !state.pinned, mode: 'expanded' };

    case 'unpin':
      return { ...state, pinned: false, mode: 'compact', forced: null };

    case 'switchActivity':
      return { ...state, forced: action.id, override: action.id, mode: 'expanded' };

    case 'cycleActivity': {
      if (action.ids.length === 0) return state;
      const at = action.ids.indexOf(action.current as ModuleId);
      const next = action.ids[(at + 1) % action.ids.length]!;
      return { ...state, forced: next, override: next, mode: 'expanded' };
    }

    // ------------------------------------------------------- accessibility
    case 'setFlag':
      return { ...state, [action.flag]: action.value };

    case 'toggleFlag':
      return { ...state, [action.flag]: !state[action.flag] };

    case 'setHoverIntent':
      return { ...state, hoverIntent: action.ms };

    case 'toggleDemoPanel':
      return { ...state, demoOpen: !state.demoOpen };

    // ---------------------------------------------------------------- media
    case 'mediaPlayPause':
      return {
        ...state,
        media: {
          ...state.media,
          playing: !state.media.playing,
          posMs: mediaPosition(state),
          lastAt: Date.now(),
        },
      };

    case 'mediaSeek':
      return {
        ...state,
        media: {
          ...state.media,
          posMs: action.fraction * trackDuration(state),
          lastAt: Date.now(),
        },
      };

    case 'mediaStep': {
      const count = TRACKS.length;
      const next = (state.trackIx + action.delta + count) % count;
      return {
        ...state,
        trackIx: next,
        media: { ...state.media, posMs: 0, lastAt: Date.now() },
      };
    }

    case 'mediaToggleShuffle':
      return { ...state, media: { ...state.media, shuffle: !state.media.shuffle } };

    case 'mediaToggleOutputMenu':
      return { ...state, media: { ...state.media, outputOpen: !state.media.outputOpen } };

    case 'mediaPickOutput':
      return {
        ...state,
        audioOutput: action.output,
        media: { ...state.media, output: action.output, outputOpen: false },
      };

    case 'mediaReconnect':
    case 'mediaStart':
      return {
        ...state,
        media: { ...state.media, connected: true, playing: true, lastAt: Date.now() },
        ...(action.type === 'mediaStart' ? { override: 'media' as ModuleId } : {}),
      };

    case 'mediaPause':
      return {
        ...state,
        media: {
          ...state.media,
          playing: false,
          posMs: mediaPosition(state),
          lastAt: Date.now(),
        },
      };

    case 'mediaDisconnect':
      return { ...state, media: { ...state.media, connected: false, playing: false } };

    // --------------------------------------------------------------- timers
    case 'timerAdd': {
      const now = Date.now();
      return {
        ...state,
        // Starting a new timer clears an acknowledged completion.
        timers: [
          ...state.timers.filter((t) => !t.done),
          {
            id: `t${Math.random().toString(36).slice(2, 6)}`,
            name: action.name,
            durMs: action.minutes * 60_000,
            endAt: now + action.minutes * 60_000,
            running: true,
            done: false,
          },
        ],
        draftName: '',
        mode: 'expanded',
        forced: 'timer',
        override: 'timer',
      };
    }

    case 'timerToggle':
      return {
        ...state,
        timers: state.timers.map((t) => {
          if (t.id !== action.id) return t;
          if (t.running) {
            // Pausing stores what is left so resuming recomputes a deadline.
            return { ...t, running: false, remainMs: Math.max(0, t.endAt - Date.now()) };
          }
          return {
            ...t,
            running: true,
            done: false,
            endAt: Date.now() + (t.remainMs ?? t.durMs),
            remainMs: undefined,
          };
        }),
      };

    case 'timerReset':
      return {
        ...state,
        timers: state.timers.map((t) =>
          t.id === action.id
            ? { ...t, running: true, done: false, endAt: Date.now() + t.durMs, remainMs: undefined }
            : t,
        ),
      };

    case 'timerComplete':
      return {
        ...state,
        timers: state.timers.map((t) =>
          t.id === action.id ? { ...t, running: false, done: true } : t,
        ),
        override: null,
      };

    case 'timersExpire':
      return {
        ...state,
        timers: state.timers.map((t) =>
          action.ids.includes(t.id) ? { ...t, running: false, done: true } : t,
        ),
      };

    case 'setDraftName':
      return { ...state, draftName: action.value };

    case 'setDraftMins':
      return { ...state, draftMins: action.value };

    case 'toggleCycles':
      return { ...state, cycles: !state.cycles };

    // -------------------------------------------------------------- meeting
    case 'meetingJoin':
      return {
        ...state,
        meeting: {
          ...state.meeting,
          phase: 'live',
          joinedAt: Date.now(),
          mic: 'on',
          cam: 'off',
        },
        mode: 'expanded',
        forced: 'meeting',
        override: 'meeting',
      };

    case 'meetingLeave':
      return {
        ...state,
        meeting: {
          ...state.meeting,
          phase: 'soon',
          at: Date.now() + 45 * 60_000,
          joinedAt: null,
        },
        override: null,
      };

    case 'meetingToggleMic':
      return {
        ...state,
        meeting: { ...state.meeting, mic: state.meeting.mic === 'on' ? 'off' : 'on' },
      };

    case 'meetingToggleCam':
      return {
        ...state,
        meeting: { ...state.meeting, cam: state.meeting.cam === 'on' ? 'off' : 'on' },
      };

    case 'meetingSchedule':
      return {
        ...state,
        meeting: {
          ...state.meeting,
          phase: 'soon',
          at: Date.now() + action.inMs,
          joinedAt: null,
        },
        override: null,
      };

    case 'setCalendarPerm':
      return { ...state, calendarPerm: action.value };

    // -------------------------------------------------------------- battery
    case 'batterySet':
      return {
        ...state,
        battery: {
          ...state.battery,
          charging: action.charging ?? state.battery.charging,
          level: action.level ?? state.battery.level,
        },
      };

    // -------------------------------------------------------------- palette
    case 'paletteQuery':
      return { ...state, paletteQuery: action.value, paletteSel: 0 };

    case 'paletteMove':
      return {
        ...state,
        paletteSel: Math.min(
          Math.max(0, action.count - 1),
          Math.max(0, state.paletteSel + action.delta),
        ),
      };

    case 'paletteSelect':
      return { ...state, paletteSel: action.index };

    // --------------------------------------------------------------- toasts
    case 'toastPush':
      return { ...state, toasts: [...state.toasts, action.toast] };

    case 'toastDismiss':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    // ---------------------------------------------------------------- shelf
    case 'shelfAdd':
      return { ...state, shelf: [...action.files, ...state.shelf], shelfHot: false };

    case 'shelfRemove':
      return { ...state, shelf: state.shelf.filter((f) => f.id !== action.id) };

    case 'shelfClear':
      return { ...state, shelf: [] };

    case 'shelfHot':
      return { ...state, shelfHot: action.value };

    // ------------------------------------------------------------ transfers
    case 'transferAdvance':
      return {
        ...state,
        transfers: state.transfers.map((d) => {
          if (d.state !== 'active' || d.pct >= 1) return d;
          const next = d.pct + action.step;
          return next >= 1 ? { ...d, pct: 1, state: 'done' } : { ...d, pct: next };
        }),
      };

    case 'transferTogglePause':
      return {
        ...state,
        transfers: state.transfers.map((d) =>
          d.id === action.id
            ? { ...d, state: d.state === 'paused' ? 'active' : 'paused' }
            : d,
        ),
      };

    case 'transferCancel':
      return { ...state, transfers: state.transfers.filter((d) => d.id !== action.id) };

    case 'transferRetry':
      return {
        ...state,
        transfers: state.transfers.map((d) =>
          d.id === action.id ? { ...d, state: 'active', pct: 0.05 } : d,
        ),
      };

    // ------------------------------------------------------------ clipboard
    case 'clipEnable':
      return { ...state, clipCapture: true };

    case 'clipTogglePause':
      return { ...state, clipPaused: !state.clipPaused };

    case 'clipSearch':
      return { ...state, clipQuery: action.value };

    case 'clipTogglePin':
      return {
        ...state,
        clips: state.clips.map((c) =>
          c.id === action.id ? ({ ...c, pinned: !c.pinned } as Clip) : c,
        ),
      };

    case 'clipDelete':
      return { ...state, clips: state.clips.filter((c) => c.id !== action.id) };

    case 'clipSetRetention':
      return { ...state, clipRetention: action.value };

    case 'clipClearAll':
      return { ...state, clips: [], shelf: [] };

    // ------------------------------------------------------------ workflows
    case 'workflowStart':
      return {
        ...state,
        workflows: state.workflows.map((w) =>
          w.id === action.id ? { ...w, status: 'running', pct: 0, result: null } : w,
        ),
        mode: 'expanded',
        forced: 'workflow',
        override: 'workflow',
      };

    case 'workflowProgress':
      return {
        ...state,
        workflows: state.workflows.map((w) =>
          w.id === action.id ? { ...w, pct: action.pct } : w,
        ),
      };

    case 'workflowFinish':
      return {
        ...state,
        workflows: state.workflows.map((w) =>
          w.id === action.id
            ? { ...w, status: action.ok ? 'done' : 'failed', pct: 1, result: action.result }
            : w,
        ),
      };

    case 'workflowCancel':
      return {
        ...state,
        workflows: state.workflows.map((w) =>
          w.id === action.id
            ? { ...w, status: 'idle', pct: 0, result: 'Cancelled before completion.' }
            : w,
        ),
      };

    case 'workflowSetParam':
      return {
        ...state,
        workflows: state.workflows.map((w) =>
          w.id === action.id ? { ...w, param: action.value } : w,
        ),
      };

    // -------------------------------------------------------------- windows
    case 'windowCycleTarget':
      return { ...state, windowsTarget: state.windowsTarget + 1 };

    case 'setAccessibilityPerm':
      return { ...state, accessibilityPerm: action.value };

    // ---------------------------------------------------------------- stats
    case 'statsRefresh':
      return { ...state, statsSeed: state.statsSeed + 3, statsStale: false };

    // -------------------------------------------------------------- plugins
    case 'pluginToggle':
      return {
        ...state,
        plugins: state.plugins.map((p) =>
          p.id === action.id ? { ...p, enabled: !p.enabled } : p,
        ),
      };

    case 'pluginHeal':
      return {
        ...state,
        plugins: state.plugins.map((p) => (p.id === action.id ? { ...p, health: 'ok' } : p)),
      };

    // ------------------------------------------------------------------- ai
    case 'aiEnable':
      return {
        ...state,
        ai: { ...state.ai, enabled: true, provider: 'Claude — configured in Settings' },
      };

    case 'aiDisable':
      return {
        ...state,
        ai: {
          enabled: false,
          provider: 'Not configured',
          busy: false,
          pct: 0,
          result: null,
          error: false,
        },
      };

    case 'aiStart':
      return { ...state, ai: { ...state.ai, busy: true, pct: 0, result: null, error: false } };

    case 'aiProgress':
      return { ...state, ai: { ...state.ai, pct: action.pct } };

    case 'aiFinish':
      return {
        ...state,
        ai: { ...state.ai, busy: false, pct: 1, result: action.result, error: action.error },
      };

    case 'aiCancel':
      return {
        ...state,
        ai: {
          ...state.ai,
          busy: false,
          pct: 0,
          result: 'Cancelled before the request completed.',
          error: false,
        },
      };

    case 'aiClearResult':
      return { ...state, ai: { ...state.ai, result: null, error: false } };

    // ------------------------------------------------------------- settings
    case 'settingsOpen':
      return {
        ...state,
        settings: { ...state.settings, open: true },
        mode: 'compact',
        forced: null,
      };

    case 'settingsClose':
      return { ...state, settings: { ...state.settings, open: false } };

    case 'settingsPane':
      return { ...state, settings: { ...state.settings, pane: action.pane } };

    case 'settingsPatch':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case 'settingsReset': {
      const fresh = createInitialState();
      return {
        ...state,
        settings: { ...fresh.settings, open: state.settings.open, pane: state.settings.pane },
        reduceMotion: false,
        reduceTransparency: false,
        increaseContrast: false,
        hoverIntent: fresh.hoverIntent,
        priorityOrder: fresh.priorityOrder,
        enabledModules: fresh.enabledModules,
      };
    }

    case 'movePriority': {
      const to = action.index + action.delta;
      if (to < 0 || to >= state.priorityOrder.length) return state;
      const order = [...state.priorityOrder];
      const moved = order[action.index]!;
      order[action.index] = order[to]!;
      order[to] = moved;
      return { ...state, priorityOrder: order };
    }

    case 'toggleModule':
      return {
        ...state,
        enabledModules: state.enabledModules.includes(action.id)
          ? state.enabledModules.filter((m) => m !== action.id)
          : [...state.enabledModules, action.id],
      };

    case 'setPerm':
      return { ...state, perms: { ...state.perms, [action.key]: action.value } };

    // ----------------------------------------------------------- onboarding
    case 'onboardOpen':
      return {
        ...state,
        onboardOpen: true,
        onboardStep: 0,
        settings: { ...state.settings, open: false },
      };

    case 'onboardClose':
      return { ...state, onboardOpen: false, onboardStep: 0 };

    case 'onboardStep':
      return {
        ...state,
        onboardStep: Math.min(3, Math.max(0, state.onboardStep + action.delta)),
      };

    // ----------------------------------------------------------------- demo
    case 'demoReset':
      return { ...state, ...demoResetPatch() };

    default:
      return state;
  }
}

export { AUDIO_OUTPUTS };
