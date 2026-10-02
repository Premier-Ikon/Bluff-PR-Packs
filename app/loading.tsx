export default function Loading() {
  return (
    <main className="page">
      <div className="page-loader" role="status" aria-live="polite" aria-label="Loading">
        <div className="page-loader-mark" aria-hidden>
          <span />
        </div>
        <p>Loading</p>
      </div>
    </main>
  );
}
