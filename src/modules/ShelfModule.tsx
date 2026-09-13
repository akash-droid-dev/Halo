import { EXT_TINTS, EXT_TINT_FALLBACK } from '../state/constants';
import { fileExt, fileExtRaw, shortId } from '../lib/format';
import { useHalo, useHaloApi } from '../state/context';
import { EmptyState } from '../components/primitives/EmptyState';
import { RevealIcon, ShareIcon, CloseIcon, UploadIcon } from '../components/primitives/Icon';

/**
 * Files held for later. The shelf stores references only — removing an entry
 * never touches the original file, which the copy says explicitly.
 */
export function ShelfModule() {
  const { state } = useHalo();
  const { dispatch, toast } = useHaloApi();

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    const files = dropped.length
      ? dropped.map((file) => ({
          id: shortId('f'),
          name: file.name,
          size: `${(file.size / 1_048_576).toFixed(1)} MB`,
          kind: file.type || 'File',
        }))
      : [{ id: shortId('f'), name: 'dropped-item.pdf', size: '0.8 MB', kind: 'PDF document' }];

    dispatch({ type: 'shelfAdd', files });
    toast(
      `${files.length} ${files.length === 1 ? 'file' : 'files'} added to the shelf`,
      dropped.length ? 'Executed by prototype' : 'Simulated drop',
      '#FFD426',
    );
  };

  return (
    <div className="module-stack module-stack--tight">
      <div
        className="dropzone"
        data-hot={state.shelfHot}
        onDragOver={(event) => {
          event.preventDefault();
          if (!state.shelfHot) dispatch({ type: 'shelfHot', value: true });
        }}
        onDragLeave={() => dispatch({ type: 'shelfHot', value: false })}
        onDrop={onDrop}
      >
        <span style={{ color: 'rgba(255,255,255,.55)', display: 'flex' }}>
          <UploadIcon size={17} />
        </span>
        {state.shelfHot
          ? 'Release to add to the shelf'
          : 'Drag files here — originals stay where they are'}
      </div>

      {state.shelf.map((file) => (
        <div
          key={file.id}
          className="shelf-item"
          draggable
          onDragStart={(event) => {
            try {
              event.dataTransfer.setData('text/plain', file.name);
            } catch {
              // Some browsers refuse setData outside a trusted drag; harmless.
            }
          }}
          style={
            {
              '--tile-tint': EXT_TINTS[fileExtRaw(file.name)] ?? EXT_TINT_FALLBACK,
            } as React.CSSProperties
          }
        >
          <span className="shelf-item__tile" aria-hidden>
            {fileExt(file.name)}
          </span>
          <div className="stack" style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <div className="shelf-item__name truncate">{file.name}</div>
            <div className="shelf-item__meta">
              {file.kind} — {file.size}
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            title="Reveal in Finder"
            aria-label={`Reveal ${file.name} in Finder`}
            onClick={() =>
              toast(`Revealed ${file.name} in Finder`, 'Simulated system action', '#BF5AF2')
            }
          >
            <RevealIcon size={13} />
          </button>
          <button
            type="button"
            className="icon-btn"
            title="Share (AirDrop, Mail, Messages)"
            aria-label={`Share ${file.name}`}
            onClick={() =>
              toast(
                `Opened the macOS share sheet for ${file.name}`,
                'Simulated system action',
                '#BF5AF2',
              )
            }
          >
            <ShareIcon size={13} />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--danger"
            title="Remove from shelf — the original file is not deleted"
            aria-label={`Remove ${file.name} from shelf`}
            onClick={() => {
              dispatch({ type: 'shelfRemove', id: file.id });
              toast(
                `Removed ${file.name} from the shelf — the original file is untouched`,
                'Executed by prototype',
                '#FFD426',
              );
            }}
          >
            <CloseIcon size={12} />
          </button>
        </div>
      ))}

      {state.shelf.length === 0 ? (
        <EmptyState line="The shelf is empty. Files you drop here stay until you remove them; originals are never moved." />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn btn--quiet btn--small"
            onClick={() => {
              dispatch({ type: 'shelfClear' });
              toast('Shelf cleared — no files were deleted', 'Executed by prototype', '#FFD426');
            }}
          >
            Clear shelf
          </button>
          <p className="note" style={{ margin: 0 }}>
            Clearing removes references only. Use Finder to delete originals.
          </p>
        </div>
      )}
    </div>
  );
}
