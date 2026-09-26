import { MODULE_IDS, TITLES } from '../../state/constants';
import type { Action } from '../../state/reducer';
import type { HaloState, ModuleId, SettingsPane } from '../../state/types';
import type { PaneContent, SettingRow } from './rows';

interface PaneDeps {
  state: HaloState;
  dispatch: (action: Action) => void;
  toast: (text: string, kind: string, color: string) => void;
}

/** Priority band colours, highest-interrupting first. */
const BAND_DOTS = ['#FF453A', '#5E5CE6', '#0A84FF', '#FF9A6B', 'rgba(255,255,255,.35)'];

export function paneContent(pane: SettingsPane, deps: PaneDeps): PaneContent {
  const { state, dispatch, toast } = deps;
  const patch = (value: Partial<HaloState['settings']>) =>
    dispatch({ type: 'settingsPatch', patch: value });

  switch (pane) {
    case 'general':
      return {
        title: 'General',
        sub: 'How HALO behaves day to day.',
        rows: [
          {
            kind: 'toggle',
            label: 'Launch at login',
            sub: 'Start HALO when you log in.',
            on: state.settings.launchAtLogin,
            onToggle: () => patch({ launchAtLogin: !state.settings.launchAtLogin }),
          },
          {
            kind: 'toggle',
            label: 'Keep panel state across restarts',
            sub: 'Reopen the last pinned module and restore in-progress input.',
            on: state.settings.persist,
            onToggle: () => patch({ persist: !state.settings.persist }),
          },
          {
            kind: 'segment',
            label: 'Density',
            sub: 'Subtle uses tighter spacing and smaller type.',
            value: state.settings.density,
            options: [
              ['comfortable', 'Comfortable'],
              ['subtle', 'Subtle'],
            ],
            onPick: (value) => patch({ density: value as HaloState['settings']['density'] }),
          },
          {
            kind: 'toggle',
            label: 'Suppress in selected apps',
            sub: 'Hide the island while a per-app suppression list is frontmost.',
            on: state.settings.suppress,
            onToggle: () => patch({ suppress: !state.settings.suppress }),
          },
        ],
      };

    case 'activation':
      return {
        title: 'Activation',
        sub: 'What opens the island, and how eagerly.',
        rows: [
          {
            kind: 'segment',
            label: 'Open on',
            sub: 'Hover previews; click always opens the active module.',
            value: state.settings.activation,
            options: [
              ['hover', 'Hover + click'],
              ['click', 'Click only'],
            ],
            onPick: (value) => patch({ activation: value as HaloState['settings']['activation'] }),
          },
          {
            kind: 'slider',
            label: 'Hover intent',
            sub: 'Delay before a hover expands the island. Higher values prevent accidental opening.',
            min: 0,
            max: 600,
            step: 50,
            value: state.hoverIntent,
            valueLabel: `${state.hoverIntent} ms`,
            onInput: (ms) => dispatch({ type: 'setHoverIntent', ms }),
          },
          {
            kind: 'toggle',
            label: 'Collapse when clicking outside',
            sub: 'Unpinned panels close; pinned panels stay open.',
            on: state.settings.collapseOutside,
            onToggle: () => patch({ collapseOutside: !state.settings.collapseOutside }),
          },
          {
            kind: 'segment',
            label: 'Full-screen apps',
            sub: 'Behaviour while another app is full screen.',
            value: state.settings.fullscreen,
            options: [
              ['hide', 'Hide island'],
              ['show', 'Keep visible'],
            ],
            onPick: (value) => patch({ fullscreen: value as HaloState['settings']['fullscreen'] }),
          },
        ],
      };

    case 'appearance':
      return {
        title: 'Appearance',
        sub: 'Materials, contrast, and the desktop scene.',
        rows: [
          {
            kind: 'segment',
            label: 'Theme',
            sub: 'The island is always dark so it reads as part of the hardware.',
            value: state.settings.appearance,
            options: [
              ['match', 'Match system'],
              ['dark', 'Always dark'],
            ],
            onPick: (value) => patch({ appearance: value as HaloState['settings']['appearance'] }),
          },
          {
            kind: 'toggle',
            label: 'Reduce transparency',
            sub: 'Replaces glass materials with opaque surfaces.',
            on: state.reduceTransparency,
            onToggle: () => dispatch({ type: 'toggleFlag', flag: 'reduceTransparency' }),
          },
          {
            kind: 'toggle',
            label: 'Increase contrast',
            sub: 'Strengthens borders and text contrast.',
            on: state.increaseContrast,
            onToggle: () => dispatch({ type: 'toggleFlag', flag: 'increaseContrast' }),
          },
          {
            kind: 'toggle',
            label: 'Bright wallpaper (demo)',
            sub: 'Check legibility over a light desktop picture.',
            on: state.wallpaperLight,
            onToggle: () => dispatch({ type: 'toggleFlag', flag: 'wallpaperLight' }),
          },
        ],
      };

    case 'motion':
      return {
        title: 'Motion',
        sub: 'Expansion is 280 ms; small feedback transitions are 140 ms.',
        rows: [
          {
            kind: 'toggle',
            label: 'Reduce motion',
            sub: 'Replaces expansion springs with a cross-fade.',
            on: state.reduceMotion,
            onToggle: () => dispatch({ type: 'toggleFlag', flag: 'reduceMotion' }),
          },
          {
            kind: 'keys',
            label: 'Expansion duration',
            sub: 'Applies to width, height, and corner radius together.',
            keys: ['280 ms'],
          },
          {
            kind: 'keys',
            label: 'Feedback duration',
            sub: 'Applies to toggles, hovers, and value changes.',
            keys: ['140 ms'],
          },
          {
            kind: 'keys',
            label: 'Curve',
            sub: 'cubic-bezier(0.32, 0.72, 0, 1) — an asymmetric ease that settles without overshoot.',
            keys: ['spring'],
          },
        ],
      };

    case 'shortcuts':
      return {
        title: 'Keyboard shortcuts',
        sub: 'Every gesture has a keyboard equivalent.',
        rows: [
          { kind: 'keys', label: 'Open command palette', keys: ['⌘', 'K'] },
          { kind: 'keys', label: 'Open active module', keys: ['⌥', 'Space'] },
          { kind: 'keys', label: 'Switch to next activity', keys: ['⌥', '⇥'] },
          { kind: 'keys', label: 'Pin or unpin the panel', keys: ['⌘', 'P'] },
          { kind: 'keys', label: 'Dismiss the current surface', keys: ['esc'] },
        ],
      };

    case 'priority':
      return {
        title: 'Activity priority',
        sub: 'When several activities are live, the highest band wins. Anything you are actively interacting with always comes first.',
        rows: [
          {
            kind: 'order',
            label: 'Order',
            sub: 'Move a band up to make it interrupt more readily.',
            items: state.priorityOrder.map((band, index) => ({
              label: band,
              dot: BAND_DOTS[index] ?? 'rgba(255,255,255,.35)',
            })),
            onMove: (index, delta) => dispatch({ type: 'movePriority', index, delta }),
          },
          {
            kind: 'toggle',
            label: 'Never interrupt while typing',
            sub: 'Urgent events use the secondary indicator instead of taking over.',
            on: state.settings.neverInterruptTyping,
            onToggle: () =>
              patch({ neverInterruptTyping: !state.settings.neverInterruptTyping }),
          },
        ],
      };

    case 'displays':
      return {
        title: 'Displays',
        sub: 'Where the island appears, and what happens without a notch.',
        rows: [
          {
            kind: 'segment',
            label: 'Displays without a notch',
            sub: 'On an external monitor there is no hardware cutout to sit in.',
            value: state.settings.notchless,
            options: [
              ['menubar', 'Menu-bar pill'],
              ['none', 'Do not show'],
            ],
            onPick: (value) => patch({ notchless: value as HaloState['settings']['notchless'] }),
          },
          {
            kind: 'keys',
            label: 'Built-in Retina display',
            sub: '1512 × 982 at 2× — notch detected, auxiliary top areas reported by NSScreen.',
            keys: ['notched'],
          },
          {
            kind: 'keys',
            label: 'Studio Display',
            sub: '2560 × 1440 at 2× — no cutout; the island renders as a menu-bar pill.',
            keys: ['flat'],
          },
          {
            kind: 'toggle',
            label: 'Follow the active display',
            sub: 'Move the island to whichever display has keyboard focus.',
            on: state.settings.followActiveDisplay,
            onToggle: () => patch({ followActiveDisplay: !state.settings.followActiveDisplay }),
          },
        ],
      };

    case 'modules':
      return {
        title: 'Modules',
        sub: 'Turn modules off to remove them from the island, the switcher, and the palette.',
        rows: [
          {
            kind: 'checkboxes',
            label: 'Enabled modules',
            sub: 'Disabled modules never request access.',
            items: MODULE_IDS.map((id) => ({
              id,
              label: TITLES[id],
              on: state.enabledModules.includes(id),
            })),
            onToggle: (id) => dispatch({ type: 'toggleModule', id: id as ModuleId }),
          },
          {
            kind: 'keys',
            label: 'Pinned modules',
            sub: 'Pinned modules stay open while you work and survive a restart.',
            keys: [
              state.pinned && state.forced ? (TITLES[state.forced] ?? 'none') : 'none',
            ],
          },
        ],
      };

    case 'integrations':
      return {
        title: 'Integrations',
        sub: 'Each integration is verified separately. Unverified paths are marked for investigation in the implementation brief.',
        rows: [
          {
            kind: 'permission',
            label: 'Now-playing source',
            sub: 'Per-app media integration. Cross-app playback is not a single documented API.',
            state: state.media.connected ? 'granted' : 'revoked',
            onFix: () => dispatch({ type: 'mediaReconnect' }),
          },
          {
            kind: 'permission',
            label: 'Calendar & reminders',
            sub: 'EventKit — requires a full-access authorization for writing reminders.',
            state: state.calendarPerm,
            onFix: () =>
              dispatch({
                type: 'setCalendarPerm',
                value: state.calendarPerm === 'granted' ? 'denied' : 'granted',
              }),
          },
          {
            kind: 'permission',
            label: 'Window management',
            sub: 'Accessibility API. Requested the first time a window action runs.',
            state: state.accessibilityPerm,
            onFix: () =>
              dispatch({
                type: 'setAccessibilityPerm',
                value: state.accessibilityPerm === 'granted' ? 'notRequested' : 'granted',
              }),
          },
          {
            kind: 'permission',
            label: 'Browser downloads',
            sub: 'Requires a per-browser extension or file-system observation. Under investigation.',
            state: 'restricted',
            onFix: () =>
              toast(
                'Browser download integration requires native validation',
                'Noted in the capability matrix',
                '#FF9F0A',
              ),
          },
        ],
      };

    case 'plugins':
      return {
        title: 'Plugins',
        sub: 'Sample plugins ship with the prototype. The native build isolates each one in its own process.',
        rows: state.plugins.map<SettingRow>((plugin) => ({
          kind: 'toggle',
          label: plugin.name,
          sub: `${plugin.desc} Permissions: ${plugin.perms}`,
          on: plugin.enabled,
          onToggle: () => dispatch({ type: 'pluginToggle', id: plugin.id }),
        })),
      };

    case 'privacy':
      return {
        title: 'Privacy',
        sub: 'Access is requested per enabled module, at the moment it is needed.',
        rows: [
          {
            kind: 'permission',
            label: 'Calendars',
            sub: 'Next event, agenda, and meeting links.',
            state: state.calendarPerm,
            onFix: () =>
              dispatch({
                type: 'setCalendarPerm',
                value: state.calendarPerm === 'granted' ? 'denied' : 'granted',
              }),
          },
          {
            kind: 'permission',
            label: 'Reminders',
            sub: 'Quick reminder creation from the island.',
            state: state.perms.reminders,
            onFix: () => dispatch({ type: 'setPerm', key: 'reminders', value: 'granted' }),
          },
          {
            kind: 'permission',
            label: 'Accessibility',
            sub: 'Window arrangement and meeting controls.',
            state: state.accessibilityPerm,
            onFix: () => dispatch({ type: 'setAccessibilityPerm', value: 'granted' }),
          },
          {
            kind: 'permission',
            label: 'Screen recording',
            sub: 'Used only by the Presenter clock plugin.',
            state: state.perms.screen,
            onFix: () =>
              toast(
                'Screen recording is restricted by a configuration profile',
                'Simulated MDM restriction',
                '#FF9F0A',
              ),
          },
          {
            kind: 'permission',
            label: 'Automation',
            sub: 'Sending commands to meeting and browser apps.',
            state: state.perms.automation,
            onFix: () => dispatch({ type: 'setPerm', key: 'automation', value: 'granted' }),
          },
          {
            kind: 'toggle',
            label: 'Clipboard capture',
            sub: 'Off by default. Secure fields and excluded apps are never stored.',
            on: state.clipCapture,
            onToggle: () =>
              state.clipCapture
                ? dispatch({ type: 'clipTogglePause' })
                : dispatch({ type: 'clipEnable' }),
          },
          {
            kind: 'segment',
            label: 'Clipboard retention',
            sub: 'Older entries are deleted automatically.',
            value: state.clipRetention,
            options: [
              ['1 hour', '1 hour'],
              ['7 days', '7 days'],
              ['Forever', 'Forever'],
            ],
            onPick: (value) =>
              dispatch({
                type: 'clipSetRetention',
                value: value as HaloState['clipRetention'],
              }),
          },
          {
            kind: 'button',
            label: 'Delete stored history',
            sub: 'Removes clipboard entries and the shelf index from disk. Original files are untouched.',
            buttonLabel: 'Delete now',
            tone: 'danger',
            onRun: () => {
              dispatch({ type: 'clipClearAll' });
              toast('Stored history deleted', 'Executed by prototype', '#FF453A');
            },
          },
        ],
      };

    case 'reset':
    default:
      return {
        title: 'Reset',
        sub: 'Return HALO to its initial state.',
        rows: [
          {
            kind: 'button',
            label: 'Replay onboarding',
            sub: 'Shows the notch introduction, module selection, and access requests again.',
            buttonLabel: 'Replay',
            onRun: () => dispatch({ type: 'onboardOpen' }),
          },
          {
            kind: 'button',
            label: 'Reset all settings',
            sub: 'Appearance, activation, motion, priority, and module selection.',
            buttonLabel: 'Reset settings',
            onRun: () => {
              dispatch({ type: 'settingsReset' });
              toast('Settings reset', 'Executed by prototype', '#BF5AF2');
            },
          },
          {
            kind: 'button',
            label: 'Reset demonstration data',
            sub: 'Restores the sample media, timer, meeting, shelf, transfers, and permissions.',
            buttonLabel: 'Reset demo',
            tone: 'danger',
            onRun: () => {
              dispatch({ type: 'demoReset' });
              toast('Demo state reset', 'Executed by prototype', '#BF5AF2');
            },
          },
        ],
      };
  }
}
