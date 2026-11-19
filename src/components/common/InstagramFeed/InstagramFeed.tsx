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

  const updateArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // 1px slack: fractional scroll positions never quite reach the end.
    setCanPrev(track.scrollLeft > 1);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
  }, []);

  useEffect(() => {
    if (feed.status !== 'ready') return;
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [feed.status, updateArrows]);

  function scrollByTile(direction: 1 | -1) {
    const track = trackRef.current;
    const tile = track?.firstElementChild as HTMLElement | null;
    if (!track || !tile) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({
      left: direction * (tile.offsetWidth + gap),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
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
          <div className={styles['instagram-feed__carousel']}>
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
      </div>
    </section>
  );
}
