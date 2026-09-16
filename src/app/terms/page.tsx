import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using the Ayah Explorer Quran reading application.",
};

export default function TermsPage() {
  return (
    <main className="shell legal-page">
      <Link href="/" className="legal-back">← Back to Ayah Explorer</Link>
      <p className="eyebrow">Ayah Explorer</p>
      <h1>Terms of Service</h1>
      <p className="legal-updated">Last updated: September 16, 2026</p>

      <section className="legal-content">
        <h2>Use of the service</h2>
        <p>Ayah Explorer provides a reading and study interface for Quran content supplied by Quran.Foundation. You may use it for lawful personal, educational, and non-commercial purposes, subject to the applicable content and service terms.</p>

        <h2>Content and attribution</h2>
        <p>Quran text, translations, tafsir, and recitation audio remain subject to their respective rights, licenses, and attribution requirements. Do not redistribute or commercially reuse content unless the applicable rights holder permits it.</p>

        <h2>Availability</h2>
        <p>The service is provided as available. Upstream API outages, maintenance, network failures, or changes in resource availability may affect the reader. No guarantee is made that every resource will always be available.</p>

        <h2>Respectful use</h2>
        <p>Please use the service respectfully and do not attempt to abuse, overload, bypass access controls, or interfere with the application or Quran.Foundation services.</p>

        <h2>Changes</h2>
        <p>These terms may be updated as the application evolves. The effective date above indicates the latest revision.</p>
      </section>
    </main>
  );
}
