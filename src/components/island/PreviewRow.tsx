interface PreviewRowProps {
  title: string;
  sub: string;
}

/** The hover preview: two lines of detail and an affordance hint. */
export function PreviewRow({ title, sub }: PreviewRowProps) {
  return (
    <div className="preview-row halo-enter">
      <div className="stack" style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <div className="preview-row__title truncate">{title}</div>
        <div className="preview-row__sub truncate">{sub}</div>
      </div>
      <div className="preview-row__hint">Click to open</div>
    </div>
  );
}
