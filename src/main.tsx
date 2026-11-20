import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
// Self-hosted fonts (no request to Google: faster first paint, and no visitor
// IP sent to a third party). Variable fonts with the same axes the Google
// Fonts URL asked for: Fraunces wght+opsz, roman and italic; Inter wght.
// Each CSS file covers several unicode-range subsets, and the browser only
// fetches the ones the page's text needs (latin for Swedish).
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource-variable/inter/wght.css';
import './styles/main.scss';

const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// The <head> arrives with the page's title, description, canonical and share
// tags already in place (prerendered, or index.html's defaults in dev), each
// marked data-prerendered. From here on React renders those tags itself from
// <Seo> and keeps them current while navigating, so the static copies go
// first; otherwise every tag would be there twice.
document.head.querySelectorAll('[data-prerendered]').forEach((tag) => tag.remove());

const root = document.getElementById('root')!;

// scripts/prerender.mjs writes each page's HTML into #root and records which
// path it was rendered for. Hydrate only when that is the page being shown:
// the host serves 404.html for any unknown address, and an unknown product
// slug redirects, so the markup can belong to a different route. Then, and in
// `npm run dev` (no prerendered markup), render from scratch instead.
const prerenderedPath = root.dataset.prerenderedPath;
const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

if (prerenderedPath && prerenderedPath === currentPath) {
  hydrateRoot(root, app);
} else {
  root.innerHTML = '';
  createRoot(root).render(app);
}
