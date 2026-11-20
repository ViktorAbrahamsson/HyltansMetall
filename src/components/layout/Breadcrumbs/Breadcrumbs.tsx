import { Link } from 'react-router';
import { company } from '@/data/company';
import styles from './Breadcrumbs.module.scss';

export interface Crumb {
  label: string;
  /** Leave out for the current page, the last crumb. */
  to?: string;
}

interface BreadcrumbsProps {
  /** The trail after "Start", ending with the current page. */
  trail: Crumb[];
}

/**
 * The slim breadcrumb bar every content page opens with (not the home page or
 * the 404). Render it as the first thing in the page, before the intro block:
 * <main> already clears the fixed header, so the bar sits directly beneath it,
 * and the stylesheet trims the next block's top padding to match.
 *
 * The trail follows the main menu, not the URL: Kontakta oss sits under
 * Om oss there, so its trail is Start › Om oss › Kontakta oss.
 *
 * It also emits schema.org BreadcrumbList data, so search engines can show
 * the trail in place of the bare URL. Item URLs use the live domain.
 */
export default function Breadcrumbs({ trail }: BreadcrumbsProps) {
  const crumbs: Crumb[] = [{ label: 'Start', to: '/' }, ...trail];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      ...(crumb.to ? { item: `${company.siteUrl}${crumb.to === '/' ? '/' : crumb.to}` } : {}),
    })),
  };

  return (
    <nav className={styles.breadcrumbs} aria-label="Brödsmulor">
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
