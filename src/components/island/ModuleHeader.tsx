interface ModuleHeaderProps {
  title: string;
  /** Marks modules whose data is seeded rather than read from the system. */
  showDemoBadge: boolean;
}

/**
 * The module title and its provenance chip. Its height is fixed so the body
 * does not shift when the module changes underneath it — module switches keep
 * the header in place and animate only the body.
 */
export function ModuleHeader({ title, showDemoBadge }: ModuleHeaderProps) {
  return (
    <div className="module-header">
      <h2 className="module-header__title" style={{ margin: 0 }}>
        {title}
      </h2>
      <div style={{ flex: 1 }} />
      {showDemoBadge && <span className="badge">Demo data</span>}
    </div>
  );
}
