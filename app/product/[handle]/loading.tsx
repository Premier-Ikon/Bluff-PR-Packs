export default function Loading() {
  return (
    <main className="page">
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
    </main>
  );
}
