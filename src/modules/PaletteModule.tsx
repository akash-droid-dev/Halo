import { useEffect, useMemo, useRef } from 'react';

import { MODULE_IDS, MODULE_SUBTITLES, TITLES } from '../state/constants';
import { useHalo, useHaloApi } from '../state/context';
import { SearchIcon } from '../components/primitives/Icon';

type CommandGroup = 'Module' | 'Workflow' | 'Action' | 'File' | 'App';

interface Command {
  title: string;
  sub: string;
  group: CommandGroup;
  onRun: () => void;
}

const GROUP_LOOK: Record<CommandGroup, { bg: string; ink: string }> = {
  Module: { bg: 'rgba(10,132,255,.2)', ink: '#7AB8FF' },
  Workflow: { bg: 'rgba(191,90,242,.2)', ink: '#D8A8FF' },
  App: { bg: 'rgba(255,255,255,.09)', ink: 'rgba(255,255,255,.7)' },
  Action: { bg: 'rgba(48,209,88,.18)', ink: '#7DE2A0' },
  File: { bg: 'rgba(48,209,88,.18)', ink: '#7DE2A0' },
};

const MAX_RESULTS = 9;

/**
 * Search across modules, saved workflows, one-shot actions, shelf files, and
 * apps. Arrow keys move the selection and Enter runs it, so the palette is
 * fully operable without the pointer.
 */
export function PaletteModule() {
  const { state } = useHalo();
  const { dispatch, toast, open, collapse, runWorkflow, runWindowAction, addTimer } = useHaloApi();
  const inputRef = useRef<HTMLInputElement>(null);
  const { hold, release } = useHaloApi();

  // The palette is a search surface, so it takes focus the moment it opens.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands = useMemo<Command[]>(() => {
    const enabled = MODULE_IDS.filter((id) => state.enabledModules.includes(id));
    return [
      ...enabled.map<Command>((id) => ({
        title: TITLES[id],
        sub: MODULE_SUBTITLES[id],
        group: 'Module',
        onRun: () => open(id),
      })),
      {
        title: 'All modules',
        sub: 'Open the module grid',
        group: 'Module',
        onRun: () => open('home'),
      },
      {
        title: 'Start work',
        sub: 'Opens Xcode and Figma, starts a 50 min focus timer',
        group: 'Workflow',
        onRun: () => runWorkflow('w1'),
      },
      {
        title: 'Share shelf via AirDrop',
        sub: 'Sends shelf files to a nearby device',
        group: 'Workflow',
        onRun: () => runWorkflow('w2'),
      },
      {
        title: 'Pause playback',
        sub: 'Now Playing',
        group: 'Action',
        onRun: () => {
          dispatch({ type: 'mediaPause' });
          collapse();
        },
      },
      {
        title: 'Start 25 min timer',
        sub: 'Timers',
        group: 'Action',
        onRun: () => addTimer('25 min focus', 25),
      },
      {
        title: 'Window left half',
        sub: 'Arrange the target window',
        group: 'Action',
        onRun: () => runWindowAction('Left half'),
      },
      {
        title: 'Open Settings',
        sub: 'Appearance, activation, privacy, modules',
        group: 'Action',
        onRun: () => dispatch({ type: 'settingsOpen' }),
      },
      ...state.shelf.map<Command>((file) => ({
        title: file.name,
        sub: `${file.kind} — in shelf`,
        group: 'File',
        onRun: () => {
          open('shelf');
          toast(`Revealed ${file.name} in Finder`, 'Simulated system action', '#BF5AF2');
        },
      })),
      ...['Xcode', 'Figma', 'Safari', 'Notes'].map<Command>((app) => ({
        title: app,
        sub: `/Applications/${app}.app`,
        group: 'App',
        onRun: () => toast(`Opened ${app}`, 'Simulated system action', '#BF5AF2'),
      })),
    ];
  }, [state.enabledModules, state.shelf, dispatch, open, collapse, runWorkflow, runWindowAction, addTimer, toast]);

  const query = state.paletteQuery.trim().toLowerCase();
  const results = useMemo(
    () =>
      (query
        ? commands.filter((command) =>
            `${command.title} ${command.sub} ${command.group}`.toLowerCase().includes(query),
          )
        : commands
      ).slice(0, MAX_RESULTS),
    [commands, query],
  );

  const selected = Math.min(state.paletteSel, Math.max(0, results.length - 1));

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      dispatch({ type: 'paletteMove', delta: 1, count: results.length });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      dispatch({ type: 'paletteMove', delta: -1, count: results.length });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      results[selected]?.onRun();
    }
  };

  return (
    <div className="palette" onMouseEnter={hold} onMouseLeave={release}>
      <div className="palette__field">
        <span style={{ color: 'rgba(255,255,255,.5)', flex: 'none', display: 'flex' }}>
          <SearchIcon size={16} />
        </span>
        <input
          ref={inputRef}
          className="field--bare"
          style={{ fontSize: 14 }}
          value={state.paletteQuery}
          placeholder="Search modules, files, actions, apps…"
          aria-label="Command palette search"
          aria-controls="palette-results"
          role="combobox"
          aria-expanded
          autoComplete="off"
          onFocus={hold}
          onBlur={release}
          onChange={(event) => dispatch({ type: 'paletteQuery', value: event.target.value })}
          onKeyDown={onKeyDown}
        />
        <kbd className="keycap" style={{ fontSize: 10.5, fontWeight: 400 }}>
          esc
        </kbd>
      </div>

      <div className="palette__results" id="palette-results" role="listbox">
        {results.map((command, index) => {
          const look = GROUP_LOOK[command.group];
          return (
            <button
              key={`${command.group}-${command.title}`}
              type="button"
              role="option"
              aria-selected={index === selected}
              data-selected={index === selected}
              className="palette__result"
              onMouseEnter={() => dispatch({ type: 'paletteSelect', index })}
              onClick={command.onRun}
              style={
                { '--icon-bg': look.bg, '--icon-ink': look.ink } as React.CSSProperties
              }
            >
              <span className="palette__icon" aria-hidden>
                {command.title[0]}
              </span>
              <span className="stack" style={{ flex: 1, minWidth: 0, gap: 1 }}>
                <span className="palette__title truncate">{command.title}</span>
                <span className="palette__sub truncate">{command.sub}</span>
              </span>
              <span className="palette__group">{command.group}</span>
            </button>
          );
        })}

        {results.length === 0 && (
          <div style={{ padding: '28px 16px', textAlign: 'center' }} className="stack">
            <div style={{ fontSize: 13, color: 'var(--ink-secondary)' }}>
              No matches for “{state.paletteQuery}”
            </div>
            <div className="note" style={{ marginTop: 6 }}>
              Try a module name, a file in the shelf, an app, or a workflow.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
