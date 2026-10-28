# Hyltans Metall Website

Sand-casting foundry in brons och mässing (Gnosjö, est. 1926). Swedish copy, English identifiers.
**Most site copy originates from the real site at hyltansmetall.se** (mainly `/om-foretaget`, `/tillverkningen` and `/specialtillverkning`) — the history, the process steps and the pull-quote are the owner's own words, signed Håkan Abrahamsson. Writing new copy is fine now, but match that register: plain and factual, the owner's voice, not marketing. **Propose any new or rewritten copy in the chat and wait for the owner's approval before editing a file** — never land a wording change unasked, not even a small one.
Vite 4 + React 18 + TS + SCSS modules. Static site, no CMS — content lives in `src/data/*.ts`. No 3D/Three.js — the owner explicitly does not want the GLB model used.

## Commands
- Dev: `npm run dev`
- Build: `npm run build` (tsc && vite build)
- Running a build while the dev server is up kills it on Windows: the watcher holds `dist/models/ljusstake.glb` and Vite exits with `EBUSY`. Restart the server afterwards; nothing is actually broken.

## Navigation and routes
- Four top-level items, two of them with a dropdown. **This no longer mirrors the real site's nav** — it is a deliberate departure, so don't "fix" it back:
  - **Produkter** (`/produkter`) → Änglar, Malmljusstakar, Tomtar
  - **Specialtillverkning** (`/specialtillverkning`)
  - **Gjutprocessen** (`/tillverkning`)
  - **Om oss** (`/om-oss`) → Kontakta oss
- No Start item: the logo links `/` and sits above the mobile overlay, so home is always reachable. The footer stays flat and complete — it is the site index, so pages buried in a dropdown still get a direct link there.
- **The manufacturing page is labelled "Gjutprocessen"** (nav, footer, `h1`, `<title>`) but its URL is still `/tillverkning`, kept so existing links work. The word "Tillverkningen" still appears in body prose in `company.ts`, AboutPage and HomePage — that is the owner's copy, not a label; leave it.
- `isSectionActive` in `Header.tsx` marks a top-level item current. `NavLink`'s own matching only covers nested paths, so it would miss `/kontakt` under Om oss.
- Dropdowns open on `:hover` **and** `:focus-within`, so they are keyboard-reachable with no toggle button. A touch device wide enough for the desktop nav (≥1024px) has no hover and would just follow the parent link — the categories are still reachable from the index and from each page's sibling links.
- URLs stay Swedish-slugged: `/om-oss`, `/tillverkning`, `/produkter/:slug`, `/specialtillverkning`, `/kontakt`. An unknown product slug redirects to `/produkter` with `replace`, leaving no dead history entry.

## Hard SCSS rules (violations have caused real bugs)
- `vite.config.ts` injects `@use 'variables' as v; @use 'mixins' as m;` into **every** SCSS file. Never add those `@use` lines yourself. `src/styles/mixins.scss` must not reference `v.$*` (circular load).
- `generateScopedName: '[local]'` → CSS-module class names are **global**. Every class in every `*.module.scss` must be globally unique: always prefix with the file's block name (`.contact-page__form-input`, never `.inner`, `.form`, `.grid`). Hyphenated names need bracket access in TSX: `styles['about-page__lead']`.
- The `grain()` mixin does not set `position` — the caller must already be positioned.
- `backdrop-filter` creates a containing block for `position: fixed` descendants (this trapped the mobile menu overlay inside the header once). **The header is one solid colour at every scroll position — no blur, no scrolled state.** Don't reintroduce `backdrop-filter` on it: the full-screen `.overlay` would be confined to the header's own box again.
- **`m.focus-ring()` draws the outline 3px *outside* the element, so it is invisible inside anything that clips.** A link filling a card with `overflow: hidden` (`.card__link`) and a full-width dropdown row (`.nav__submenu-link`) both lost their ring entirely — focusable but with no indicator, which looks exactly like not being focusable. Override `outline-offset` to a negative value in those cases.
- Verify focus with **real Tab presses**. Calling `.focus()` from a script does not reliably trigger `:focus-visible` in Chrome and reports no outline at all, which sends you chasing the wrong bug.
- A module class and a global one have equal specificity, so source order decides and the global usually wins. `section.product-category__intro-block` is qualified with the element for exactly this reason — it has to outrank `.block`'s padding.

## Conventions
- BEM inside modules; page sections get a global `<name>-block` class plus `.block` (+ `--alt`/`--paper`/`--dark`) and `.container`/`-sm`/`-xs`. Everything full-width shares one 1200px `$container-width` — including the header's inner bar — so edges line up on large screens. (There was a `-lg`/1440px variant; it was removed for exactly that reason.)
- `src/components/layout/ScrollToTop.tsx` resets scroll on route change (the router otherwise keeps the old position). It deliberately skips `POP` so back/forward restores where the visitor was.
- **Every content page opens with the shared `.page-intro` / `.page-intro__lead` pattern** (in `main.scss`): the `h1` centred with the lead centred beneath it. Use it rather than styling a per-page lead. Kontakta oss has no lead — the real site gives none and we don't invent one.
- There is **no eyebrow label above an `h1`** on a content page; those were removed. The landing page keeps its hero and section labels.
- Section headings carry no `01`/`02`/`03` batch stamps, and product cards carry no `Nr xx` — both removed on request, along with the `Steg xx` stamp. The only numbering left is the outline numeral on manufacturing steps (the process sequence itself) and the slot number on an unphotographed product item. `.batch-stamp` still exists in `main.scss` but nothing uses it.
- Product category pages show a breadcrumb bar as the first thing in `<main>`, which already clears the fixed header. Crumb text uses `$color-ink`: `$color-ink-soft` is 4.44:1 on sand and these are 12px, just under the 4.5:1 AA floor. `$color-bronze` fails too (2.87:1) — hover uses `$color-bronze-deep`.
- All colors/spacing/sizes via tokens in `src/styles/variables.scss`; responsive only via `m.respond-to(sm|md|lg|xl)`, mobile-first.
- Interactive elements get `:focus-visible` via `m.focus-ring($color)` (literal hex args — #B07A2E on light bg, #D9A24B on dark). A global `prefers-reduced-motion` block in `main.scss` collapses all transitions/animations.
- Design system "Sand & Brons": motif classes `.label`, `.molten`, `.ghost-numeral`, `.batch-stamp`, `.btn`/`.btn--ghost`/`.btn--light` in `src/styles/main.scss`. Fonts: Fraunces + Inter (loaded in index.html).
- The hero stays typographic/generative: a hand-rolled canvas ember field (`src/components/common/Hero/EmberField.tsx`, no deps, respects prefers-reduced-motion) + molten glow + ghost numeral. Do not reintroduce Three.js or use `public/models/ljusstake.glb` — the owner explicitly does not want the GLB model.

## Images
- **`src/assets/images/manifest.ts` is generated — never edit it by hand.** It is the only way images enter the app: `import { images } from '@/assets/images/manifest'`, then `images['process/04-gjutning']`. Each entry carries `src`, `srcSet` (several widths), `width`/`height`, and `blur` (a ~20px placeholder inlined as a data URI). Keys are literal-typed, so a typo is a build error.
- Never `import x from '.../foo.webp'` directly and never use `/images/...` URL strings — that bypasses srcset and the placeholder.
- Always render through `src/components/common/Figure/Figure.tsx`: `<Figure image={...} alt="" ratio="landscape" sizes="..." />`. It reserves its box from the ratio, shows the blur *behind* the photo, and lays `grain()` over the top.
- **Never gate the `<img>` behind an opacity/JS "loaded" flag.** An `<img>` with no data is already transparent, so the blur underneath does the placeholder work by itself and the photo paints the instant it decodes. The old version held `.fig__img { opacity: 0 }` until React flipped state, which forced a visible placeholder on *every* image — cached ones included — and would have stranded a photo invisible if a load event were ever missed.
- Pass `priority` for images in view on first paint (sets `loading="eager"` + `fetchpriority="high"`); everything else stays lazy. Currently the first product card, the first manufacturing step and the first item on a category page. Without it the LCP image is fetched late and at low priority. React 18 warns about the camelCase `fetchPriority` prop but does render the attribute — the warning is noise, not a bug.
- Measure loading on the **preview** build (`npm run preview`, port 4173), never `npm run dev`: in dev, Vite requests every image URL module separately (`foo.webp?import`, ~49 extra round-trips) which makes loading look far worse than production, where the same page is 4 requests total. Only `hyltans-dev` exists in `.claude/launch.json`; start preview by hand.
- **Always pass a real `sizes`.** It defaults to `100vw`, which over-fetches badly inside a 3-column grid — the browser picks the candidate before it knows the layout.
- `src/assets/images/inbox/` is the raw dump for unprocessed originals. It is gitignored (repo `.gitignore` + `.git/info/exclude`) and lives in the main checkout, not in worktrees.
- `scripts/process-images.mjs` (dev dep: `sharp`) turns inbox originals into the sorted WebP assets **and rewrites `manifest.ts`**: `INBOX=<path> node scripts/process-images.mjs`. Its `JOBS` table is the source of truth for crop shape and rotation; `SHAPES` defines each ratio's width ladder.
- Widths above the source's own width are skipped so nothing is upscaled, and the source's native width is added as an extra rung when it falls between two — several photos are only ~620px wide once rotated, and the earlier pipeline was silently upscaling them to 1400px.
- **EXIF orientation is not trustworthy in this photo set.** Most files carry `orientation=6`, but a few were cropped by an editor that rotated the pixels and kept the tag, so applying it turns them 90°. The `rotate` flag per job is set from *looking at the output*, not from the tag. Always eyeball regenerated images before committing.
- Three product categories: Änglar, Malmljusstakar, Tomtar — all photographed. Övriga produkter was removed as a category, but **`products/ovrigt` is still in the manifest and still used** — the Specialtillverkning page renders it. `ProductCategory.image` stays optional for future ones; grid rows stretch, so a mixed row would align at the bottom.
- Each category also has `items` (the individual products) in `src/data/products.ts`: one ängel, five tomtar, three malmljusstakar — that last count is a **placeholder guess**. The grid follows the array, so adding or removing a product needs no code change. No item is named or photographed yet; an item with no `image` renders a frame at the same 3/2 ratio `Figure` uses, so dropping a photo in later shifts nothing. Unnamed items fall back to `itemNoun` + index (Tomte 1), since the plural category name read wrong beside a number.
- Jobs may carry `preCrop` ({left,top,width,height} on the source, applied before rotation) for cutting something out of frame that no automatic crop would avoid — `products/ovrigt` uses it to trim a branded bottle off the shelf.
