"use client";

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="page-loader-mark" aria-hidden>
        <span />
      </div>
      <p>{label}</p>
    </div>
  );
}

export function CatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <section className="grid catalog-skeleton" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-image shimmer" />
          <div className="skeleton-line shimmer" />
          <div className="skeleton-line short shimmer" />
        </div>
      ))}
    </section>
  );
}

export function ProductSkeleton() {
  return (
    <div className="product-skeleton" aria-hidden>
      <div className="skeleton-image tall shimmer" />
      <div className="product-skeleton-copy">
        <div className="skeleton-line short shimmer" />
        <div className="skeleton-line title shimmer" />
        <div className="skeleton-line shimmer" />
        <div className="skeleton-line shimmer" />
        <div className="skeleton-chips">
          <span className="shimmer" />
          <span className="shimmer" />
          <span className="shimmer" />
          <span className="shimmer" />
        </div>
        <div className="skeleton-button shimmer" />
      </div>
    </div>
  );
}
