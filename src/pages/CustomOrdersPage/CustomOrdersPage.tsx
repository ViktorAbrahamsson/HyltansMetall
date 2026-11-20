import Seo from '@/components/layout/Seo';
import { Link } from 'react-router-dom';
import Figure from '@/components/common/Figure/Figure';
import InstagramFeed from '@/components/common/InstagramFeed/InstagramFeed';
import { images } from '@/assets/images/manifest';
import WorkGallery, { type WorkPiece } from '@/components/common/WorkGallery/WorkGallery';
import styles from './CustomOrdersPage.module.scss';

/**
 * The five groupings the real site lists under Specialtillverkning on its
 * start page. Kept in that order — it is the owner's own grouping, not ours.
 */
const categories = [
  'Delar till veteranbilar',
  'Båtar',
  'Möbler',
  'Skyltar',
  'Konstverk',
];

/** Customer commissions, in row order (see WorkGallery). */
const earlierWork: WorkPiece[] = [
  {
    image: images['custom/ringar'],
    alt: 'Två gjutna ringar med skruvhål, den ena rå och den andra slipad.',
    tile: 'portrait',
  },
  {
    image: images['custom/kalmar'],
    alt: 'Två gjutna skyltar med texten Kalmar Verkstads AB, Kalmar, 1932.',
    tile: 'landscape',
  },

  {
    image: images['custom/namnskyltar'],
    alt: 'Tre patinerade namnskyltar, bland andra Brygghuset och PV-garaget.',
    tile: 'landscape',
  },
  {
    image: images['custom/namnskyltar-ra'],
    alt: 'Namnskyltar direkt ur formen, fortfarande sittande på ingjutskanalen.',
    tile: 'portrait',
  },

  // The odd portrait out: full width on phones (see WorkGallery).
  {
    image: images['custom/plakett'],
    alt: 'Plakett från Gnosjö kommun: Denna byggnad har tilldelats kommunens pris för god arkitektur 2021.',
    tile: 'portrait',
  },
  {
    image: images['custom/beslag'],
    alt: 'Nypolerade beslag i mässing uppradade på ett bord.',
    tile: 'landscape',
  },

  {
    image: images['custom/sweet-sixteen'],
    alt: 'Två polerade emblem i mässing med skrivstilstexten Sweet Sixteen.',
    tile: 'full',
  },
];

export default function CustomOrdersPage() {
  return (
    <>
      <Seo
        title="Specialtillverkning. Hyltans Metall"
        description="Vi tillverkar plaketter och skyltar, beslag, låsdetaljer och handtag till dörrar och möbler, och delar till veteranbilar och båtar. Sandgjutet i brons och mässing."
      />

      {/* Intro block */}
      <section className={`block custom-orders-block ${styles['custom-orders__intro']}`}>
        <div className="container container-sm page-intro">
          <h1 className={styles['custom-orders__h1']}>Specialtillverkning</h1>
          <p className="page-intro__lead">
            Vi tillverkar plaketter och skyltar. Beslag, låsdetaljer och handtag
            till dörrar och möbler. Delar till veteranbilar, båtar mm.
          </p>
        </div>
      </section>

      {/* What we cast */}
      <section className={`block block--paper custom-orders-list-block ${styles['custom-orders__list-block']}`}>
        <div className={`container ${styles['custom-orders__split']}`}>
          <div className={styles['custom-orders__split-text']}>
            <h2 className={styles['custom-orders__h2']}>Vad vi gjuter</h2>
            <ul className={styles['custom-orders__list']}>
              {categories.map((label) => (
                <li key={label} className={styles['custom-orders__list-item']}>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <Figure
            image={images['custom/beslag-serie']}
            alt="En större serie små polerade beslag och detaljer i mässing."
            ratio="landscape"
            sizes="(min-width: 1024px) 45vw, 100vw"
            className={styles['custom-orders__split-media']}
          />
        </div>
      </section>

      {/* Working from a customer's own model */}
      <section className={`block custom-orders-model-block ${styles['custom-orders__model-block']}`}>
        <div className={`container ${styles['custom-orders__split']} ${styles['custom-orders__split--reverse']}`}>
          <div className={styles['custom-orders__split-text']}>
            <h2 className={styles['custom-orders__h2']}>Har ni en modell?</h2>
            <p className={styles['custom-orders__body']}>
              Har ni en modell kan vi undersöka möjligheten att tillverka en
              exakt kopia.
            </p>
          </div>

          <Figure
            image={images['process/01-modell']}
            alt="En modell läggs på plats i gjutlådan inför formningen."
            ratio="landscape"
            sizes="(min-width: 1024px) 45vw, 100vw"
            className={styles['custom-orders__split-media']}
          />
        </div>
      </section>

      <WorkGallery title="Tidigare arbeten" pieces={earlierWork} />

      <InstagramFeed />

      {/* CTA block */}
      <section className={`block block--dark custom-orders-cta-block ${styles['custom-orders__cta-block']}`}>
        <div className="container container-xs">
          <div className={styles['custom-orders__cta-inner']}>
            <h2 className={styles['custom-orders__cta-h2']}>
              Välkommen med en förfrågan!
            </h2>
            <Link to="/kontakt" className="btn btn--light">
              Kontakta oss
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
