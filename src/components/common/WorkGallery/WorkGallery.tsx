import type { ResponsiveImage } from '@/assets/images/manifest';
import Figure from '@/components/common/Figure/Figure';
import styles from './WorkGallery.module.scss';

/**
 * How a photo sits in the grid. Each desktop row pairs one portrait with one
 * landscape, and the side swaps every row. `half` tiles come in twos, for a
 * row of two landscapes; `full` is a banner across the whole width. On phones
 * portraits pair up two across and everything else takes the full width.
 */
export type WorkTile = 'portrait' | 'landscape' | 'half' | 'full';

export interface WorkPiece {
  image: ResponsiveImage;
  alt: string;
  tile: WorkTile;
}

interface WorkGalleryProps {
  /**
   * Visible heading. Left out, the block has none and `label` names the
   * section for screen readers instead.
   */
  title?: string;
  label?: string;
  /**
   * In row order: the desktop zig-zag depends on it, so add or move pieces in
   * pairs (one portrait, one landscape), swapping which comes first each row.
   * With an odd number of portraits, the last one goes full width on phones
   * rather than leaving half a row empty.
   */
  pieces: WorkPiece[];
  /** Section background, to alternate with the block above it. */
  tone?: 'paper' | 'sand';
}

/** The srcset hint for each tile, matching its width in the grid. */
const TILE_SIZES: Record<WorkTile, string> = {
  portrait: '(min-width: 1200px) 370px, (min-width: 768px) 31vw, 46vw',
  landscape: '(min-width: 1200px) 760px, (min-width: 768px) 64vw, 100vw',
  half: '(min-width: 1200px) 565px, (min-width: 768px) 48vw, 100vw',
  full: '(min-width: 1200px) 1140px, 100vw',
};

/** A solo portrait is full width on phones, so it needs a bigger candidate. */
const SOLO_SIZES = '(min-width: 1200px) 370px, (min-width: 768px) 31vw, 100vw';

/** Photos only, with or without a heading — the alt text says what each is. */
export default function WorkGallery({
  title,
  label,
  pieces,
  tone = 'paper',
}: WorkGalleryProps) {
  // Phones pair portraits two across; an odd one out would sit beside a gap.
  const portraits = pieces.filter((piece) => piece.tile === 'portrait');
  const solo = portraits.length % 2 === 1 ? portraits[portraits.length - 1] : undefined;

  return (
    <section
      className={`block ${tone === 'paper' ? 'block--paper' : ''} work-gallery-block`}
      aria-label={title ? undefined : label}
    >
      <div className="container">
        {title && <h2 className={styles['work-gallery__h2']}>{title}</h2>}
        <ul className={styles['work-gallery__grid']}>
          {pieces.map((piece) => (
            <li
              key={piece.image.src}
              className={[
                styles['work-gallery__item'],
                styles[`work-gallery__item--${piece.tile}`],
                piece === solo ? styles['work-gallery__item--solo'] : '',
              ].join(' ')}
            >
              <Figure
                image={piece.image}
                alt={piece.alt}
                ratio={piece.tile === 'portrait' ? 'portrait' : 'landscape'}
                sizes={piece === solo ? SOLO_SIZES : TILE_SIZES[piece.tile]}
                className={styles['work-gallery__fig']}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
