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
   * The live site's origin, no trailing slash. Canonical URLs, og:url and the
   * sitemap all use it. Must match the domain the site is served from at
   * launch (with or without www) — also in public/robots.txt,
   * public/sitemap.xml and the JSON-LD in index.html.
   */
  siteUrl: 'https://hyltansmetall.se',
  // What the contact-page map searches Google Maps for.
  mapQuery: 'Hyltan 40, 335 91 Gnosjö',
  description:
    'Hyltans Metall tillverkar sandgjutna produkter i brons och mässing. Tillverkningen sker med samma metoder som vid företagets start 1926. Ett äkta hantverk som har ärvts från far till son i fyra generationer.',
} as const;
