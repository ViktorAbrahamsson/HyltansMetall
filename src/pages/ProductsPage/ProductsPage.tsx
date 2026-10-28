import { Helmet } from 'react-helmet-async';
import ProductCard from '@/components/common/ProductCard/ProductCard';
import { productCategories } from '@/data/products';
import styles from './ProductsPage.module.scss';

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title>Produkter. Hyltans Metall</title>
      </Helmet>

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
          <div className={styles['products-page__grid']}>
            {productCategories.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i === 0} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
