"use client";

import { RefreshCw } from "lucide-react";

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="center-state">
      <p className="eyebrow">A moment of pause</p>
      <h1>We couldn’t load this page.</h1>
      <p>There may be a temporary issue reaching Quran.Foundation. Please try again.</p>
      <button className="button button-primary" type="button" onClick={() => reset()}><RefreshCw size={16} aria-hidden="true" /> Try again</button>
    </main>
  );
}
