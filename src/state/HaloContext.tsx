import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';

import { shortId } from '../lib/format';
import { useHotkeys, type Hotkey } from '../lib/useHotkeys';
import { useSystemReducedMotion } from '../lib/usePrefersReducedMotion';
import {
  currentSurface,
  deriveActivities,
  primaryActivity,
  secondaryActivity,
} from './activities';
import { accentFor } from './constants';
import {
  ApiContext,
  SnapshotContext,
  type HaloApi,
  type HaloSnapshot,
} from './context';
import { islandGeometry } from './geometry';
import { createInitialState } from './initialState';
import { haloReducer, mediaPosition } from './reducer';
import type { SurfaceId } from './types';

/** Wall-clock cadence for countdowns and progress. */
const TICK_MS = 250;
const TRANSFER_STEP = 0.012;
const WORKFLOW_STEP = 0.14;
const WORKFLOW_INTERVAL = 320;
const AI_STEP = 0.2;
const AI_INTERVAL = 260;
const TOAST_LIFETIME = 4200;
/** Grace period before an unhovered island collapses. */
const LEAVE_GRACE = 260;

export function HaloProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(haloReducer, undefined, () => createInitialState());

  /** Latest state, for callbacks that must not close over a stale render. */
  const latest = useRef(state);
  latest.current = state;

  const hoverTimer = useRef<number | undefined>(undefined);
  const workflowTimer = useRef<number | undefined>(undefined);
  const aiTimer = useRef<number | undefined>(undefined);

  // ---- derived snapshot -------------------------------------------------
  const activities = useMemo(() => deriveActivities(state), [state]);
  const primary = useMemo(() => primaryActivity(state, activities), [state, activities]);
  const secondary = useMemo(() => secondaryActivity(activities, primary), [activities, primary]);
  const surface = useMemo(() => currentSurface(state, activities), [state, activities]);

  const isOpen = state.mode === 'expanded' || state.pinned;
  const isPreview = state.mode === 'preview' && !isOpen;
  const isCompact = state.mode === 'compact' && !isOpen;

  const snapshot = useMemo<HaloSnapshot>(() => {
    // A ringing call keeps the urgent accent even while the module is open.
    const accentKey =
      primary.kind === 'call' && surface === 'meeting' ? 'call' : surface;
    return {
      state,
      activities,
      primary,
      secondary,
      surface,
      accent: accentFor(accentKey),
      geometry: islandGeometry(state.mode, surface, isOpen),
      isOpen,
      isPreview,
      isCompact,
      mediaPos: mediaPosition(state, state.now),
    };
  }, [state, activities, primary, secondary, surface, isOpen, isPreview, isCompact]);

  // ---- toasts -----------------------------------------------------------
  const toast = useCallback((text: string, kind: string, color: string) => {
    const id = shortId('x');
    dispatch({ type: 'toastPush', toast: { id, text, kind, color } });
    window.setTimeout(() => dispatch({ type: 'toastDismiss', id }), TOAST_LIFETIME);
  }, []);

  // ---- hover intent -----------------------------------------------------
  const clearHoverTimer = useCallback(() => {
    if (hoverTimer.current !== undefined) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = undefined;
    }
  }, []);

  const hoverEnter = useCallback(() => {
    dispatch({ type: 'hoverEnter' });
    clearHoverTimer();
    const s = latest.current;
    if (s.mode === 'expanded' || s.pinned) return;
    // `Click only` activation skips the hover preview entirely.
    if (s.settings.activation === 'click') return;
    hoverTimer.current = window.setTimeout(() => {
      const now = latest.current;
      if (now.hovering && now.mode !== 'expanded') dispatch({ type: 'setMode', mode: 'preview' });
    }, s.hoverIntent);
  }, [clearHoverTimer]);

  const hoverLeave = useCallback(() => {
    dispatch({ type: 'hoverLeave' });
    clearHoverTimer();
    hoverTimer.current = window.setTimeout(() => {
      const s = latest.current;
      // Collapse guards: a drag, focused field, or open child menu holds it open.
      if (s.hovering || s.pinned || s.hold > 0) return;
      dispatch({ type: 'setMode', mode: 'compact' });
      if (s.media.outputOpen) dispatch({ type: 'mediaToggleOutputMenu' });
    }, LEAVE_GRACE);
  }, [clearHoverTimer]);

  const hold = useCallback(() => dispatch({ type: 'holdAcquire' }), []);
  const release = useCallback(() => dispatch({ type: 'holdRelease' }), []);
  const open = useCallback((s: SurfaceId) => dispatch({ type: 'openSurface', surface: s }), []);
  const collapse = useCallback(() => dispatch({ type: 'collapse' }), []);

  const addTimer = useCallback(
    (name: string, minutes: number) => {
      dispatch({ type: 'timerAdd', name, minutes });
      toast(`${name} started — ${minutes} min`, 'Executed by prototype', '#0A84FF');
    },
    [toast],
  );

  // ---- workflow runner --------------------------------------------------
  const runWorkflow = useCallback(
    (id: string) => {
      const workflow = latest.current.workflows.find((w) => w.id === id);
      if (!workflow) return;
      dispatch({ type: 'workflowStart', id });

      if (workflowTimer.current !== undefined) window.clearInterval(workflowTimer.current);
      workflowTimer.current = window.setInterval(() => {
        const current = latest.current.workflows.find((w) => w.id === id);
        if (!current || current.status !== 'running') {
          window.clearInterval(workflowTimer.current);
          workflowTimer.current = undefined;
          return;
        }
        const next = current.pct + WORKFLOW_STEP;
        if (next < 1) {
          dispatch({ type: 'workflowProgress', id, pct: next });
          return;
        }

        window.clearInterval(workflowTimer.current);
        workflowTimer.current = undefined;

        // `w3` is the seeded failure case in the demo scene.
        const ok = id !== 'w3';
        const result = ok
          ? id === 'w1'
            ? 'Opened Xcode and Figma, set Do Not Disturb, started a 50 minute focus timer.'
            : `Sent ${latest.current.shelf.length} files to ${current.param ?? 'the chosen device'}.`
          : 'Failed: the Archive folder could not be found. Choose a new destination or retry.';

        dispatch({ type: 'workflowFinish', id, ok, result });
        if (ok && id === 'w1') addTimer('Start work focus', 50);
        toast(
          `${workflow.name} ${ok ? 'finished' : 'failed'}`,
          ok ? 'Mixed: real timer, simulated launches' : 'Simulated failure',
          ok ? '#30D158' : '#FF453A',
        );
      }, WORKFLOW_INTERVAL);
    },
    [addTimer, toast],
  );

  // ---- AI runner --------------------------------------------------------
  const runAi = useCallback((kind: 'summary' | 'rewrite' | 'error') => {
    dispatch({ type: 'aiStart' });
    if (aiTimer.current !== undefined) window.clearInterval(aiTimer.current);
    aiTimer.current = window.setInterval(() => {
      const ai = latest.current.ai;
      if (!ai.busy) {
        window.clearInterval(aiTimer.current);
        aiTimer.current = undefined;
        return;
      }
      const next = ai.pct + AI_STEP;
      if (next < 1) {
        dispatch({ type: 'aiProgress', pct: next });
        return;
      }
      window.clearInterval(aiTimer.current);
      aiTimer.current = undefined;

      const error = kind === 'error';
      const result = error
        ? 'The provider returned an error (429 — rate limited). Nothing was stored. Retry, or change provider in Settings.'
        : kind === 'summary'
          ? 'Keep the island anchored to the notch, animate its geometry continuously, and offer a reduced-motion alternative to the spring.'
          : 'Anchor expansion to the notch so geometry stays continuous and content does not jump. Use restrained spring motion, with a reduced-motion alternative.';
      dispatch({ type: 'aiFinish', result, error });
    }, AI_INTERVAL);
  }, []);

  // ---- window actions ---------------------------------------------------
  const runWindowAction = useCallback(
    (label: string) => {
      const s = latest.current;
      // Access is requested at the point of use, not at launch.
      if (s.accessibilityPerm !== 'granted') {
        dispatch({ type: 'openSurface', surface: 'windows' });
        toast(
          `“${label}” needs Accessibility access`,
          'Access requested at point of use',
          '#FF9F0A',
        );
        return;
      }
      const targets = [
        'Notes — Release plan',
        'Terminal — swift build',
        'Safari — developer.apple.com',
      ];
      const target = targets[s.windowsTarget % targets.length]!;
      toast(`“${label}” applied to ${target}`, 'Simulated system action', '#64D2FF');
    },
    [toast],
  );

  // ---- clock and progress ----------------------------------------------
  useEffect(() => {
    const interval = window.setInterval(() => {
      const s = latest.current;
      dispatch({ type: 'tick', now: Date.now() });

      const expired = s.timers.filter((t) => t.running && t.endAt <= Date.now());
      if (expired.length > 0) {
        dispatch({ type: 'timersExpire', ids: expired.map((t) => t.id) });
      }
      if (s.transfers.some((d) => d.state === 'active' && d.pct < 1)) {
        dispatch({ type: 'transferAdvance', step: TRANSFER_STEP });
      }
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, []);

  // Tear down every pending timer on unmount.
  useEffect(
    () => () => {
      if (hoverTimer.current !== undefined) window.clearTimeout(hoverTimer.current);
      if (workflowTimer.current !== undefined) window.clearInterval(workflowTimer.current);
      if (aiTimer.current !== undefined) window.clearInterval(aiTimer.current);
    },
    [],
  );

  // ---- system reduced motion -------------------------------------------
  const onSystemReducedMotion = useCallback((reduced: boolean) => {
    dispatch({ type: 'setFlag', flag: 'reduceMotion', value: reduced });
  }, []);
  useSystemReducedMotion(onSystemReducedMotion);

  // Accessibility flags drive the token layer through root attributes.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.reduceMotion = String(state.reduceMotion);
    root.dataset.reduceTransparency = String(state.reduceTransparency);
    root.dataset.increaseContrast = String(state.increaseContrast);
    root.dataset.density = state.settings.density;
  }, [
    state.reduceMotion,
    state.reduceTransparency,
    state.increaseContrast,
    state.settings.density,
  ]);

  // ---- keyboard ---------------------------------------------------------
  const hotkeys = useMemo<Hotkey[]>(
    () => [
      { key: 'Escape', run: () => dispatch({ type: 'collapse', viaEscape: true }) },
      { key: 'k', meta: true, run: () => dispatch({ type: 'openSurface', surface: 'palette' }) },
      { key: 'p', meta: true, run: () => dispatch({ type: 'togglePin' }) },
      {
        key: ' ',
        alt: true,
        run: () => {
          const s = latest.current;
          const acts = deriveActivities(s);
          dispatch({ type: 'openSurface', surface: currentSurface(s, acts) });
        },
      },
      {
        key: 'Tab',
        alt: true,
        run: () => {
          const s = latest.current;
          const acts = deriveActivities(s);
          dispatch({
            type: 'cycleActivity',
            ids: acts.map((a) => a.id),
            current: currentSurface(s, acts),
          });
        },
      },
    ],
    [],
  );
  useHotkeys(hotkeys);

  // A pinned panel is dismissed only by unpinning, never by an outside click.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const s = latest.current;
      if (s.pinned) return;
      if (!s.settings.collapseOutside) return;
      if (!(s.mode === 'expanded')) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-halo-surface]')) return;
      dispatch({ type: 'collapse' });
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const api = useMemo<HaloApi>(
    () => ({
      dispatch,
      toast,
      hoverEnter,
      hoverLeave,
      hold,
      release,
      open,
      collapse,
      runWorkflow,
      runAi,
      runWindowAction,
      addTimer,
    }),
    [
      toast,
      hoverEnter,
      hoverLeave,
      hold,
      release,
      open,
      collapse,
      runWorkflow,
      runAi,
      runWindowAction,
      addTimer,
    ],
  );

  return (
    <ApiContext.Provider value={api}>
      <SnapshotContext.Provider value={snapshot}>{children}</SnapshotContext.Provider>
    </ApiContext.Provider>
  );
}
