import { NavLink } from 'react-router-dom';
import { company } from '@/data/company';
import styles from './Footer.module.scss';

// Kept flat and complete, unlike the header: the footer is the site's index,
// so pages nested in a header dropdown still get a direct link here.
const navLinks = [
  { to: '/', label: 'Start' },
  { to: '/produkter', label: 'Produkter' },
  { to: '/specialtillverkning', label: 'Specialtillverkning' },
  { to: '/tillverkning', label: 'Gjutprocessen' },
  { to: '/om-oss', label: 'Om oss' },
  { to: '/kontakt', label: 'Kontakta oss' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={`block--dark ${styles.footer}`}>
      <span className={`ghost-numeral ${styles['footer__ghost']}`} aria-hidden="true">1926</span>
      <div className={`container ${styles['footer__inner']}`}>
        <div className={styles.headline}>
          <p className={styles.headline__text}>
            Handgjort i Gnosjö{' '}
            <em className={`molten ${styles.headline__year}`}>sedan 1926</em>
          </p>
        </div>

        <div className={styles.columns}>
          <div className={styles.col}>
            <p className={styles.col__heading}>Hyltans Metall</p>
            <p className={styles.col__body}>{company.description}</p>
          </div>

          <nav className={styles.col} aria-label="Sidfotnavigation">
            <p className={styles.col__heading}>Sidor</p>
            <ul className={styles['footer__nav-list']}>
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      [
                        styles['footer__nav-link'],
                        isActive ? styles['footer__nav-link--active'] : '',
                      ].join(' ')
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <address className={`${styles.col} ${styles['col--contact']}`}>
            <p className={styles.col__heading}>Kontakt</p>
            <a href={`mailto:${company.email}`} className={styles.contact__email}>
              {company.email}
            </a>
            <p className={styles.contact__addr}>{company.name}</p>
            <p className={styles.contact__addr}>{company.address}</p>
          </address>
        </div>

        <div className={styles.bottom}>
          <span>© {year} {company.name}</span>
          <span className={styles.bottom__location}>Gnosjö, Sverige</span>
        </div>
      </div>
    </footer>
  );
}
