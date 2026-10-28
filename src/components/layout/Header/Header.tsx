import { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { productCategories } from '@/data/products';
import styles from './Header.module.scss';

interface NavChild {
  to: string;
  label: string;
}

interface NavEntry {
  to: string;
  label: string;
  children?: NavChild[];
}

// No Start entry: the logo is already a link to the home page, and it stays
// above the mobile overlay, so home is reachable from every state.
// Produkter's submenu is derived from the category data, so adding a category
// adds it to the nav with no change here.
const navLinks: NavEntry[] = [
  {
    to: '/produkter',
    label: 'Produkter',
    children: productCategories.map((category) => ({
      to: `/produkter/${category.slug}`,
      label: category.title,
    })),
  },
  {
    to: '/specialtillverkning',
    label: 'Specialtillverkning',
  },
  {
    to: '/tillverkning',
    label: 'Gjutprocessen',
  },
  {
    to: '/om-oss',
    label: 'Om oss',
    children: [{ to: '/kontakt', label: 'Kontakta oss' }],
  },
];

/**
 * Whether a top-level item should read as current.
 *
 * NavLink's own matching only covers nested paths, which works for
 * /produkter/anglar but not for a child on an unrelated path like /kontakt
 * under Om oss — without this the nav would show nothing as current on
 * those pages.
 */
function isSectionActive(entry: NavEntry, pathname: string): boolean {
  if (pathname === entry.to || pathname.startsWith(`${entry.to}/`)) return true;
  return (entry.children ?? []).some((child) => pathname === child.to);
}

function Chevron() {
  return (
    <svg
      className={styles['nav__chevron']}
      viewBox="0 0 10 6"
      width="10"
      height="6"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 1l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const toggleMenu = useCallback(() => setMenuOpen(o => !o), []);

  return (
    <header
      className={[
        styles.header,
        menuOpen ? styles['header--menu-open'] : '',
      ].join(' ')}
    >
      <div className={styles.header__inner}>
        <NavLink to="/" className={styles.logo} aria-label="Hyltans Metall. Startsida">
          <span className={styles.logo__name}>Hyltans Metall</span>
          <span className={styles.logo__tagline}>Sedan 1926</span>
        </NavLink>

        <nav className={styles.nav} aria-label="Huvudnavigation">
          <ul className={styles.nav__list}>
            {navLinks.map(({ to, label, children }) => (
              <li
                key={to}
                className={[
                  styles.nav__item,
                  children ? styles['nav__item--has-menu'] : '',
                ].join(' ')}
              >
                <NavLink
                  to={to}
                  className={[
                    styles.nav__link,
                    isSectionActive({ to, label, children }, location.pathname)
                      ? styles['nav__link--active']
                      : '',
                  ].join(' ')}
                >
                  {label}
                  {children && <Chevron />}
                </NavLink>

                {children && (
                  // Opens on hover and on focus-within, so tabbing to Produkter
                  // reveals it without needing a separate toggle button.
                  <ul className={styles['nav__submenu']}>
                    {children.map((child) => (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          className={({ isActive }) =>
                            [
                              styles['nav__submenu-link'],
                              isActive ? styles['nav__submenu-link--active'] : '',
                            ].join(' ')
                          }
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <button
          className={styles.burger}
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Stäng meny' : 'Öppna meny'}
        >
          <span className={styles.burger__bar} />
          <span className={styles.burger__bar} />
          <span className={styles.burger__bar} />
        </button>
      </div>

      {/* Mobile overlay */}
      <div className={[styles.overlay, menuOpen ? styles['overlay--open'] : ''].join(' ')} aria-hidden={!menuOpen}>
        <nav aria-label="Mobilnavigation">
          <ul className={styles.overlay__list}>
            {navLinks.map(({ to, label, children }, i) => (
              <li
                key={to}
                className={styles.overlay__item}
                style={{ '--delay': `${i * 60}ms` } as React.CSSProperties}
              >
                <NavLink
                  to={to}
                  className={[
                    styles.overlay__link,
                    isSectionActive({ to, label, children }, location.pathname)
                      ? styles['overlay__link--active']
                      : '',
                  ].join(' ')}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  {label}
                </NavLink>

                {children && (
                  // The list is short, so the categories stay expanded rather
                  // than hiding behind another tap.
                  <ul className={styles['overlay__sublist']}>
                    {children.map((child) => (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          className={({ isActive }) =>
                            [
                              styles['overlay__sublink'],
                              isActive ? styles['overlay__sublink--active'] : '',
                            ].join(' ')
                          }
                          tabIndex={menuOpen ? 0 : -1}
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
