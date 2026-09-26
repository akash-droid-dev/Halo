import { createContext, useContext } from 'react';

import type { IslandGeometry } from './geometry';
import type { Action } from './reducer';
import type { Activity, HaloState, SurfaceId } from './types';

/**
 * One immutable snapshot per change. Views diff against this rather than
 * reaching into the store, which is what stops a module pushing itself to the
 * front of the queue.
 */
export interface HaloSnapshot {
  state: HaloState;
  activities: Activity[];
  primary: Activity;
  secondary: Activity | undefined;
  surface: SurfaceId;
  accent: string;
  geometry: IslandGeometry;
  isOpen: boolean;
  isPreview: boolean;
  isCompact: boolean;
  /** Media position in ms, advanced from the last write. */
  mediaPos: number;
}

export interface HaloApi {
  dispatch: (action: Action) => void;
  /** Bottom-left provenance toast: what performed the action, and in what role. */
  toast: (text: string, kind: string, color: string) => void;
  hoverEnter: () => void;
  hoverLeave: () => void;
  hold: () => void;
  release: () => void;
  open: (surface: SurfaceId) => void;
  collapse: () => void;
  runWorkflow: (id: string) => void;
  runAi: (kind: 'summary' | 'rewrite' | 'error') => void;
  runWindowAction: (label: string) => void;
  addTimer: (name: string, minutes: number) => void;
}

export const SnapshotContext = createContext<HaloSnapshot | null>(null);
export const ApiContext = createContext<HaloApi | null>(null);

/** The current snapshot. Re-renders whenever any state changes. */
export function useHalo(): HaloSnapshot {
  const value = useContext(SnapshotContext);
  if (!value) throw new Error('useHalo must be used inside <HaloProvider>');
  return value;
}

/** Stable action helpers. Safe to depend on — this identity does not change. */
export function useHaloApi(): HaloApi {
  const value = useContext(ApiContext);
  if (!value) throw new Error('useHaloApi must be used inside <HaloProvider>');
  return value;
}
