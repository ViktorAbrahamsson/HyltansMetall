import { Link } from 'react-router';
import { ProductCategory } from '@/data/products';
import Figure from '@/components/common/Figure/Figure';
import styles from './ProductCard.module.scss';

/** Widths of the three-column grid on /produkter, which is the common case. */
const DEFAULT_SIZES = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw';

interface ProductCardProps {
  product: ProductCategory;
  /** Load this card's photo eagerly — for the first card in view. */
  priority?: boolean;
  /** Override when the card sits in a narrower grid than /produkter's. */
  sizes?: string;
  /**
   * Heading level of the card title. 3 under a section h2 (home page, sibling
   * links); 2 where the cards sit straight under the page h1 (/produkter), so
   * the outline does not skip a level.
   */
  headingLevel?: 2 | 3;
}

export default function ProductCard({
  product,
  priority = false,
  sizes = DEFAULT_SIZES,
  headingLevel = 3,
}: ProductCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className={styles.card}>
      {/* The whole card is the target, so the link would otherwise be
          announced as the title and the description run together. */}
      <Link
        to={`/produkter/${product.slug}`}
        className={styles['card__link']}
        aria-label={product.title}
      >
        {product.image && (
          <Figure
            image={product.image}
            alt={product.imageAlt ?? product.title}
            ratio="square"
            sizes={sizes}
            priority={priority}
            className={styles['card__media']}
          />
        )}
        <div className={styles['card__body']}>
          <Heading className={styles.card__title}>{product.title}</Heading>
          <p className={styles.card__desc}>{product.description}</p>
        </div>
      </Link>
    </article>
  );
}
