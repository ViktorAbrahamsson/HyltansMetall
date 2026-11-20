import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
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
  html: string;
  head: string;
}

export function render(url: string): RenderResult {
  const helmetContext: { helmet?: HelmetServerState | null } = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HelmetProvider>,
  );

  const helmet = helmetContext.helmet;
  const head = helmet
    ? [helmet.title.toString(), helmet.meta.toString(), helmet.link.toString()].join('\n    ')
    : '';

  return { html, head };
}
