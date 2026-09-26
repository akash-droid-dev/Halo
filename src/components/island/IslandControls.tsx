import { CloseIcon, PinIcon } from '../primitives/Icon';

interface IslandControlsProps {
  pinned: boolean;
  onTogglePin: () => void;
  onClose: () => void;
}

/**
 * Pin and close, in the right shoulder. A pinned panel ignores outside clicks
 * and Escape, so unpinning is the only way out of it.
 */
export function IslandControls({ pinned, onTogglePin, onClose }: IslandControlsProps) {
  const pinLabel = pinned ? 'Unpin panel' : 'Keep panel open';

  return (
    <div className="island-controls">
      <button
        type="button"
        className="island-controls__button"
        data-active={pinned}
        title={`${pinLabel} (⌘P)`}
        aria-label={pinLabel}
        aria-pressed={pinned}
        onClick={onTogglePin}
      >
        <PinIcon size={13} />
      </button>
      <button
        type="button"
        className="island-controls__button"
        title="Close (Escape)"
        aria-label="Close panel"
        onClick={onClose}
      >
        <CloseIcon size={12} />
      </button>
    </div>
  );
}
