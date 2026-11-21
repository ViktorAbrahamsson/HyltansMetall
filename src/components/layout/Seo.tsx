import { useLocation } from 'react-router';
import { company } from '@/data/company';

/** Used when a page has no description of its own. Same as index.html's. */
const DEFAULT_DESCRIPTION =
  'Hyltans Metall AB i Gnosjö tillverkar sandgjutna produkter i brons och mässing, med samma metoder som vid företagets start 1926.';

interface ShareImage {
  /** Path under public/, built by scripts/make-og-image.mjs. */
  path: string;
  /** The photo's alt text as used on the site, word for word. */
  alt: string;
}

/** The home page, the 404 and any page without its own entry below. */
const DEFAULT_SHARE_IMAGE: ShareImage = {
  path: '/og-image.jpg',
  alt: 'Tre bronsänglar uppställda tillsammans på en trätunna.',
};

/**
 * The picture shown when a page's link is shared, by path. The images are
 * built by scripts/make-og-image.mjs (keep its JOBS in step); alt texts are the
 * photos' own from the pages and src/data/products.ts.
 */
const SHARE_IMAGES: Record<string, ShareImage> = {
  '/produkter': {
    path: '/og/produkter.jpg',
    alt: 'Två bronsänglar med vita ljus mellan sig, på locket av en gammal tunna. Tomtefar, Tomtemor och Tomtenisse tillsammans på en mossbevuxen sten.',
  },
  '/produkter/anglar': {
    path: '/og/anglar.jpg',
    alt: 'Två bronsänglar med vita ljus mellan sig, på locket av en gammal tunna.',
  },
  '/produkter/tomtar': {
    path: '/og/tomtar.jpg',
    alt: 'Tomtefar, Tomtemor och Tomtenisse tillsammans på en mossbevuxen sten.',
  },
  '/specialtillverkning': {
    path: '/og/specialtillverkning.jpg',
    alt: 'En större serie små polerade beslag och detaljer i mässing.',
  },
  '/tillverkning': {
    path: '/og/gjutprocessen.jpg',
    alt: 'Glödande degel med smält metall omgiven av lågor i koksbädden.',
  },
  '/om-oss': {
    path: '/og/om-oss.jpg',
    alt: 'Tre man vid ugnen i gjuteriet, den yngsta generationen ser på.',
  },
  '/kontakt': {
    path: '/og/kontakt.jpg',
    alt: 'Gjuteriets röda träfasad målas om en sommardag.',
  },
};

interface SeoProps {
  /** The full <title>, e.g. "Om oss. Hyltans Metall". */
  title: string;
  description?: string;
  /** Keeps the page out of search results (the 404 page). */
  noindex?: boolean;
}

/**
 * Every page's <head>: title, description, canonical URL and the Open Graph /
 * Twitter tags used when a link is shared, including a share picture chosen
 * per page from SHARE_IMAGES.
 *
 * Plain elements: React 19 hoists <title>, <meta> and <link> into <head>
 * wherever they are rendered, and removes them again when the page unmounts,
 * so client-side navigation swaps them without a helper library. On the
 * server they come out first in the rendered HTML, where
 * src/entry-server.tsx picks them up for the prerendered <head>.
 *
 * Canonical, og:url and og:image use `company.siteUrl`, the Vercel
 * project's production domain at build time (see vite.config.ts): the
 * vercel.app address on the preview, so share previews there load their
 * images (the noindex header keeps it out of search), and hyltansmetall.se
 * once that domain is added. A noindex page (the 404) gets neither a
 * canonical nor an og:url: it has no address of its own worth sharing.
 */
export default function Seo({ title, description = DEFAULT_DESCRIPTION, noindex = false }: SeoProps) {
  const { pathname } = useLocation();
  const path = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  const url = `${company.siteUrl}${path}`;
  const shareImage = (!noindex && SHARE_IMAGES[path]) || DEFAULT_SHARE_IMAGE;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
      {!noindex && <link rel="canonical" href={url} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {!noindex && <meta property="og:url" content={url} />}
      <meta property="og:image" content={`${company.siteUrl}${shareImage.path}`} />
      <meta property="og:image:alt" content={shareImage.alt} />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}
