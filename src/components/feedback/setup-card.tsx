import Link from "next/link";

export function SetupCard({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`setup-card ${compact ? "setup-card-compact" : ""}`} aria-labelledby="setup-title">
      <p className="eyebrow">One small setup step</p>
      <h2 id="setup-title">Connect Quran.Foundation to begin</h2>
      <p>
        Add your server-side API credentials to <code>.env.local</code>, then restart the development server. Ayah Explorer never sends the client secret to the browser.
      </p>
      <Link className="button button-primary" href="https://api-docs.quran.foundation/" target="_blank" rel="noreferrer">
        Open API documentation
      </Link>
    </section>
  );
}
