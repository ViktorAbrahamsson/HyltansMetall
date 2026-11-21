export const company = {
  name: 'Hyltans Metall AB',
  tagline: 'Handgjort i Gnosjö sedan 1926',
  founded: 1926,
  city: 'Gnosjö',
  address: 'SE 335 91 GNOSJÖ',
  email: 'info@hyltansmetall.se',
  phone: '070-910 44 38',
  /** International form for the tel: link. */
  phoneHref: '+46709104438',
  website: 'hyltansmetall.se',
  /**
   * The site's public origin, no trailing slash: canonical URLs, og:url,
   * og:image and the breadcrumb data use it. Set at build time in
   * vite.config.ts — the Vercel project's production domain (the vercel.app
   * address until hyltansmetall.se is added there), otherwise
   * https://hyltansmetall.se. The static files that name the live domain by
   * hand (public/robots.txt, public/sitemap.xml, public/llms.txt, the JSON-LD
   * in index.html) stay on https://hyltansmetall.se.
   */
  siteUrl: __SITE_URL__,
  // What the contact-page map searches Google Maps for.
  mapQuery: 'Hyltan 40, 335 91 Gnosjö',
  description:
    'Hyltans Metall tillverkar sandgjutna produkter i brons och mässing. Tillverkningen sker med samma metoder som vid företagets start 1926. Ett äkta hantverk som har ärvts från far till son i fyra generationer.',
} as const;
