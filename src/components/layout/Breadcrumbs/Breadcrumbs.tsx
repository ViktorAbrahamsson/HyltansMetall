import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { company } from '@/data/company';
import { getCategoryBySlug } from '@/data/products';
import styles from './Breadcrumbs.module.scss';

interface Crumb {
  label: string;
  /** Left out for the current page, the last crumb. */
  to?: string;
}

/**
 * Each content page's trail after "Start". It follows the main menu, not the
 * URL: Kontakta oss sits under Om oss there, so its trail is
 * Start › Om oss › Kontakta oss. Labels are the menu's page names.
 * A new content page needs an entry here.
 */
const TRAILS: Record<string, Crumb[]> = {
  '/produkter': [{ label: 'Produkter' }],
  '/specialtillverkning': [{ label: 'Specialtillverkning' }],
  '/tillverkning': [{ label: 'Gjutprocessen' }],
  '/om-oss': [{ label: 'Om oss' }],
  '/kontakt': [{ label: 'Om oss', to: '/om-oss' }, { label: 'Kontakta oss' }],
};

/** The trail for an address, or null for the home page, the 404 and redirects. */
function trailFor(pathname: string): Crumb[] | null {
  const path = pathname.replace(/\/$/, '') || '/';
  if (TRAILS[path]) return TRAILS[path];
  const slug = path.match(/^\/produkter\/([^/]+)$/)?.[1];
  // Published categories only: a hidden or unknown slug redirects to /produkter.
  const category = slug ? getCategoryBySlug(slug) : undefined;
  if (category) return [{ label: 'Produkter', to: '/produkter' }, { label: category.title }];
  return null;
}

/**
 * The breadcrumb bar under the header on every content page (not the home
 * page or the 404). Rendered once in App.tsx between <Header> and <main>,
 * not inside the page: a sticky element only sticks within its parent, and
 * inside <main> it slid away as soon as the footer came up. As a child of
 * #root it stays fixed under the header all the way down.
 *
 * Layout: sticky only moves it on screen. In the flow it sits at the very top
 * (behind the fixed header) and takes its own height, and <main> is padded by
 * the header's height, so page content starts exactly under the bar.
 *
 * It also emits schema.org BreadcrumbList data, so search engines can show
 * the trail in place of the bare URL. Item URLs use the live domain.
 */
/** Scroll distance (px) that counts as a direction change, to ignore jitter. */
const SCROLL_SLACK = 6;

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const trail = trailFor(pathname);
  const navRef = useRef<HTMLElement>(null);

  // Headroom behaviour: the bar slides away (up, behind the header) while the
  // visitor scrolls down and comes back as soon as they scroll up. Always
  // shown near the top of the page. A class toggle on the element, not state,
  // so scrolling never re-renders anything. Keyboard focus inside the bar
  // brings it back too (:focus-within in the stylesheet).
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const hidden = styles['breadcrumbs--hidden'];
    nav.classList.remove(hidden);

    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (y <= nav.offsetHeight) {
        nav.classList.remove(hidden);
      } else if (y > lastY + SCROLL_SLACK) {
        nav.classList.add(hidden);
      } else if (y < lastY - SCROLL_SLACK) {
        nav.classList.remove(hidden);
      } else {
        return; // too small to count; keep comparing against the old position
      }
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  if (!trail) return null;

  const crumbs: Crumb[] = [{ label: 'Start', to: '/' }, ...trail];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      ...(crumb.to ? { item: `${company.siteUrl}${crumb.to}` } : {}),
    })),
  };

  return (
    <nav ref={navRef} className={styles.breadcrumbs} aria-label="Brödsmulor">
      <ol className={`container ${styles['breadcrumbs__list']}`}>
        {crumbs.map((crumb) => (
          <li
            key={crumb.label}
            className={styles['breadcrumbs__item']}
            aria-current={crumb.to ? undefined : 'page'}
          >
            {crumb.to ? (
              <Link to={crumb.to} className={styles['breadcrumbs__link']}>
                {crumb.label}
              </Link>
            ) : (
              crumb.label
            )}
          </li>
        ))}
      </ol>
      <script
        type="application/ld+json"
        // Static data built from the trail above, no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </nav>
  );
}
