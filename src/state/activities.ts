import type { Activity, HaloState, ModuleId } from './types';

/**
 * The activity scheduler — section 4 of the brief.
 *
 * Every activity carries a tier and a start time. The primary slot renders the
 * highest tier; the next-highest becomes a secondary chip in the right
 * shoulder. Ties break by most recent start. No module can push itself to the
 * front: this is the single place the queue is derived, and views only read
 * the snapshot it returns.
 *
 * Tiers:
 *   1  the interaction the user is performing — never displaced
 *   2  urgent: ringing call, completed timer, failed transfer needing a decision
 *   3  ongoing calls, meetings, and running workflows
 *   4  active timers, transfers, and media
 *   5  passive device and system information
 */
export function deriveActivities(state: HaloState): Activity[] {
  const out: Activity[] = [];
  const push = (id: ModuleId, kind: Activity['kind'], tier: number) => {
    if (!out.some((a) => a.id === id)) out.push({ id, kind, tier });
  };

  // Tier 2 — urgent. A completed timer persists until acknowledged.
  if (state.timers.some((t) => t.done)) push('timer', 'timer', 2);
  if (state.meeting.phase === 'ringing') push('meeting', 'call', 2);

  // Tier 3 — ongoing.
  if (state.meeting.phase === 'live') push('meeting', 'meeting', 3);
  if (state.meeting.phase === 'soon' && state.calendarPerm === 'granted') {
    push('meeting', 'meeting', 3);
  }
  if (state.workflows.some((w) => w.status === 'running')) push('workflow', 'workflow', 3);

  // Tier 4 — active.
  if (state.timers.some((t) => t.running)) push('timer', 'timer', 4);
  if (state.transfers.some((d) => d.state === 'active')) push('download', 'download', 4);
  if (state.media.connected && state.media.playing) push('media', 'media', 4);

  // Tier 5 — passive.
  if (state.shelf.length > 0) push('shelf', 'shelf', 5);
  if (state.media.connected) push('media', 'media', 5);
  if (state.battery.charging || state.battery.level <= 0.2) push('battery', 'battery', 5);

  out.sort((a, b) => a.tier - b.tier);

  // A disabled module never appears in the island, switcher, or palette.
  return out.filter((a) => state.enabledModules.includes(a.id));
}

/** The activity owning the primary slot, honouring an explicit user override. */
export function primaryActivity(state: HaloState, activities: Activity[]): Activity {
  const overridden =
    state.override && activities.find((a) => a.id === state.override);
  return overridden ?? activities[0] ?? { id: 'battery', kind: 'battery', tier: 5 };
}

/** The surface currently rendered: an opened module wins over the queue. */
export function currentSurface(state: HaloState, activities: Activity[]) {
  return state.forced ?? primaryActivity(state, activities).id;
}

/** The next-highest activity, shown as the secondary chip. */
export function secondaryActivity(
  activities: Activity[],
  primary: Activity,
): Activity | undefined {
  return activities.find((a) => a.id !== primary.id);
}
