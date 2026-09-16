# Ayah Explorer — Technical Assessment Report

## 1. Overview

Ayah Explorer is a small Quran study application for browsing the 114 Surahs, reading authentic Arabic text with a selected translation, opening tafsir for a specific ayah, and listening to recitation. The interface is intentionally quiet and content-led: the Quran remains the strongest visual element while controls stay close to the relevant ayah.

## 2. Goals

The project is designed to demonstrate practical full-stack engineering judgment: a strict TypeScript boundary around a third-party SDK, server/client separation, cached server rendering, accessible RTL presentation, responsive interaction design, and a useful test surface. The implementation favors a short, reliable critical path over authentication or personalization that would require a broader product scope.

## 3. Architecture

The Next.js App Router provides server-rendered home, Surah, and ayah routes. Server components call a thin adapter in `src/lib/quran` and map SDK responses into small view models before passing them to UI components. Client components are limited to jump navigation, settings, verse actions, tafsir panels, filtering, and audio playback.

`/surah/[chapterId]` retrieves a chapter and its verses in grouped requests. `/ayah/[verseKey]` retrieves one verse and its chapter context. `/api/tafsir` and `/api/audio` are same-origin route handlers used for lazy, user-triggered requests. This keeps secrets and raw Content API calls out of browser bundles.

## 4. Quran.Foundation integration

The app uses `createServerClient` from `@quranjs/api/server`. The SDK receives `QF_CLIENT_ID` and `QF_CLIENT_SECRET` from server environment variables and is configured with the pre-live service URLs by default. The adapter uses the documented v4 helpers for chapters, verses, resource catalogs, verse tafsir, and verse recitation. Translation, tafsir, and chapter-reciter IDs come from resource catalogs rather than unexplained component constants.

Search is not part of the required path because Search API access can require additional Developer Console permission. Reliable numeric and verse-key navigation works without it. Audio uses the verse recitation API, not word-level audio paths. Tafsir HTML is sanitized in the route handler using an allowlist before it reaches the client-rendered panel.

## 5. Performance and sustainability

Chapter metadata and resource catalogs are cached with `unstable_cache` and a one-day revalidation window. Chapter verse responses are cached by chapter and selected translation. This is appropriate for reference content that changes infrequently, while audio and tafsir remain on-demand so an initial reader visit does not download data the user may never use.

The reader avoids one API request per verse by loading a chapter in one request. Server Components render the content and reduce browser JavaScript. Client interaction is split into small components, and there is no Redux store, database, analytics platform, or large UI dependency. The app does not claim a specific environmental saving; the concrete resource decisions are reduced upstream requests, less duplicated transfer, fewer client rerenders, and lazy feature loading.

## 6. Accessibility

Arabic paragraphs use `lang="ar"` and `dir="rtl"`; English translation remains left-to-right. Surahs and navigation are real links, actions are buttons, and icon-only buttons have accessible labels. The search/jump controls expose labels to assistive technology, dialogs use `role="dialog"` and `aria-modal`, and focus-visible styles are maintained throughout. Mobile layouts enlarge interaction targets, move tafsir into a bottom sheet, and keep the audio dock compact. Reduced-motion preferences disable decorative animation.

## 7. Error handling

Server adapter errors are normalized into `QuranApiError` with an operation name and user-safe message. Technical details are logged with the operation only; credentials and authorization headers are never logged. Invalid chapter and verse references are rejected before SDK calls and routed to the not-found UI. Missing credentials produce a clear setup state rather than a blank page. Missing translation, tafsir, and audio resources have explicit empty or unavailable messages.

## 8. Testing

Vitest covers verse-key parsing, jump input validation, and previous/next boundary behavior including Surah transitions. Playwright covers the home configuration state and invalid Surah routing. These tests target the most failure-prone business logic and critical navigation rather than aiming for arbitrary coverage. With valid API credentials, the same architecture can be extended with mocked adapter tests and a small API-backed browser fixture suite.

## 9. Tradeoffs

The app does not add authentication, bookmarks, notes, a database, offline content, or semantic search. Those features are valuable, but each introduces durable product, permissions, privacy, or content-licensing decisions. The core reader is kept stateless except for local translation and reciter preferences. The fallback configuration view makes the repository reviewable without placing credentials in source control.

## 10. What I would do next

For production I would add deployment-level monitoring around adapter latency and upstream failures, shared caching if multiple instances made repeated resource requests, an OAuth-backed personal study area, consent-aware analytics, and a stronger visual regression suite across Arabic font/platform combinations. I would also confirm Developer Terms before adding offline or content redistribution features.
