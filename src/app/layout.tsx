import type { Metadata } from "next";

import { AudioPlayerProvider } from "@/components/audio/audio-player";
import { FontReadiness } from "@/components/layout/font-readiness";

import "./globals.css";

const themeInitializationScript = `
  (function () {
    var preference = "system";
    try {
      var stored = window.localStorage.getItem("ayah-explorer.theme");
      if (stored === "light" || stored === "dark" || stored === "system") preference = stored;
    } catch (error) {}
    var resolved = preference === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : preference;
    var root = document.documentElement;
    root.dataset.theme = resolved;
    root.dataset.themePreference = preference;
    root.style.colorScheme = resolved;
  })();
`;

export const metadata: Metadata = {
  title: { default: "Ayah Explorer — Explore the Quran", template: "%s — Ayah Explorer" },
  description: "Read, listen and reflect with translation and tafsir from Quran.Foundation.",
  openGraph: { title: "Ayah Explorer — Explore the Quran", description: "Read, listen and reflect with translation and tafsir.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><head>
    <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
    <meta name="google" content="notranslate" />
    <link rel="preconnect" href="https://verses.quran.foundation" crossOrigin="anonymous" />
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
    <link rel="preconnect" href="https://quran.com" crossOrigin="anonymous" />
    <link rel="preload" href="https://verses.quran.foundation/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="https://cdn.jsdelivr.net/gh/tariq-abdullah/urdu-web-font-CDN/MehrNastaleeq.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
    <link rel="preload" href="https://quran.com/fonts/quran/surah-names/v1/sura_names.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  </head><body><FontReadiness /><AudioPlayerProvider>{children}</AudioPlayerProvider></body></html>;
}
