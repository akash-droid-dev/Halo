/** Every module that can occupy the island. */
export type ModuleId =
  | 'media'
  | 'timer'
  | 'meeting'
  | 'battery'
  | 'shelf'
  | 'download'
  | 'clipboard'
  | 'apps'
  | 'workflow'
  | 'windows'
  | 'stats'
  | 'devices'
  | 'plugins'
  | 'ai';

/** `palette` and `home` are reachable surfaces but never queue an activity. */
export type SurfaceId = ModuleId | 'palette' | 'home';

/** The five island states from section 3 of the brief. */
export type IslandMode = 'rest' | 'compact' | 'preview' | 'expanded';

/**
 * An activity's kind drives its accent; its tier drives priority. Tier 1 is
 * the interaction the user is performing and can never be displaced.
 */
export type ActivityKind =
  | 'media'
  | 'timer'
  | 'meeting'
  | 'call'
  | 'battery'
  | 'download'
  | 'shelf'
  | 'workflow';

export interface Activity {
  id: ModuleId;
  kind: ActivityKind;
  /** 1 = current interaction, 2 = urgent, 3 = ongoing, 4 = active, 5 = passive. */
  tier: number;
}

export type PermissionState =
  | 'granted'
  | 'denied'
  | 'notRequested'
  | 'restricted'
  | 'revoked';

export interface Track {
  title: string;
  artist: string;
  album: string;
  durMs: number;
  /** Two-stop gradient sampled from artwork; `null` when there is no artwork. */
  art: readonly [string, string] | null;
}

export interface MediaState {
  connected: boolean;
  playing: boolean;
  posMs: number;
  /** Wall-clock time `posMs` was last written, so playback advances smoothly. */
  lastAt: number;
  shuffle: boolean;
  source: string;
  outputOpen: boolean;
  output: string;
}

export interface Timer {
  id: string;
  name: string;
  durMs: number;
  /** Absolute deadline. Recomputed from this on wake rather than counting down. */
  endAt: number;
  running: boolean;
  done: boolean;
  /** Remaining time captured at the moment a timer was paused. */
  remainMs?: number;
}

export type MeetingPhase = 'soon' | 'live' | 'ringing';

export interface MeetingState {
  phase: MeetingPhase;
  title: string;
  at: number;
  location: string;
  app: string;
  mic: 'on' | 'off';
  cam: 'on' | 'off';
  joinedAt: number | null;
}

export interface Accessory {
  name: string;
  pct: number;
}

export interface BatteryState {
  level: number;
  charging: boolean;
  accessories: Accessory[];
}

export interface ShelfFile {
  id: string;
  name: string;
  size: string;
  kind: string;
}

export type TransferState = 'active' | 'paused' | 'done' | 'failed';

export interface Transfer {
  id: string;
  name: string;
  src: string;
  pct: number;
  state: TransferState;
  /** Not every source reports a pause capability. */
  pausable: boolean;
}

export type ClipKind = 'text' | 'link' | 'image' | 'secure';

export interface Clip {
  id: string;
  type: ClipKind;
  text: string;
  app: string;
  ago: string;
  pinned: boolean;
}

export type WorkflowStatus = 'idle' | 'running' | 'done' | 'failed';

export interface Workflow {
  id: string;
  name: string;
  desc: string;
  param: string | null;
  paramLabel?: string;
  status: WorkflowStatus;
  pct: number;
  result: string | null;
}

export interface BtDevice {
  name: string;
  state: string;
  pct: number | null;
}

export type PluginHealth = 'ok' | 'update' | 'error';

export interface Plugin {
  id: string;
  name: string;
  vendor: string;
  desc: string;
  perms: string;
  enabled: boolean;
  health: PluginHealth;
}

export interface AiState {
  enabled: boolean;
  provider: string;
  busy: boolean;
  pct: number;
  result: string | null;
  error: boolean;
}

export type SettingsPane =
  | 'general'
  | 'activation'
  | 'appearance'
  | 'motion'
  | 'shortcuts'
  | 'priority'
  | 'displays'
  | 'modules'
  | 'integrations'
  | 'plugins'
  | 'privacy'
  | 'reset';

export interface SettingsState {
  open: boolean;
  pane: SettingsPane;
  density: 'comfortable' | 'subtle';
  appearance: 'match' | 'dark';
  activation: 'hover' | 'click';
  fullscreen: 'hide' | 'show';
  launchAtLogin: boolean;
  persist: boolean;
  suppress: boolean;
  collapseOutside: boolean;
  neverInterruptTyping: boolean;
  followActiveDisplay: boolean;
  notchless: 'menubar' | 'none';
}

export interface Toast {
  id: string;
  text: string;
  /** Provenance — what actually performed the action. */
  kind: string;
  color: string;
}

export interface Perms {
  reminders: PermissionState;
  screen: PermissionState;
  files: PermissionState;
  notifications: PermissionState;
  automation: PermissionState;
}

export interface HaloState {
  mode: IslandMode;
  pinned: boolean;
  /** A module the user opened explicitly; overrides activity priority. */
  forced: SurfaceId | null;
  /** A user override of which activity owns the primary slot. */
  override: ModuleId | null;
  hovering: boolean;
  /**
   * Reference-counted collapse guard. Overlapping interactions cannot leave
   * the panel stuck open because each acquire pairs with a release.
   */
  hold: number;
  now: number;

  reduceMotion: boolean;
  reduceTransparency: boolean;
  increaseContrast: boolean;
  wallpaperLight: boolean;
  hoverIntent: number;
  demoOpen: boolean;

  trackIx: number;
  media: MediaState;

  timers: Timer[];
  cycles: boolean;
  draftName: string;
  draftMins: string;

  meeting: MeetingState;
  calendarPerm: PermissionState;

  battery: BatteryState;

  paletteQuery: string;
  paletteSel: number;

  toasts: Toast[];

  shelf: ShelfFile[];
  shelfHot: boolean;

  transfers: Transfer[];

  clipCapture: boolean;
  clipQuery: string;
  clipRetention: '1 hour' | '7 days' | 'Forever';
  clipPaused: boolean;
  clips: Clip[];

  workflows: Workflow[];

  windowsTarget: number;
  accessibilityPerm: PermissionState;

  statsStale: boolean;
  statsSeed: number;

  audioOutput: string;
  bt: BtDevice[];

  plugins: Plugin[];
  ai: AiState;

  settings: SettingsState;
  priorityOrder: string[];
  enabledModules: ModuleId[];

  onboardOpen: boolean;
  onboardStep: number;

  perms: Perms;
}
