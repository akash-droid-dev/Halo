import { NOTCH_GUTTER, TITLES, accentFor } from '../../state/constants';
import { useHalo, useHaloApi } from '../../state/context';
import { compactCopy, leadTimer, secondaryLabel, timerRemaining } from '../../state/selectors';
import { DEMO_DATA_SURFACES, MODULE_REGISTRY } from '../../modules';
import { CompactLeft, CompactRight } from './CompactContent';
import { IslandControls } from './IslandControls';
import { ModuleHeader } from './ModuleHeader';
import { ModuleSwitcher } from './ModuleSwitcher';
import { PreviewRow } from './PreviewRow';
import { SecondaryChip } from './SecondaryChip';
import { ShoulderRow } from './ShoulderRow';

/** Circumference of the r=9.5 compact ring. */
const COMPACT_RING = 59.7;

/**
 * The island shell. It owns geometry, radius, shadow, and the shoulder layout;
 * the module inside it is chosen by the registry and knows nothing about the
 * expansion animation.
 */
export function Island({ notched = true }: { notched?: boolean }) {
  const snapshot = useHalo();
  const { state, surface, accent, geometry, isOpen, isPreview, isCompact, secondary } = snapshot;
  const { dispatch, hoverEnter, hoverLeave, open, collapse } = useHaloApi();

  const copy = compactCopy(state, surface, snapshot.mediaPos);
  const Module = MODULE_REGISTRY[surface];

  // A timer or transfer gets a countdown ring in the right shoulder.
  const timer = leadTimer(state);
  const ringSurface = surface === 'timer' || surface === 'download';
  const ringOffset =
    surface === 'timer' && timer
      ? (
          COMPACT_RING * (timer.done ? 0 : timerRemaining(timer, state.now) / timer.durMs)
        ).toFixed(1)
      : surface === 'download'
        ? (() => {
            const transfer =
              state.transfers.find((d) => d.state === 'active') ?? state.transfers[0];
            return (COMPACT_RING * (1 - (transfer?.pct ?? 0))).toFixed(1);
          })()
        : String(COMPACT_RING);

  const playingBars = state.media.playing ? [10, 14, 7, 12] : [4, 4, 4, 4];
  const showBars = surface === 'media' && state.media.connected;

  // The palette owns the whole width, so it drops the compact summary.
  const showCompactLeft = (isCompact || isPreview) && surface !== 'palette';
  const showCompactRight = isCompact || isPreview;
  const showSwitcher = isOpen && snapshot.activities.length > 1 && surface !== 'palette';

  return (
    <div className="island-anchor" data-halo-surface>
      <div
        className={notched ? 'island' : 'island island--notchless'}
        onMouseEnter={hoverEnter}
        onMouseLeave={hoverLeave}
        style={
          {
            width: geometry.width,
            height: geometry.height,
            '--island-radius': `${geometry.radius}px`,
            '--island-shadow':
              isOpen || isPreview ? 'var(--shadow-expanded)' : 'var(--shadow-collapsed)',
            '--accent': accent,
          } as React.CSSProperties
        }
      >
        <span className="island__edge" aria-hidden />

        <ShoulderRow
          inset={isOpen ? 'var(--shoulder-inset-expanded)' : 'var(--shoulder-inset-collapsed)'}
          gutter={notched ? NOTCH_GUTTER : 0}
          left={
            <>
              {state.mode === 'rest' && <span className="island-rest-dot" aria-hidden />}
              {showCompactLeft && (
                <CompactLeft
                  surface={surface}
                  text={copy.left}
                  accent={accent}
                  trackIx={state.trackIx}
                  maxWidth={isCompact ? '82px' : '90px'}
                  onOpen={() => open(surface)}
                />
              )}
            </>
          }
          right={
            <>
              {showCompactRight && (
                <>
                  {secondary && (
                    <SecondaryChip
                      label={secondaryLabel(state, secondary)}
                      color={accentFor(secondary.kind)}
                      title={`Switch to ${TITLES[secondary.id]}`}
                      urgent={secondary.tier <= 2}
                      onSwitch={() => dispatch({ type: 'switchActivity', id: secondary.id })}
                    />
                  )}
                  <CompactRight
                    text={copy.right}
                    accent={accent}
                    ring={ringSurface ? { offset: ringOffset } : undefined}
                    bars={showBars ? playingBars : undefined}
                    onOpen={() => open(surface)}
                  />
                </>
              )}

              {isOpen && (
                <IslandControls
                  pinned={state.pinned}
                  onTogglePin={() => dispatch({ type: 'togglePin' })}
                  onClose={collapse}
                />
              )}
            </>
          }
        />

        {isPreview && <PreviewRow title={copy.title} sub={copy.sub} />}

        {isOpen && (
          <div className="island__panel halo-enter">
            <ModuleHeader
              title={TITLES[surface] ?? 'HALO'}
              showDemoBadge={DEMO_DATA_SURFACES.has(surface)}
            />
            <div className="module-body">
              <Module />
            </div>
          </div>
        )}
      </div>

      {showSwitcher && (
        <ModuleSwitcher
          activities={snapshot.activities}
          current={surface}
          onPick={(id) => dispatch({ type: 'switchActivity', id })}
          onOpenPalette={() => open('palette')}
          onHoverEnter={hoverEnter}
          onHoverLeave={hoverLeave}
        />
      )}
    </div>
  );
}
