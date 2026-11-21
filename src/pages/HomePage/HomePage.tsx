import Seo from '@/components/layout/Seo';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import Hero from '@/components/common/Hero/Hero';
import ProductCard from '@/components/common/ProductCard/ProductCard';
import Figure from '@/components/common/Figure/Figure';
import InstagramFeed from '@/components/common/InstagramFeed/InstagramFeed';
import { productCategories } from '@/data/products';
import { images } from '@/assets/images/manifest';
import styles from './HomePage.module.scss';

const strip = [
  {
    image: images['workshop/deglar'],
    alt: 'Deglar med brons står och värms över lågorna i verkstaden.',
  },
  {
    image: images['workshop/kol'],
    alt: 'En plåthink fylld med koks intill ugnen.',
  },
  {
    image: images['workshop/larling'],
    alt: 'En yngre medarbetare rensar nygjutet gods vid arbetsbänken.',
  },
];

// Card width when fewer than three categories share the row.
const TWO_UP_SIZES = '(min-width: 1200px) 570px, (min-width: 768px) 48vw, calc(100vw - 3rem)';

export default function HomePage() {
  const featuredProducts = productCategories.slice(0, 3);

  return (
    <>
      <Seo title="Hyltans Metall. Sandgjutning i brons sedan 1926" />

      <Hero />

      {/* About section */}
      <section className={`block block--paper about-block ${styles['home-about']}`}>
        <div className="container">
          <div className={styles['home-about__inner']}>
            <div className={styles['home-about__body']}>
              <h2 className={styles['home-about__heading']}>Hantverket lever vidare</h2>
              <p className={styles['home-about__text']}>
                Hyltans Metall tillverkar sandgjutna produkter i brons och mässing.
                Tillverkningen sker med samma metoder som vid företagets start 1926.
                Efter att ha varit ett av ca 50 små gjuterier i Gnosjö under 1900-talet
                är vi idag det enda kvarvarande privatägda sandgjuteriet.
              </p>
              <Link to="/om-oss" className="btn btn--ghost">Läs mer om företaget</Link>
            </div>
            <Figure
              image={images['workshop/gjutarfigur']}
              alt="Målad figur av en gjutare i läderförkläde som häller smält metall i en form."
              ratio="portrait"
              sizes="(min-width: 1024px) 280px, (min-width: 368px) 320px, calc(100vw - 3rem)"
              className={styles['home-about__media']}
            />
            <span
              className={`ghost-numeral ${styles['home-about__ghost']}`}
              aria-hidden="true"
            >
              1926
            </span>
          </div>
        </div>
      </section>

      {/* Products section */}
      <section className="block products-block">
        <div className="container">
          <div className={styles['home-products__header']}>
            <div className={styles['home-products__meta']}>
              <p className="label">Sortiment</p>
              <h2 className={styles['home-products__heading']}>Våra produkter</h2>
            </div>
            <Link to="/produkter" className="btn btn--ghost">Se alla produkter</Link>
          </div>
          <div
            className={styles['home-products__grid']}
            style={{ '--cards': featuredProducts.length } as CSSProperties}
          >
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                sizes={featuredProducts.length < 3 ? TWO_UP_SIZES : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Full-bleed banner */}
      <section className={styles['home-banner']} aria-label="Nygjutet gods i verkstaden">
        <Figure
          image={images['hero/gjutgods']}
          alt="Nygjutna änglar sitter kvar på gjutkanalerna i formlådorna."
          ratio="banner"
          sizes="100vw"
        />
      </section>

      <InstagramFeed />

      {/* Workshop strip */}
      <section className="block block--paper">
        <div className="container">
          <p className="label">I verkstaden</p>
          <div className={styles['home-strip__grid']}>
            {strip.map((item) => (
              <Figure
                key={item.image.src}
                image={item.image}
                alt={item.alt}
                ratio="landscape"
                sizes="(min-width: 768px) 33vw, calc(100vw - 3rem)"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quote section */}
      <section className={`block block--dark craft-block ${styles['home-quote']}`}>
        {/* Decorative backdrop: a plain <img> rather than a CSS background,
            so phones get the 800px file through srcSet instead of the 1800px
            one, and it loads lazily. Not a Figure: it is dimmed and covered
            by its own scrim, so the blur placeholder and grain add nothing. */}
        <div className={styles['home-quote__bg']} aria-hidden="true">
          <img
            className={styles['home-quote__bg-img']}
            src={images['place/natt'].src}
            srcSet={images['place/natt'].srcSet}
            sizes="100vw"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className={`container container-sm ${styles['home-quote__inner']}`}>
          <blockquote className={styles['home-quote__blockquote']}>
            <p className={styles['home-quote__text']}>
              ”Ett äkta hantverk som har ärvts från far till son i fyra generationer.”
            </p>
            <footer>
              <span className={styles['home-quote__attribution']}>
                Håkan Abrahamsson, Hyltans Metall AB
              </span>
            </footer>
          </blockquote>
        </div>
      </section>
    </>
  );
}
