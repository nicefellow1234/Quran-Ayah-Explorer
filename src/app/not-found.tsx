import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="center-state">
      <p className="eyebrow">Not found</p>
      <h1>That ayah or Surah isn’t available.</h1>
      <p>Check the reference and try again, or return to the complete Quran.</p>
      <Link href="/" className="button button-primary"><ArrowLeft size={16} aria-hidden="true" /> Back to the Quran</Link>
    </main>
  );
}
