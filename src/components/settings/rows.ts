import type { ReactNode } from 'react';

import type { PermissionState } from '../../state/types';

/**
 * Settings rows are data, not markup. Each pane returns a list of these and
 * one renderer draws them all, so a new row type is added in one place rather
 * than in every pane.
 */
export type SettingRow =
  | { kind: 'toggle'; label: string; sub?: string; on: boolean; onToggle: () => void }
  | {
      kind: 'segment';
      label: string;
      sub?: string;
      value: string;
      options: readonly (readonly [string, string])[];
      onPick: (value: string) => void;
    }
  | {
      kind: 'slider';
      label: string;
      sub?: string;
      min: number;
      max: number;
      step: number;
      value: number;
      valueLabel: string;
      onInput: (value: number) => void;
    }
  | {
      kind: 'permission';
      label: string;
      sub?: string;
      state: PermissionState;
      onFix: () => void;
    }
  | {
      kind: 'button';
      label: string;
      sub?: string;
      buttonLabel: string;
      tone?: 'quiet' | 'danger';
      onRun: () => void;
    }
  | { kind: 'keys'; label: string; sub?: string; keys: readonly string[] }
  | {
      kind: 'order';
      label: string;
      sub?: string;
      items: { label: string; dot: string }[];
      onMove: (index: number, delta: number) => void;
    }
  | {
      kind: 'checkboxes';
      label: string;
      sub?: string;
      items: { id: string; label: string; on: boolean }[];
      onToggle: (id: string) => void;
    };

export interface PaneContent {
  title: string;
  sub: ReactNode;
  rows: SettingRow[];
}
