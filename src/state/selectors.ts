import { fmt, fmtLong, timeOfDay } from '../lib/format';
import { TITLES, TRACKS, WINDOW_TARGETS } from './constants';
import type { Activity, HaloState, SurfaceId, Timer } from './types';

/** Remaining milliseconds on a timer, whether it is running or paused. */
export function timerRemaining(timer: Timer, now: number): number {
  if (timer.done) return 0;
  return timer.running ? Math.max(0, timer.endAt - now) : (timer.remainMs ?? timer.durMs);
}

/** The timer the island reports: a completed one first, then a running one. */
export function leadTimer(state: HaloState): Timer | undefined {
  return state.timers.find((t) => t.done) ?? state.timers.find((t) => t.running) ?? state.timers[0];
}

export interface CompactCopy {
  /** Left shoulder: what is happening. */
  left: string;
  /** Right shoulder: the live value. */
  right: string;
  /** Hover preview title and subtitle. */
  title: string;
  sub: string;
}

/**
 * The one-line summary each surface shows while collapsed, and the two-line
 * version it shows on hover. Kept in one place so the compact and preview
 * states can never disagree about what is happening.
 */
export function compactCopy(state: HaloState, surface: SurfaceId, mediaPos: number): CompactCopy {
  const now = state.now;
  const track = TRACKS[state.trackIx] ?? TRACKS[0]!;
  const batteryPct = Math.round(state.battery.level * 100);
  const untilMeeting = state.meeting.at - now;
  const liveFor = state.meeting.joinedAt ? now - state.meeting.joinedAt : 0;

  switch (surface) {
    case 'media':
      return {
        left: track.title,
        right: state.media.playing ? fmt(track.durMs - mediaPos) : 'Paused',
        title: track.title,
        sub: track.artist + (track.album ? ` — ${track.album}` : ''),
      };

    case 'timer': {
      const timer = leadTimer(state);
      const value = timer
        ? timer.done
          ? 'Done'
          : fmtLong(timerRemaining(timer, now))
        : '—';
      return {
        left: timer ? timer.name : 'No timers',
        right: value,
        title: `${value} left`,
        sub: timer ? timer.name : '',
      };
    }

    case 'meeting': {
      const live = state.meeting.phase === 'live';
      return {
        left: live ? 'In meeting' : (state.meeting.title.split(' — ')[0] ?? state.meeting.title),
        right: live ? fmtLong(liveFor) : untilMeeting > 0 ? `in ${fmt(untilMeeting)}` : 'now',
        title: state.meeting.title,
        sub: live
          ? `${state.meeting.app} — ${fmtLong(liveFor)} elapsed`
          : `Starts in ${fmt(Math.max(0, untilMeeting))} — ${state.meeting.location}`,
      };
    }

    case 'battery': {
      const label = state.battery.charging
        ? 'Charging'
        : state.battery.level <= 0.2
          ? 'Low battery'
          : 'Power';
      return {
        left: label,
        right: `${batteryPct}%`,
        title: `${label} — ${batteryPct}%`,
        sub: state.battery.charging
          ? 'Connected to 96W USB-C power adapter'
          : 'On battery power',
      };
    }

    case 'download': {
      const transfer = state.transfers.find((d) => d.state === 'active') ?? state.transfers[0];
      const value = transfer
        ? transfer.state === 'active'
          ? `${Math.round(transfer.pct * 100)}%`
          : transfer.state === 'done'
            ? 'Done'
            : 'Failed'
        : '—';
      return {
        left: transfer ? transfer.name : 'Transfers',
        right: value,
        title: transfer ? transfer.name : 'Transfers',
        sub: transfer ? transfer.src : '',
      };
    }

    case 'shelf': {
      const count = `${state.shelf.length} file${state.shelf.length === 1 ? '' : 's'}`;
      return {
        left: state.shelf[0]?.name ?? 'File shelf',
        right: count,
        title: 'File shelf',
        sub: `${count} held — drag out or share`,
      };
    }

    case 'clipboard':
      return {
        left: 'Clipboard',
        right: state.clipCapture ? `${state.clips.length} items` : 'Off',
        title: 'Clipboard',
        sub: state.clipCapture
          ? 'Search recent text, links, and images'
          : 'Capture is off',
      };

    case 'workflow': {
      const running = state.workflows.find((w) => w.status === 'running');
      return {
        left: running ? running.name : 'Workflows',
        right: running
          ? `${Math.round(running.pct * 100)}%`
          : `${state.workflows.length} saved`,
        title: running ? running.name : 'Workflows',
        sub: running ? 'Running' : 'Run a saved workflow',
      };
    }

    case 'windows': {
      const target = WINDOW_TARGETS[state.windowsTarget % WINDOW_TARGETS.length]!;
      return {
        left: 'Windows',
        right: target.title.split(' — ')[0] ?? target.title,
        title: 'Window controls',
        sub: target.title,
      };
    }

    case 'stats':
      return {
        left: 'System',
        right: `${18 + (state.statsSeed % 7)}%`,
        title: 'System statistics',
        sub: 'CPU, memory, storage, network',
      };

    case 'devices':
      return {
        left: 'Devices',
        right: state.audioOutput.split(' ')[0] ?? state.audioOutput,
        title: 'Connected devices',
        sub: state.audioOutput,
      };

    case 'plugins':
      return {
        left: 'Plugins',
        right: `${state.plugins.filter((p) => p.enabled).length} on`,
        title: 'Plugins',
        sub: 'Installed extensions',
      };

    case 'ai':
      return {
        left: 'AI actions',
        right: state.ai.enabled ? 'Ready' : 'Off',
        title: 'AI actions',
        sub: state.ai.enabled ? `Provider: ${state.ai.provider}` : 'Disabled by default',
      };

    case 'apps':
      return {
        left: 'Quick actions',
        right: '5 apps',
        title: 'Quick actions',
        sub: 'Favourite apps, folders, and links',
      };

    case 'palette':
      return {
        left: '',
        right: '',
        title: 'Command palette',
        sub: 'Search modules, files, actions',
      };

    case 'home':
      return {
        left: 'HALO',
        right: `${state.enabledModules.length + 1} modules`,
        title: 'All modules',
        sub: 'Everything HALO can show',
      };

    default:
      return { left: TITLES[surface] ?? 'HALO', right: '', title: TITLES[surface] ?? 'HALO', sub: '' };
  }
}

/** The live value shown on the secondary activity chip. */
export function secondaryLabel(state: HaloState, secondary: Activity | undefined): string {
  if (!secondary) return '';
  const now = state.now;
  switch (secondary.id) {
    case 'timer': {
      const timer = leadTimer(state);
      return timer ? fmtLong(timerRemaining(timer, now)) : '—';
    }
    case 'media':
      return state.media.playing ? 'Playing' : 'Paused';
    case 'meeting':
      return `in ${fmt(Math.max(0, state.meeting.at - now))}`;
    case 'download': {
      const transfer = state.transfers.find((d) => d.state === 'active');
      return transfer ? `${Math.round(transfer.pct * 100)}%` : 'Done';
    }
    case 'shelf':
      return `${state.shelf.length}`;
    case 'workflow': {
      const running = state.workflows.find((w) => w.status === 'running');
      return running ? `${Math.round(running.pct * 100)}%` : '—';
    }
    default:
      return `${Math.round(state.battery.level * 100)}%`;
  }
}

/** Status line for each module in the grid and the palette. */
export function moduleStatus(state: HaloState, id: SurfaceId): string {
  const untilMeeting = state.meeting.at - state.now;
  switch (id) {
    case 'media':
      return state.media.connected
        ? state.media.playing
          ? 'Playing'
          : 'Paused'
        : 'No source';
    case 'timer':
      return state.timers.some((t) => t.running) ? 'Running' : 'Idle';
    case 'meeting':
      return state.calendarPerm === 'granted'
        ? `Next in ${Math.max(0, Math.round(untilMeeting / 60_000))} min`
        : 'Access denied';
    case 'battery':
      return `${Math.round(state.battery.level * 100)}%`;
    case 'shelf':
      return `${state.shelf.length} file${state.shelf.length === 1 ? '' : 's'}`;
    case 'download':
      return `${state.transfers.filter((d) => d.state === 'active').length} active`;
    case 'clipboard':
      return state.clipCapture ? `${state.clips.length} items` : 'Capture off';
    case 'apps':
      return '5 favourites';
    case 'workflow':
      return `${state.workflows.length} saved`;
    case 'windows':
      return state.accessibilityPerm === 'granted' ? 'Ready' : 'Needs access';
    case 'stats':
      return state.statsStale ? 'Stale' : 'Live';
    case 'devices':
      return `${state.bt.filter((b) => b.pct !== null).length} connected`;
    case 'plugins':
      return `${state.plugins.filter((p) => p.enabled).length} enabled`;
    case 'ai':
      return state.ai.enabled ? 'Enabled' : 'Off';
    default:
      return '';
  }
}

/** Menu-bar clock, formatted in the viewer's locale. */
export function clockLabel(now: number): string {
  return timeOfDay(now);
}

/** Two-stop gradient sampled from artwork, or a neutral tile when there is none. */
export function artworkGradient(artIndex: number): string {
  const art = (TRACKS[artIndex] ?? TRACKS[0]!).art;
  return art
    ? `linear-gradient(145deg,${art[0]},${art[1]})`
    : 'linear-gradient(145deg,#3A3A40,#222226)';
}
