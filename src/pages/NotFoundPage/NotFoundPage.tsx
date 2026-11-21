import { Link } from 'react-router';
import Seo from '@/components/layout/Seo';
import styles from './NotFoundPage.module.scss';

/**
 * Any address the router doesn't know. noindex, so a mistyped or removed URL
 * never ends up in search results. Prerendered as dist/404.html, which the
 * host serves with a real 404 status for any address that has no page file.
 */
export default function NotFoundPage() {
  return (
    <>
      <Seo title="Sidan finns inte. Hyltans Metall" noindex />

      <section className="block not-found-block">
        <div className="container container-sm page-intro">
          <h1 className={styles['not-found__h1']}>Sidan finns inte</h1>
          <p className="page-intro__lead">
            Sidan du letar efter har flyttats eller finns inte längre.
          </p>
          <Link to="/" className={`btn ${styles['not-found__btn']}`}>
            Till startsidan
          </Link>
        </div>
      </section>
    </>
  );
}
