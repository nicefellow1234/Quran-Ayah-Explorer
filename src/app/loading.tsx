export default function Loading() {
  return (
    <main className="shell loading-page" aria-label="Loading">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-copy" />
      <div className="skeleton-grid">
        {Array.from({ length: 8 }, (_, index) => <div className="skeleton skeleton-card" key={index} />)}
      </div>
    </main>
  );
}
