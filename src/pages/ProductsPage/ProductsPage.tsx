import type { CSSProperties } from 'react';
import Seo from '@/components/layout/Seo';
import { images } from '@/assets/images/manifest';
import InstagramFeed from '@/components/common/InstagramFeed/InstagramFeed';
import ProductCard from '@/components/common/ProductCard/ProductCard';
import WorkGallery, { type WorkPiece } from '@/components/common/WorkGallery/WorkGallery';
import { productCategories } from '@/data/products';
import styles from './ProductsPage.module.scss';

/**
 * Pieces outside the three categories. Same block as Specialtillverkning's
 * "Tidigare arbeten", in row order (see WorkGallery). The heading is the
 * owner's own name for these, from his text for the new site.
 */
const otherProducts: WorkPiece[] = [
  {
    image: images['custom/pendyl'],
    alt: 'Pendyl i polerad mässing med rikt ornerad ram kring urtavlan.',
    tile: 'portrait',
  },
  {
    image: images['custom/faglar-mossa'],
    alt: 'Små fåglar i brons utplacerade på grön mossa.',
    tile: 'landscape',
  },

  {
    image: images['custom/klockor'],
    alt: 'Gjutna klockor i brons, några polerade och några råa.',
    tile: 'landscape',
  },
  {
    image: images['custom/kraftor'],
    alt: 'Ljushållare formade som kräftor, uppradade på en grå träplanka.',
    tile: 'portrait',
  },

  {
    image: images['custom/faglar-rad'],
    alt: 'Tre små fåglar i brons på ett kaklat bord.',
    tile: 'half',
  },
  {
    image: images['custom/kraftor-ask'],
    alt: 'Två kräftljusstakar i en presentask med blått silkespapper, ljus och äkthetsintyg.',
    tile: 'half',
  },
];

// Card width when fewer than three categories share the row.
const TWO_UP_SIZES = '(min-width: 1200px) 570px, (min-width: 768px) 48vw, calc(100vw - 3rem)';

export default function ProductsPage() {
  return (
    <>
      <Seo
        title="Produkter. Hyltans Metall"
        description="Änglar och tomtar i brons och mässing, sandgjutna för hand i vår verkstad i Gnosjö."
      />

      {/* Header block */}
      <section className="block products-page-block">
        <div className="container container-sm page-intro">
          <h1 className={styles['products-page__h1']}>Produkter</h1>
          <p className="page-intro__lead">
            Alla våra produkter sandgjuts för hand i brons och mässing i vår
            verkstad i Gnosjö. Välj en kategori nedan, eller hör av dig med en
            fråga.
          </p>
        </div>
      </section>

      {/* Grid section */}
      <section className={`block block--paper ${styles['products-page__grid-section']}`}>
        <div className="container">
          <div
            className={styles['products-page__grid']}
            style={{ '--cards': Math.min(productCategories.length, 3) } as CSSProperties}
          >
            {productCategories.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={i === 0}
                headingLevel={2}
                sizes={productCategories.length < 3 ? TWO_UP_SIZES : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <WorkGallery title="Övriga produkter" pieces={otherProducts} tone="sand" />

      <InstagramFeed />
    </>
  );
}
