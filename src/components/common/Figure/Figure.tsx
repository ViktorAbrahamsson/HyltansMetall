import { useEffect, useRef, useState } from 'react';
import type { ResponsiveImage } from '@/assets/images/manifest';
import styles from './Figure.module.scss';

export type FigureRatio = 'portrait' | 'square' | 'landscape' | 'wide' | 'banner';

interface FigureProps {
  image: ResponsiveImage;
  alt: string;
  ratio?: FigureRatio;
  /**
   * Rendered width of the image, for picking a srcset candidate. Defaults to
   * full viewport width, which over-fetches inside narrow columns — pass
   * something closer to the truth wherever the layout is known.
   */
  sizes?: string;
  /** Load eagerly at high priority. For images in view on first paint. */
  priority?: boolean;
  className?: string;
}

/**
 * Fixed-ratio image frame. Reserves its box before the file loads so nothing
 * shifts, shows a blurred placeholder behind the photo, and lays the sand grain
 * over the top.
 *
 * The photo is painted at full opacity from the start rather than being faded
 * in by JS: an <img> with no data yet is simply transparent, so the blur behind
 * it shows through on its own. That means the real image appears the instant
 * the browser has pixels — it never waits on a React state flip, and a missed
 * load event can't strand it invisible.
 */
export default function Figure({
  image,
  alt,
  ratio = 'landscape',
  sizes = '100vw',
  priority = false,
  className,
}: FigureProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // A cached image can finish before React attaches onLoad, which would leave
  // the placeholder composited underneath forever.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  const classes = [styles.fig, styles[`fig--${ratio}`], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div
        className={`${styles['fig__blur']} ${loaded ? styles['fig__blur--hidden'] : ''}`}
        style={{ backgroundImage: `url("${image.blur}")` }}
        aria-hidden="true"
      />
      <img
        ref={imgRef}
        className={styles['fig__img']}
        src={image.src}
        srcSet={image.srcSet}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
