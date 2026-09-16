# Ayah Explorer

Ayah Explorer is a focused, full-stack Quran study application for reading the complete Quran with Arabic text, English and Urdu translations, tafsir, and verse recitation audio. It is built with Next.js and the official Quran.Foundation JavaScript SDK.

The interface is designed around a calm, content-first reading experience: Arabic remains prominent, translations follow the correct language direction, and study controls stay close to the ayah they affect.

Repository: <https://github.com/nicefellow1234/Quran-Ayah-Explorer>

## Highlights

- Complete directory of all 114 Surahs with searchable filtering.
- Quran.com-style Surah name icons in the directory, selector, and reader header.
- Searchable Surah and ayah picker with keyboard support, Surah icon previews, +/- controls, and a range slider.
- Header Quran navigator with `Ctrl K` access, reference validation, and shortcuts to popular Surahs and ayahs.
- Stable deep links for individual ayahs, for example `/ayah/2:255`.
- Full Surah reader at `/surah/[chapterId]` with lazy loading as the reader approaches the end of the loaded content.
- Reader mode toggle with an Arabic-first Mushaf layout, Surah identity card, Listen/Info controls, Arabic/Translation tabs, waqf marks, numbered ayah medallions, and timed word highlighting; it opens on Arabic without showing translations or tafsir controls.
- Light, dark, and System appearance modes with a persistent header switcher; System is selected by default and follows the device color scheme.
- Arabic Quran text rendered with the IndoPak font and right-to-left layout.
- English and Urdu translations, including Urdu RTL layout and Mehr Nastaliq typography.
- Multiple translations can be added at the same time, with English and Urdu selected by default.
- Translation selection and ordering are persisted in the browser and represented as ordered repeated `translation` URL parameters.
- Tafsir resource selector in an accessible side panel on desktop and bottom sheet on mobile.
- Safe rendering of Quran Foundation footnote markup and sanitized tafsir HTML.
- Recitation audio with reciter selection, play/pause, previous/next ayah, duration seek bar, and persisted reciter preference.
- Word-level Arabic highlighting follows the active reciter’s timed audio segments during playback.
- The reciter selector checks the active ayah and only lists Qaris with available audio; changing Qari stops the current audio and restarts that ayah from the beginning.
- Optional “Auto-play all” mode, disabled by default, that advances through the current Surah and smoothly scrolls the playing ayah into view.
- Responsive design, reduced-motion support, keyboard-accessible controls, loading states, and user-safe error states.
- Privacy policy and terms pages at `/privacy` and `/terms` for deployment configuration.

## Complete functionality reference

### Home and navigation

- Centered hero section with the project identity and a compact Surah/ayah finder.
- Searchable Surah combobox that accepts a Surah name, transliteration, English meaning, or number.
- Quran.com-style Surah icon shown in the search results and selected-destination preview.
- Keyboard navigation for the Surah picker with arrow keys, Enter to select, and Escape to close.
- Ayah stepper with previous/next buttons and a draggable range slider from ayah 1 to the selected Surah’s final ayah.
- Live selected-destination preview showing the Surah icon, name, translation, revelation place, and `chapter:ayah` reference.
- One-click actions to open the selected ayah or read the complete Surah.
- Complete 114-Surah directory with name/number filtering, translated name, ayah count, revelation place, and chapter links.
- Compact header jump form for direct Surah or ayah navigation, including references such as `2:255`.
- Previous/next ayah navigation on individual ayah pages.
- Previous/next Surah navigation on complete Surah pages.

### Reading experience

- Individual ayah route with the Surah header, English Surah name, Surah icon, translated name, and total ayah count.
- Complete Surah route with the same header treatment plus Bismillah divider when supplied by the API.
- Quranic Arabic rendered with the IndoPak font, `lang="ar"`, and right-to-left direction.
- English translation displayed below the Arabic text with the translation language and resource label.
- Urdu translation displayed in right-to-left Mehr Nastaliq typography with an Urdu-language label.
- Translation footnote markup from Quran Foundation rendered as styled superscript numbers instead of raw HTML.
- Verse actions for playing audio, opening tafsir, copying the ayah, and sharing the ayah link.
- Copy action includes Arabic, available translations, and the Quran reference.
- Share action uses the native share dialog when available and falls back to copying the ayah URL.
- Toast/status feedback after a successful copy action.
- Reading Settings supports any number of available translations at the same time.
- English is followed by Urdu by default when no translation preference is present.
- Translations can be searched by language, resource name, or author and added without replacing existing selections.
- Selected translations are displayed in an explicit order under each ayah.
- Selected translations can be reordered by dragging the row or using accessible up/down controls.
- Any selected translation can be removed, with at least one translation retained for a useful reading state.
- The ordered selection is represented by repeated `translation` query parameters for shareable URLs.
- Translation order is preserved through server fetching, caching, lazy-loaded verse pages, and client rendering.
- Translation preferences persist locally for return visits, including migration from the previous single-translation preference.

### Full Surah loading

- Initial Surah content is fetched in a page rather than making one request per ayah.
- Additional ayah pages load automatically as the reader approaches the bottom of the loaded content.
- Loading, retry, and end-of-Surah states are shown in the reader.
- Autoplay can request additional lazy-loaded pages until the next playing ayah is available in the document.
- Autoplay scrolls the active ayah smoothly into a centered viewport position.

### Tafsir and reflections

- Tafsir opens from the individual verse action without navigating away from the reader.
- Tafsir resources are grouped by language in a custom dropdown.
- Tafsir resources can be searched by resource name, author, or language.
- Selected tafsir is highlighted and can be changed with mouse, keyboard, or touch.
- Resource groups show language names and resource counts.
- English, Arabic, Urdu, Bengali, Kurdish, Russian, and Swahili resource directions are recognized where provided by the API.
- Arabic tafsir uses IndoPak and right-to-left formatting.
- Urdu tafsir uses Mehr Nastaliq and right-to-left formatting.
- Tafsir headings, paragraphs, lists, blockquotes, links, inline Arabic, and Arabic blocks receive language-aware formatting.
- Tafsir opens as a side panel on desktop and a bottom sheet on small screens.
- Tafsir content is sanitized through an allowlist before being rendered.

### Audio and tilawat

- Persistent audio dock appears after an ayah is selected for playback.
- Play/pause control with loading and unavailable states.
- Previous and next ayah controls based on the current page’s complete audio queue.
- Reciter dropdown with the user’s saved preference.
- Mishary Rashid Alafasy is preferred as the default Qari when that resource is available; common spelling variants are supported.
- Changing the Qari immediately reloads and plays the current ayah with the newly selected reciter.
- Seek bar with current time, total duration, disabled state while duration is unavailable, and progress styling.
- “Auto-play all” switch is off by default and continues through the current Surah when enabled.
- Auto-play follows the complete Surah queue, including ayahs not yet rendered on screen.
- User-selected reciter and translation preferences persist in local storage.

### UI, accessibility, and resilience

- Responsive layouts for desktop, tablet, and mobile widths.
- Mobile audio dock reorganizes into stacked controls while preserving seek and reciter controls.
- Mobile tafsir changes from a side panel to a bottom sheet.
- Visible keyboard focus states and keyboard support for custom dropdowns.
- Semantic links, buttons, headings, labels, dialogs, listboxes, and status regions.
- Accessible names for icon-only verse and audio controls.
- RTL and language attributes applied to Arabic and Urdu content.
- Reduced-motion preference disables non-essential smooth scrolling and animation.
- Dedicated loading page and inline loading indicators.
- Setup state when server credentials are not configured.
- Not-found state for invalid Surah and ayah references.
- Safe user-facing error states for API, audio, verse, and tafsir failures.
- No database is required for public reading, and no analytics or account is required for the core flow.

## Product flow

1. Open the home page and search for a Surah by name, transliteration, or number.
2. Choose an ayah using the stepper or slider.
3. Open the individual ayah or read the complete Surah.
4. From any verse, play audio, choose a reciter, seek within the recitation, copy/share the ayah, or open tafsir.
5. On a Surah page, enable “Auto-play all” if the complete recitation should continue from ayah to ayah. It remains off by default.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Centered landing page, Surah directory, and Surah/ayah picker |
| `/surah/[chapterId]` | Full Surah reader with lazy-loaded ayahs |
| `/ayah/[verseKey]` | Individual ayah reader, such as `/ayah/2:10` |
| `/privacy` | Privacy policy page |
| `/terms` | Terms of service page |
| `/api/verses` | Same-origin paginated verse endpoint used by the reader |
| `/api/audio` | Same-origin lazy audio URL endpoint |
| `/api/tafsir` | Same-origin lazy tafsir endpoint |

`verseKey` uses the Quran reference format `chapter:ayah`, such as `1:7` or `36:58`.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript with strict checking
- `@quranjs/api` server SDK
- Server Components for Quran content and resource loading
- Client Components for search, settings, tafsir, audio, and verse actions
- Lucide React icons
- Vitest for unit tests
- Playwright for end-to-end smoke tests
- `sanitize-html` for translation/tafsir markup boundaries

## Architecture

```text
Browser
  |
  v
Next.js App Router
  |
  +--> Server pages: home, Surah, ayah, privacy, terms
  |
  +--> Same-origin route handlers: verses, audio, tafsir
  |
  v
src/lib/quran adapter layer
  |
  v
Quran.Foundation SDK (@quranjs/api/server)
  |
  v
Quran.Foundation Content APIs
```

The Quran Foundation client is server-only. `QF_CLIENT_SECRET` is read only by the server adapter and is never imported into client components or exposed as a public environment variable. Browser code calls the app’s same-origin endpoints for lazy audio, tafsir, and additional verse pages.

### Main source areas

```text
src/
├── app/                         Next.js routes, layouts, loading/error states
│   ├── api/audio/                Audio URL route handler
│   ├── api/tafsir/               Tafsir route handler
│   ├── api/verses/               Paginated verse route handler
│   ├── ayah/[verseKey]/          Individual ayah page
│   └── surah/[chapterId]/        Full Surah page
├── components/
│   ├── audio/                    Audio player and autoplay behavior
│   ├── navigation/               Jump form and Surah/ayah picker
│   ├── quran/                    Directory, verse cards, reader, tafsir
│   └── settings/                 Translation settings dialog
└── lib/quran/
    ├── client.ts                 Server-only Quran Foundation client
    ├── chapters.ts               Chapter retrieval and caching
    ├── verses.ts                 Verse retrieval and view-model mapping
    ├── resources.ts              Translation, tafsir, and reciter catalogs
    ├── audio.ts                  Verse audio adapter
    ├── validation.ts             Chapter, verse, and jump validation
    └── translation-markup.ts     Safe translation footnote markup handling
```

## Quran Foundation configuration

Create an application in the [Quran.Foundation Developer Console](https://developers.quran.foundation/) and obtain a server client ID and secret. Copy the example environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Then fill in `.env.local`:

```env
# Server-only Quran.Foundation credentials
QF_CLIENT_ID=your-client-id
QF_CLIENT_SECRET=your-client-secret

# Keep both URLs in the same environment as the credentials.
# Pre-live defaults:
QF_GATEWAY_URL=https://apis-prelive.quran.foundation
QF_OAUTH2_URL=https://prelive-oauth2.quran.foundation
```

For production credentials, use the production gateway and OAuth URLs supplied by the Developer Console. Do not mix pre-live credentials with production endpoints or production credentials with pre-live endpoints. The exact service URLs can change with Quran Foundation account configuration, so use the values shown for the selected environment in the console.

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `QF_CLIENT_ID` | Yes | Quran Foundation server application client ID |
| `QF_CLIENT_SECRET` | Yes | Quran Foundation server application secret |
| `QF_GATEWAY_URL` | Yes in deployment | Content API gateway matching the credential environment |
| `QF_OAUTH2_URL` | Yes in deployment | OAuth2 service matching the credential environment |

`.env.local` is ignored by Git. Never commit credentials, paste them into client-side code, or expose them through a `NEXT_PUBLIC_*` variable.

### Developer Console URLs

When the provider asks for public policy URLs, local development URLs are useful for local testing only:

```text
Privacy policy: http://localhost:3000/privacy
Terms of service: http://localhost:3000/terms
```

For a deployed application, configure the corresponding public HTTPS URLs on your real domain. Provider consoles generally reject localhost or non-HTTPS URLs for production app registration.

## Getting started

### Requirements

- Node.js 20 or newer recommended
- npm
- A Quran Foundation Developer Console application for live Quran content

### Install and run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

The application also renders a configuration state when credentials are absent, so the UI and basic navigation can be inspected before API access is configured.

### Production run locally

```bash
npm run build
npm run start
```

The production server uses the environment variables present when `next build` and `next start` run.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright browser smoke tests |

Run the full local quality check with:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Data and caching

- Chapter metadata for all 114 Surahs is cached with Next.js revalidation.
- Resource catalogs for translations, tafsir, and reciters are cached and reused.
- Full Surah content is loaded in pages rather than one upstream request per ayah.
- Additional verse pages are requested when the reader approaches the lazy-loading sentinel.
- Audio and tafsir are requested only when the user plays audio or opens tafsir.
- Translation and reciter choices are stored locally for a smoother return visit.

The app intentionally does not require a database for the public reading experience.

## Internationalization and typography

The reading surface distinguishes content language and direction:

- Quranic Arabic uses `lang="ar"`, `dir="rtl"`, and the IndoPak font.
- Urdu translations use `lang="ur"`, `dir="rtl"`, right alignment, and Mehr Nastaliq.
- English translations remain left-to-right with readable serif typography.
- Tafsir direction and typography are selected from the resource language.
- Quran.com’s Surah-name font is loaded for chapter icons.

The fonts are loaded through `@font-face` in `src/app/globals.css`. Production deployments should ensure the configured font hosts remain reachable, or self-host the approved font files if the project’s distribution and provider terms allow it.

## Audio behavior

The audio player is shared across the reader and individual ayah pages. It supports:

- Current ayah display
- Play/pause and previous/next controls
- Reciter switching, including replaying the current ayah with the newly selected reciter
- Seek bar with current time and total duration
- “Auto-play all” toggle, off by default
- Smooth scrolling to the active ayah while autoplay advances

Audio URLs are resolved through `/api/audio`, which keeps the upstream request behind the application boundary.

## Security and content handling

- Quran Foundation credentials stay on the server.
- API errors are normalized into user-safe messages and logged without authorization headers.
- Chapter, verse, and resource IDs are validated before upstream requests.
- Translation footnote markup is normalized into safe superscripts.
- Tafsir content is sanitized with an allowlist before it is inserted into the tafsir panel.
- Copy/share actions use browser APIs and do not send user content to a third-party analytics service.

## Testing strategy

Vitest covers validation and markup behavior, including:

- Verse-key parsing
- Numeric and verse-key jump input
- Invalid chapter/ayah boundaries
- Safe Quran Foundation footnote rendering

Playwright covers the most important navigation states:

- Home page configuration/live state
- Invalid Surah route handling
- Encoded ayah URLs reaching the reader route

The E2E suite is intentionally deterministic and can run without live API credentials. For API-backed browser testing, use test credentials or mocked adapter fixtures rather than committing secrets.

## Deployment

The app can be deployed to Vercel or another Node.js platform that supports Next.js.

1. Configure the four Quran Foundation environment variables in the platform’s server environment.
2. Make sure the gateway and OAuth URLs match the credential environment.
3. Configure the production HTTPS privacy and terms URLs in the provider console.
4. Run the build in the deployment environment:

   ```bash
   npm run build
   ```

5. Start using the platform’s Next.js adapter or:

   ```bash
   npm run start
   ```

No database migration is required. If the app is deployed across multiple instances, use platform caching or a shared cache strategy if upstream resource requests become a concern.

## Troubleshooting

### The home page shows a setup message

Check that `.env.local` exists, all four variables are present, and the development server was restarted after changing environment variables. Next.js reads server environment values when the server starts/builds.

### Quran data fails to load

Confirm that the client ID, secret, gateway URL, and OAuth URL all belong to the same Quran Foundation environment. Also verify that the application has access to the Content API resources it requests.

### A translation or tafsir is unavailable

Resource availability depends on the selected Quran Foundation resource and its permissions. Open Settings to select another translation or use the tafsir resource selector when more than one resource is available.

### Fonts do not appear immediately

The Quranic Arabic, Urdu, and Surah-name fonts are remote assets. Check browser network access and allow the configured font origins. The app waits for font readiness before showing Surah-name icon glyphs.

### Audio does not play

Check browser autoplay policy, confirm a user gesture was used to start playback, and verify that the selected reciter has audio for the ayah. The player exposes loading and unavailable states rather than silently failing.

## Project decisions and future work

The current project deliberately keeps authentication, bookmarks, notes, offline storage, analytics, and semantic Search API integration outside the core reader. Those features require additional product, permission, privacy, and content-licensing decisions.

Potential next steps include:

- OAuth-backed personal study tools
- Bookmarks and notes with a privacy-conscious data store
- Search when the required Quran Foundation permissions are available
- Visual regression coverage for Arabic and Urdu font/platform combinations
- Deployment monitoring for upstream latency and API errors
- Consent-aware analytics, if needed
- PWA or offline support after confirming provider terms

See [`docs/technical-report.md`](docs/technical-report.md) for the engineering rationale behind the architecture, caching, accessibility, and scope decisions.

## License and content attribution

This repository does not currently define a separate project license file. Quran text, translations, tafsir, audio, fonts, and other content remain subject to their respective providers’ licenses and terms. Review Quran Foundation Developer Terms and the terms for each selected resource before redistributing content or enabling offline storage.
