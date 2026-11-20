import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { company } from '@/data/company';

/** Used when a page has no description of its own. Same as index.html's. */
const DEFAULT_DESCRIPTION =
  'Hyltans Metall AB i Gnosjö tillverkar sandgjutna produkter i brons och mässing, med samma metoder som vid företagets start 1926.';

interface SeoProps {
  /** The full <title>, e.g. "Om oss. Hyltans Metall". */
  title: string;
  description?: string;
  /** Keeps the page out of search results (the 404 page). */
  noindex?: boolean;
}

/**
 * Every page's <head>: title, description, canonical URL and the Open Graph /
 * Twitter tags used when a link is shared.
 *
 * index.html carries the same tags as a fallback for crawlers that do not run
 * JavaScript. Those are marked `data-rh`, which tells react-helmet-async they
 * are its own, so it replaces them here instead of adding a second copy.
 *
 * Canonical and og:url always point at the live domain (`company.siteUrl`),
 * so the preview deploy never competes with the real site.
 */
export default function Seo({ title, description = DEFAULT_DESCRIPTION, noindex = false }: SeoProps) {
  const { pathname } = useLocation();
  const url = `${company.siteUrl}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;
  const image = `${company.siteUrl}/og-image.jpg`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
      {!noindex && <link rel="canonical" href={url} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
