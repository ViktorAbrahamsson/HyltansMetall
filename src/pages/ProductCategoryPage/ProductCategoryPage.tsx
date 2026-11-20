import type { CSSProperties } from 'react';
import Seo from '@/components/layout/Seo';
import Breadcrumbs from '@/components/layout/Breadcrumbs/Breadcrumbs';
import { Link, Navigate, useParams } from 'react-router';
import Figure from '@/components/common/Figure/Figure';
import InstagramFeed from '@/components/common/InstagramFeed/InstagramFeed';
import ProductCard from '@/components/common/ProductCard/ProductCard';
import WorkGallery from '@/components/common/WorkGallery/WorkGallery';
import { getCategoryBySlug, productCategories } from '@/data/products';
import styles from './ProductCategoryPage.module.scss';

const ITEM_SIZES = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw';

// The featured photo: ~60% of the 1200px container from lg up.
const FEATURE_SIZES = '(min-width: 1200px) 680px, (min-width: 1024px) 57vw, 100vw';

// Two photos inside .container-sm: 836px of content split by a 2.5rem gap.
const GALLERY_SIZES = '(min-width: 900px) 400px, (min-width: 768px) 50vw, 100vw';

// Two cards inside .container-sm: 836px of content split by a 2.5rem gap.
const MORE_SIZES = '(min-width: 900px) 400px, (min-width: 768px) 50vw, 100vw';

// Most categories are made to order. One that is not carries its own ctaText.
const DEFAULT_CTA_TEXT =
  'Vi tillverkar på beställning. Hör av dig så återkommer vi med pris och leveranstid.';

export default function ProductCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug(slug);

  // An unknown slug is a bad link rather than a page — send it back to the
  // index without leaving a dead entry in the history stack.
  if (!category) return <Navigate to="/produkter" replace />;

  const others = productCategories.filter((c) => c.id !== category.id);
  const itemRatio = category.itemRatio ?? 'landscape';
  // A category with a single photographed product shows it big, with its
  // details beside it, rather than as one small card in a three-up grid.
  const featured =
    category.items.length === 1 && category.items[0].image
      ? category.items[0]
      : undefined;

  return (
    <>
      <Seo title={`${category.title}. Hyltans Metall`} description={category.description} />

      <Breadcrumbs trail={[{ label: 'Produkter', to: '/produkter' }, { label: category.title }]} />

      {/* Intro block */}
      <section className="block product-category-block">
        <div className="container container-sm page-intro">
          <h1 className={styles['product-category__h1']}>{category.title}</h1>
          <p className="page-intro__lead">{category.description}</p>
        </div>
      </section>

      {/* Items */}
      <section className={`block block--paper product-category-items-block ${styles['product-category__items-block']}`}>
        <div className="container">
          {featured?.image ? (
            <div className={styles['product-category__feature']}>
              <Figure
                image={featured.image}
                alt={featured.imageAlt ?? featured.title ?? category.title}
                ratio={itemRatio}
                sizes={FEATURE_SIZES}
                priority
                className={styles['product-category__feature-media']}
              />
              <div className={styles['product-category__feature-body']}>
                <h2 className={styles['product-category__feature-title']}>
                  {featured.title ?? category.itemNoun}
                </h2>
                {featured.specs && (
                  <p className={styles['product-category__feature-specs']}>
                    {featured.specs}
                  </p>
                )}
                {featured.note && (
                  <p className={styles['product-category__feature-note']}>
                    {featured.note}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <ul className={styles['product-category__grid']}>
              {category.items.map((item, i) => (
                <li key={item.id} className={styles['product-category__item']}>
                  {item.image ? (
                    <Figure
                      image={item.image}
                      alt={item.imageAlt ?? item.title ?? category.title}
                      ratio={itemRatio}
                      sizes={ITEM_SIZES}
                      priority={i === 0}
                      className={styles['product-category__item-media']}
                    />
                  ) : (
                    // No photo yet. Reserve the same box the Figure would take so
                    // the grid keeps its shape and dropping a photo in later
                    // shifts nothing.
                    <div
                      className={[
                        styles['product-category__item-placeholder'],
                        itemRatio === 'portrait'
                          ? styles['product-category__item-placeholder--portrait']
                          : '',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      <span className={styles['product-category__item-slot']}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={styles['product-category__item-pending']}>
                        Foto kommer
                      </span>
                    </div>
                  )}

                  <p className={styles['product-category__item-title']}>
                    {item.title ?? `${category.itemNoun} ${i + 1}`}
                  </p>
                  {item.specs && (
                    <p className={styles['product-category__item-specs']}>{item.specs}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* The kinds photographed together. Not products of their own, so no
          titles and no links — they just close the grid off. */}
      {category.gallery && (
        <section
          className={`block product-category-gallery-block ${styles['product-category__gallery-block']}`}
          aria-label={`${category.title} tillsammans`}
        >
          <div className="container container-sm">
            <ul className={styles['product-category__gallery']}>
              {category.gallery.map((shot) => (
                <li key={shot.image.src}>
                  <Figure
                    image={shot.image}
                    alt={shot.alt}
                    ratio={itemRatio}
                    sizes={GALLERY_SIZES}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* More photos, mixed shapes, as the zig-zag block. */}
      {category.showcase && (
        <WorkGallery
          label={`Fler bilder: ${category.title}`}
          pieces={category.showcase}
          tone="sand"
        />
      )}

      <InstagramFeed />

      {/* Enquiry block */}
      <section className={`block block--dark product-category-cta-block ${styles['product-category__cta-block']}`}>
        <div className="container container-xs">
          <div className={styles['product-category__cta-inner']}>
            <h2 className={styles['product-category__cta-h2']}>
              Intresserad av {category.title.toLowerCase()}?
            </h2>
            <p className={styles['product-category__cta-text']}>
              {category.ctaText ?? DEFAULT_CTA_TEXT}
            </p>
            <Link to="/kontakt" className="btn btn--light">
              Kontakta oss
            </Link>
          </div>
        </div>
      </section>

      {/* Sibling categories */}
      <section className={`block product-category-more-block ${styles['product-category__more-block']}`}>
        <div className="container container-sm">
          <h2 className={styles['product-category__more-h2']}>Fler kategorier</h2>
          <div
            className={styles['product-category__more-grid']}
            style={{ '--cards': Math.min(others.length, 2) } as CSSProperties}
          >
            {others.map((other) => (
              <ProductCard key={other.id} product={other} sizes={MORE_SIZES} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
