/**
 * Prerenders every page to static HTML after `vite build`, so search engines,
 * link previews and AI agents get each page's full text and its own head tags
 * without running JavaScript. The browser then hydrates that markup
 * (src/main.tsx) and the site behaves exactly as before.
 *
 * Run by `npm run build` after the client build and the SSR build of
 * src/entry-server.tsx (into dist-ssr/, deleted again at the end).
 *
 * Output, for hosts that serve /om-oss from om-oss.html (Netlify by default,
 * Vercel with cleanUrls):
 *   /                      -> dist/index.html
 *   /om-oss                -> dist/om-oss.html
 *   /produkter/tomtar      -> dist/produkter/tomtar.html
 *   any unknown address    -> dist/404.html (served with status 404)
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

const template = readFileSync(path.join(dist, 'index.html'), 'utf8');
const { render, routes } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);

const SEO_BLOCK = /<!--seo-start-->[\s\S]*?<!--seo-end-->/;
const FONT_PRELOAD = /<!--font-preload[\s\S]*?-->/;

/**
 * Preload the fonts every page paints with first — Fraunces roman (headings)
 * and Inter (body), latin subset — so they download alongside the CSS
 * instead of after it has been parsed. Not the Fraunces italic: it only shows
 * further down (the home quote, the footer) and loads on its own. The hashed
 * names come from the build, so they are looked up here.
 */
const assetNames = readdirSync(path.join(dist, 'assets'));
const preloadFonts = ['fraunces-latin-opsz-normal-', 'inter-latin-wght-normal-'].map((prefix) => {
  const file = assetNames.find((name) => name.startsWith(prefix) && name.endsWith('.woff2'));
  if (!file) {
    console.error(`prerender: no ${prefix}*.woff2 in dist/assets; did the font packages change?`);
    process.exit(1);
  }
  return `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin />`;
});
const ROOT = '<div id="root"></div>';
if (!SEO_BLOCK.test(template) || !FONT_PRELOAD.test(template) || !template.includes(ROOT)) {
  console.error('prerender: dist/index.html lacks the <!--seo-start/end--> or <!--font-preload--> markers, or an empty #root.');
  process.exit(1);
}

/**
 * `prerenderedPath` tells main.tsx which address the markup belongs to; it
 * hydrates only on a match. Left off the 404 page, which is served for every
 * unknown address and so always renders fresh in the browser.
 */
function page(url, prerenderedPath) {
  const { html, head } = render(url);
  if (!head.includes('<title')) {
    throw new Error(`prerender: ${url} rendered no <title>; is <Seo> missing?`);
  }
  const attr = prerenderedPath ? ` data-prerendered-path="${prerenderedPath}"` : '';
  return template
    .replace(FONT_PRELOAD, preloadFonts.join('\n    '))
    .replace(SEO_BLOCK, head)
    .replace(ROOT, `<div id="root"${attr}>${html}</div>`);
}

function write(file, html) {
  const out = path.join(dist, file);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`  ${file}`);
}

for (const url of routes) {
  write(url === '/' ? 'index.html' : `${url.slice(1)}.html`, page(url, url));
}
write('404.html', page('/404', null));

rmSync(ssrDir, { recursive: true, force: true });
console.log(`prerendered ${routes.length} pages + 404.html`);
