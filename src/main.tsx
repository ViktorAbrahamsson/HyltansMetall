import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './styles/main.scss';

const app = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);

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
