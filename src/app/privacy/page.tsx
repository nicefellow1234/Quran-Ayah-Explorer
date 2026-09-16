import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ayah Explorer handles information when you use the Quran reader.",
};

export default function PrivacyPage() {
  return (
    <main className="shell legal-page">
      <Link href="/" className="legal-back">← Back to Ayah Explorer</Link>
      <p className="eyebrow">Ayah Explorer</p>
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: September 16, 2026</p>

      <section className="legal-content">
        <h2>What this app does</h2>
        <p>Ayah Explorer is a Quran reading application that displays Quran content, translations, tafsir, and recitation audio provided through Quran.Foundation services.</p>

        <h2>Information we collect</h2>
        <p>The current version does not require an account and does not intentionally collect names, email addresses, location data, or payment information. It does not use advertising or third-party tracking.</p>

        <h2>Information stored on your device</h2>
        <p>Your selected translation and reciter may be stored in your browser&apos;s local storage so the reader can remember your preferences. This information stays on your device and is not sent to Ayah Explorer as an account record.</p>

        <h2>Service providers</h2>
        <p>Quran content requests are served through Quran.Foundation. The app sends server-side API requests using application credentials; it does not expose the client secret to your browser. Quran.Foundation&apos;s own terms and privacy practices may apply to its services.</p>

        <h2>Contact</h2>
        <p>For questions about this policy, contact the project owner through the repository where Ayah Explorer is maintained.</p>
      </section>
    </main>
  );
}
