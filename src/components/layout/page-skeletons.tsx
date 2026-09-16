function SkeletonBar({ className }: { className: string }) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />;
}

function SkeletonSiteHeader({ readerMode = false }: { readerMode?: boolean }) {
  return (
    <header className="site-header skeleton-site-header" aria-hidden="true">
      <div className="shell header-inner">
        <div className="skeleton-site-brand"><SkeletonBar className="skeleton-brand-mark" /><SkeletonBar className="skeleton-brand-name" /></div>
        <div className="skeleton-site-tools">{Array.from({ length: readerMode ? 4 : 2 }, (_, index) => <SkeletonBar className="skeleton-header-action" key={index} />)}</div>
      </div>
    </header>
  );
}

function SkeletonHeader({ ayah = false }: { ayah?: boolean }) {
  return (
    <>
      <SkeletonBar className="skeleton-breadcrumbs" />
      <header className={`reader-header skeleton-reader-header${ayah ? " ayah-header" : ""}`}>
        <div className="skeleton-reader-copy">
          <SkeletonBar className="skeleton-reader-eyebrow" />
          <SkeletonBar className="skeleton-reader-title" />
          <SkeletonBar className="skeleton-reader-subtitle" />
        </div>
        <SkeletonBar className="skeleton-reader-icon" />
      </header>
    </>
  );
}

function SkeletonVerse({ compact = false }: { compact?: boolean }) {
  return (
    <article className={`skeleton-verse-card${compact ? " skeleton-verse-card-compact" : ""}`} aria-hidden="true">
      <div className="skeleton-verse-topline">
        <SkeletonBar className="skeleton-verse-key" />
        <div className="skeleton-verse-actions"><SkeletonBar className="skeleton-icon-button" /><SkeletonBar className="skeleton-icon-button" /><SkeletonBar className="skeleton-icon-button" /></div>
      </div>
      <div className="skeleton-arabic-lines">
        <SkeletonBar className="skeleton-arabic-line skeleton-arabic-line-long" />
        <SkeletonBar className="skeleton-arabic-line skeleton-arabic-line-medium" />
      </div>
      {!compact ? (
        <div className="skeleton-translation-lines">
          <SkeletonBar className="skeleton-translation-line skeleton-translation-line-long" />
          <SkeletonBar className="skeleton-translation-line skeleton-translation-line-medium" />
          <SkeletonBar className="skeleton-translation-line skeleton-translation-line-short" />
        </div>
      ) : null}
    </article>
  );
}

export function HomePageSkeleton() {
  return (
    <>
      <SkeletonSiteHeader />
      <main>
        <section className="hero shell loading-home-page" aria-label="Loading home page">
          <div className="loading-home-copy">
            <SkeletonBar className="skeleton-home-eyebrow" />
            <SkeletonBar className="skeleton-home-title" />
            <SkeletonBar className="skeleton-home-subtitle" />
            <SkeletonBar className="skeleton-home-picker" />
            <div className="skeleton-home-highlights"><SkeletonBar className="skeleton-home-stat" /><SkeletonBar className="skeleton-home-stat" /><SkeletonBar className="skeleton-home-stat" /><SkeletonBar className="skeleton-home-stat" /></div>
          </div>
        </section>
        <section className="shell home-content loading-home-directory" aria-label="Loading Surah directory">
          <div className="skeleton-directory-heading"><SkeletonBar className="skeleton-directory-title" /><SkeletonBar className="skeleton-directory-search" /></div>
          <div className="skeleton-directory-grid">
            {Array.from({ length: 6 }, (_, index) => <SkeletonBar className="skeleton-directory-card" key={index} />)}
          </div>
        </section>
      </main>
    </>
  );
}

export function SurahPageSkeleton() {
  return (
    <>
      <SkeletonSiteHeader readerMode />
      <main className="shell reader-page loading-reader-page" aria-label="Loading Surah">
        <SkeletonHeader />
        <SkeletonBar className="skeleton-bismillah" />
        <div className="verse-list skeleton-verse-list">
          <SkeletonVerse />
          <SkeletonVerse />
          <SkeletonVerse />
        </div>
        <nav className="reader-navigation skeleton-reader-navigation" aria-label="Loading Surah navigation">
          <SkeletonBar className="skeleton-navigation-button" />
          <SkeletonBar className="skeleton-navigation-button" />
        </nav>
      </main>
    </>
  );
}

export function AyahPageSkeleton() {
  return (
    <>
      <SkeletonSiteHeader readerMode />
      <main className="shell reader-page ayah-page loading-reader-page" aria-label="Loading ayah">
        <SkeletonHeader ayah />
        <div className="verse-list skeleton-verse-list skeleton-ayah-list"><SkeletonVerse /></div>
        <nav className="reader-navigation ayah-navigation skeleton-reader-navigation" aria-label="Loading ayah navigation">
          <SkeletonBar className="skeleton-navigation-button" />
          <SkeletonBar className="skeleton-navigation-button" />
          <SkeletonBar className="skeleton-navigation-button" />
        </nav>
      </main>
    </>
  );
}

export function LegalPageSkeleton() {
  return (
    <main className="shell legal-page loading-legal-page" aria-label="Loading page">
      <SkeletonBar className="skeleton-legal-back" />
      <SkeletonBar className="skeleton-legal-eyebrow" />
      <SkeletonBar className="skeleton-legal-title" />
      <SkeletonBar className="skeleton-legal-date" />
      <section className="legal-content skeleton-legal-content">
        <SkeletonBar className="skeleton-legal-heading" />
        <SkeletonBar className="skeleton-legal-line skeleton-legal-line-long" />
        <SkeletonBar className="skeleton-legal-line skeleton-legal-line-long" />
        <SkeletonBar className="skeleton-legal-line skeleton-legal-line-medium" />
        <SkeletonBar className="skeleton-legal-heading skeleton-legal-heading-spaced" />
        <SkeletonBar className="skeleton-legal-line skeleton-legal-line-long" />
        <SkeletonBar className="skeleton-legal-line skeleton-legal-line-medium" />
      </section>
    </main>
  );
}
