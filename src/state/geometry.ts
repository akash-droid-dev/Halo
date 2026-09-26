import { GEOMETRY, HEIGHTS } from './constants';
import type { IslandMode, SurfaceId } from './types';

export interface IslandGeometry {
  width: number;
  height: number;
  radius: number;
}

/**
 * Island geometry per state — section 3 of the brief. Width, height, and
 * radius are returned together because they animate on one curve, so the
 * silhouette never breaks mid-transition.
 */
export function islandGeometry(
  mode: IslandMode,
  surface: SurfaceId,
  isOpen: boolean,
): IslandGeometry {
  if (isOpen) {
    return {
      width: surface === 'palette' ? GEOMETRY.paletteWidth : GEOMETRY.expanded.w,
      height: HEIGHTS[surface] ?? GEOMETRY.expanded.h,
      radius: GEOMETRY.expanded.r,
    };
  }
  if (mode === 'preview') {
    return { width: GEOMETRY.preview.w, height: GEOMETRY.preview.h, radius: GEOMETRY.preview.r };
  }
  if (mode === 'compact') {
    return { width: GEOMETRY.compact.w, height: GEOMETRY.compact.h, radius: GEOMETRY.compact.r };
  }
  return { width: GEOMETRY.rest.w, height: GEOMETRY.rest.h, radius: GEOMETRY.rest.r };
}
