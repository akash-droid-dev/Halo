import type { Activity, HaloState, ModuleId, PriorityBand } from './types';
import { PRIORITY_BANDS } from './types';

/**
 * The activity scheduler — section 4 of the brief.
 *
 * Every activity carries a tier and a priority band. The primary slot renders
 * the highest-ranked activity; the next becomes a secondary chip in the right
 * shoulder. No module can push itself to the front: this is the single place
 * the queue is derived, and views only read the snapshot it returns.
 *
 * Rank comes from the band's position in the user's configured order, so
 * moving a band up in Settings genuinely makes it interrupt more readily.
 * Tier orders activities within a band.
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
  const push = (id: ModuleId, kind: Activity['kind'], tier: number, band: PriorityBand) => {
    if (!out.some((a) => a.id === id)) out.push({ id, kind, tier, band });
  };

  // Tier 2 — urgent. Each of these persists until the user deals with it.
  if (state.timers.some((t) => t.done)) push('timer', 'timer', 2, 'Urgent events');
  if (state.meeting.phase === 'ringing') push('meeting', 'call', 2, 'Urgent events');
  // A failed transfer still offers Retry, so it stays on the island rather
  // than vanishing when the last active transfer finishes.
  if (state.transfers.some((d) => d.state === 'failed')) {
    push('download', 'download', 2, 'Urgent events');
  }

  // Tier 3 — ongoing.
  if (state.meeting.phase === 'live') push('meeting', 'meeting', 3, 'Calls & meetings');
  if (state.meeting.phase === 'soon' && state.calendarPerm === 'granted') {
    push('meeting', 'meeting', 3, 'Calls & meetings');
  }
  if (state.workflows.some((w) => w.status === 'running')) {
    push('workflow', 'workflow', 3, 'Timers & transfers');
  }

  // Tier 4 — active.
  if (state.timers.some((t) => t.running)) push('timer', 'timer', 4, 'Timers & transfers');
  if (state.transfers.some((d) => d.state === 'active')) {
    push('download', 'download', 4, 'Timers & transfers');
  }
  if (state.media.connected && state.media.playing) push('media', 'media', 4, 'Media');

  // Tier 5 — passive.
  if (state.shelf.length > 0) push('shelf', 'shelf', 5, 'Passive system info');
  if (state.media.connected) push('media', 'media', 5, 'Media');
  if (state.battery.charging || state.battery.level <= 0.2) {
    push('battery', 'battery', 5, 'Passive system info');
  }

  const rank = bandRanks(state.priorityOrder);
  out.sort((a, b) => {
    const byBand = (rank[a.band] ?? 0) - (rank[b.band] ?? 0);
    return byBand !== 0 ? byBand : a.tier - b.tier;
  });

  // A disabled module never appears in the island, switcher, or palette.
  return out.filter((a) => state.enabledModules.includes(a.id));
}

/**
 * Position of each band in the configured order. Bands the stored order does
 * not mention fall in behind the ones it does, so a stale or partial setting
 * can never drop an activity out of the ranking.
 */
function bandRanks(order: readonly PriorityBand[]): Record<PriorityBand, number> {
  const ranks = {} as Record<PriorityBand, number>;
  for (const band of PRIORITY_BANDS) {
    const index = order.indexOf(band);
    ranks[band] = index === -1 ? PRIORITY_BANDS.length : index;
  }
  return ranks;
}

/** The activity owning the primary slot, honouring an explicit user override. */
export function primaryActivity(state: HaloState, activities: Activity[]): Activity {
  const overridden = state.override && activities.find((a) => a.id === state.override);
  return (
    overridden ??
    activities[0] ?? {
      id: 'battery',
      kind: 'battery',
      tier: 5,
      band: 'Passive system info',
    }
  );
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
