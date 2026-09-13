import type { ComponentType } from 'react';

import type { SurfaceId } from '../state/types';
import { AiModule } from './AiModule';
import { AppsModule } from './AppsModule';
import { BatteryModule } from './BatteryModule';
import { ClipboardModule } from './ClipboardModule';
import { DevicesModule } from './DevicesModule';
import { DownloadModule } from './DownloadModule';
import { HomeModule } from './HomeModule';
import { MediaModule } from './MediaModule';
import { MeetingModule } from './MeetingModule';
import { PaletteModule } from './PaletteModule';
import { PluginsModule } from './PluginsModule';
import { ShelfModule } from './ShelfModule';
import { StatsModule } from './StatsModule';
import { TimerModule } from './TimerModule';
import { WindowsModule } from './WindowsModule';
import { WorkflowModule } from './WorkflowModule';

/**
 * The module registry. Every surface resolves to exactly one component, so
 * adding a module is a single entry here plus its own file — nothing in the
 * island shell needs to know which modules exist.
 */
export const MODULE_REGISTRY: Record<SurfaceId, ComponentType> = {
  media: MediaModule,
  timer: TimerModule,
  meeting: MeetingModule,
  battery: BatteryModule,
  shelf: ShelfModule,
  download: DownloadModule,
  clipboard: ClipboardModule,
  apps: AppsModule,
  workflow: WorkflowModule,
  windows: WindowsModule,
  stats: StatsModule,
  devices: DevicesModule,
  plugins: PluginsModule,
  ai: AiModule,
  palette: PaletteModule,
  home: HomeModule,
};

/** Modules whose data is seeded rather than read from the system. */
export const DEMO_DATA_SURFACES: ReadonlySet<SurfaceId> = new Set([
  'media',
  'meeting',
  'battery',
]);
