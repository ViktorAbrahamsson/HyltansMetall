import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';
import { productCategories } from './data/products';

/**
 * Server entry for prerendering, built by `vite build --ssr` and driven by
 * scripts/prerender.mjs. Nothing here runs in the browser.
 */

/** Every public page. Product categories come from the published list. */
export const routes: string[] = [
  '/',
  '/produkter',
  ...productCategories.map((category) => `/produkter/${category.slug}`),
  '/specialtillverkning',
  '/tillverkning',
  '/om-oss',
  '/kontakt',
];

export interface RenderResult {
  /** The page markup for #root. */
  html: string;
  /** The page's <title>, <meta> and <link> tags, for <head>. */
  head: string;
}

/**
 * React 19 renders the head tags from <Seo> (title, meta, link) at the very
 * start of renderToString's output rather than where they sit in the tree.
 * This splits that leading run off so it can go in <head>.
 */
const LEADING_HEAD_TAGS = /^(?:<title>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*>)+/;

export function render(url: string): RenderResult {
  const markup = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );

  const head = LEADING_HEAD_TAGS.exec(markup)?.[0] ?? '';
  return { head, html: markup.slice(head.length) };
}
