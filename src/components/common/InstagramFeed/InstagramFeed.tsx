import { useCallback, useEffect, useRef, useState } from 'react';
import { instagram } from '@/data/instagram';
import styles from './InstagramFeed.module.scss';

// The subset of a Behold feed post this section uses.
interface BeholdSize {
  mediaUrl: string;
  width: number;
  height: number;
}

interface BeholdPost {
  id: string;
  permalink: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  altText?: string;
  prunedCaption?: string;
  sizes: Record<'small' | 'medium' | 'large' | 'full', BeholdSize>;
  colorPalette?: { muted?: string };
}

type FeedState =
  | { status: 'loading' }
  | { status: 'ready'; posts: BeholdPost[] }
  | { status: 'empty' };

const PLACEHOLDER_COUNT = 4;

/**
 * The section sits on several pages, so the feed is fetched once per visit and
 * shared: the first section to mount starts the request, every later one reuses
 * it, and a section mounted after it has settled renders the posts at once.
 * A failed request is not cached, so the next page tries again.
 */
let feedRequest: Promise<BeholdPost[]> | null = null;
let feedPosts: BeholdPost[] | null = null;

function loadFeed(url: string): Promise<BeholdPost[]> {
  feedRequest ??= fetch(url)
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((data: { posts?: BeholdPost[] }) => {
      feedPosts = (data.posts ?? []).filter((post) => post.sizes?.medium?.mediaUrl);
      return feedPosts;
    })
    .catch((error) => {
      feedRequest = null;
      throw error;
    });
  return feedRequest;
}

function initialState(): FeedState {
  if (!instagram.feedUrl) return { status: 'empty' };
  if (feedPosts) {
    return feedPosts.length ? { status: 'ready', posts: feedPosts } : { status: 'empty' };
  }
  return { status: 'loading' };
}

function describe(post: BeholdPost): string {
  const text = post.altText || post.prunedCaption;
  if (!text) return 'Inlägg på Instagram';
  return text.length > 140 ? `${text.slice(0, 137).trimEnd()}…` : text;
}

function srcSet(post: BeholdPost): string {
  return (['small', 'medium', 'large'] as const)
    .map((key) => post.sizes[key])
    .filter((size) => size?.mediaUrl)
    .map((size) => `${size.mediaUrl} ${size.width}w`)
    .join(', ');
}

export default function InstagramFeed() {
  const [feed, setFeed] = useState<FeedState>(initialState);
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  // One dot per scroll stop: with four tiles in view and six posts there are
  // three places the row can rest, not six.
  const [stops, setStops] = useState(1);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!instagram.feedUrl || feedPosts) return;
    // The request is shared, so it is not aborted on unmount; this section
    // just stops listening for the answer.
    let active = true;

    loadFeed(instagram.feedUrl)
      .then((posts) => {
        if (active) setFeed(posts.length ? { status: 'ready', posts } : { status: 'empty' });
      })
      .catch(() => {
        // A failed feed hides the row rather than leaving empty frames behind.
        if (active) setFeed({ status: 'empty' });
      });

    return () => {
      active = false;
    };
  }, []);

  /** Width of one tile plus the gap after it: the distance of one step. */
  function tileStep(track: HTMLElement): number {
    const tile = track.firstElementChild as HTMLElement | null;
    if (!tile) return 0;
    return tile.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
  }

  const updateArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // 1px slack: fractional scroll positions never quite reach the end.
    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    setCanPrev(!atStart);
    setCanNext(!atEnd);

    const step = tileStep(track);
    if (!step) return;
    // Whole tiles that fit in view; the last gap does not need to fit.
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const inView = Math.max(1, Math.floor((track.clientWidth + gap + 1) / step));
    const total = Math.max(1, track.children.length - inView + 1);
    setStops(total);
    // The last stop can be shorter than a full step, so pin it at the end.
    setCurrent(atEnd ? total - 1 : Math.min(total - 1, Math.round(track.scrollLeft / step)));
  }, []);

  useEffect(() => {
    if (feed.status !== 'ready') return;
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [feed.status, updateArrows]);

  function scrollBehavior(): ScrollBehavior {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }

  function scrollByTile(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * tileStep(track), behavior: scrollBehavior() });
  }

  function scrollToStop(index: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * tileStep(track), behavior: scrollBehavior() });
  }

  return (
    <section className="block block--alt instagram-block" aria-labelledby="instagram-heading">
      <div className="container">
        <div className={styles['instagram-feed__header']}>
          <div className={styles['instagram-feed__meta']}>
            <p className="label">@{instagram.handle}</p>
            <h2 id="instagram-heading" className={styles['instagram-feed__heading']}>
              Följ oss på Instagram
            </h2>
          </div>
          <a
            href={instagram.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost"
          >
            Till Instagram
          </a>
        </div>

        {feed.status === 'loading' && (
          <ul className={styles['instagram-feed__track']} aria-hidden="true">
            {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
              <li key={i} className={styles['instagram-feed__item']}>
                <span className={styles['instagram-feed__frame']} />
              </li>
            ))}
          </ul>
        )}

        {feed.status === 'ready' && (
          <div className={styles['instagram-feed__carousel']} data-no-reveal>
            <ul
              ref={trackRef}
              className={styles['instagram-feed__track']}
              onScroll={updateArrows}
            >
              {feed.posts.map((post) => (
                <li key={post.id} className={styles['instagram-feed__item']}>
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles['instagram-feed__link']}
                    style={
                      post.colorPalette?.muted
                        ? { backgroundColor: `rgb(${post.colorPalette.muted})` }
                        : undefined
                    }
                  >
                    <img
                      className={styles['instagram-feed__img']}
                      src={post.sizes.medium.mediaUrl}
                      srcSet={srcSet(post)}
                      sizes="(min-width: 1024px) 290px, (min-width: 768px) 33vw, 80vw"
                      alt={describe(post)}
                      loading="lazy"
                      decoding="async"
                    />
                    {post.mediaType === 'VIDEO' && (
                      <span className={styles['instagram-feed__badge']}>
                        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                          <path d="M5 3.5v9l7.5-4.5z" fill="currentColor" />
                        </svg>
                        <span className={styles['instagram-feed__sr']}>Video</span>
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={`${styles['instagram-feed__arrow']} ${styles['instagram-feed__arrow--prev']}`}
              onClick={() => scrollByTile(-1)}
              disabled={!canPrev}
              aria-label="Föregående inlägg"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles['instagram-feed__arrow']} ${styles['instagram-feed__arrow--next']}`}
              onClick={() => scrollByTile(1)}
              disabled={!canNext}
              aria-label="Nästa inlägg"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {feed.status === 'ready' && stops > 1 && (
          <div className={styles['instagram-feed__dots']} data-no-reveal>
            {Array.from({ length: stops }, (_, i) => (
              <button
                key={i}
                type="button"
                className={styles['instagram-feed__dot']}
                onClick={() => scrollToStop(i)}
                aria-label={`Visa inlägg från nummer ${i + 1}`}
                aria-current={i === current ? 'true' : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
