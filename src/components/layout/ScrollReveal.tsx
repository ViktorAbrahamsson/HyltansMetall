import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useLocation } from 'react-router-dom';

/**
 * Lets page content float up into place as it scrolls into view. Works on the
 * markup every page already shares, so pages need no wiring of their own:
 *
 * - every direct child of a section's `.container` (`main section.block`, so
 *   the hero is left alone), plus anything marked `data-reveal`;
 * - a child that is a grid or an `<ol>` is split into its own children, so
 *   cards and process steps arrive one by one, staggered left to right.
 *
 * Full-width photos are left out on request: an image-only element that spans
 * its container (WorkGallery banner tiles, most photos on a phone) just stays
 * put. Text, and anything mixing text with a photo, still floats in.
 *
 * Anything marked `data-no-reveal` is skipped too: the Instagram slider and its
 * dots, so the arrows and pagination never move.
 *
 * Only what is still below the fold is hidden; anything already on screen (or
 * above it, after back/forward restores a position) stays put, so first paint
 * and the LCP image are never held back. Decorative `aria-hidden` pieces are
 * skipped. Nothing happens under prefers-reduced-motion or without
 * IntersectionObserver.
 *
 * The animation uses `opacity` and the individual `translate` property, never
 * `transform`, so it doesn't clobber an element's own transforms. Both classes
 * come off once the element has landed, which hands the element its own
 * transitions (card hovers etc.) back.
 *
 * Rendered after <main> so its effect runs after ScrollToTop has reset the
 * scroll position for the new route. Both must be layout effects: if
 * ScrollToTop were a passive effect it would run after this one, and the new
 * page would be measured at the old page's scroll.
 */
const SELECTOR = 'main section.block > .container > *, main [data-reveal]';
const PENDING = 'reveal--pending';
const ACTIVE = 'reveal--active';
const STAGGER_MS = 90;
const MAX_STAGGER = 4;
const DURATION_MS = 900;

/** A photo with no text of its own beyond a caption. */
function isImageOnly(el: HTMLElement): boolean {
  if (!el.querySelector('img')) return false;
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('figcaption').forEach((caption) => caption.remove());
  return (clone.textContent ?? '').trim() === '';
}

/** As wide as the container's content box, give or take a pixel. */
function isFullWidth(el: HTMLElement): boolean {
  const container = el.closest<HTMLElement>('.container');
  if (!container) return true;
  const style = getComputedStyle(container);
  const inner =
    container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  return el.getBoundingClientRect().width >= inner - 1;
}

function collectTargets(): HTMLElement[] {
  const targets: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
    if (el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('data-no-reveal')) return;
    const display = getComputedStyle(el).display;
    const splits = (display === 'grid' || el.tagName === 'OL') && el.children.length > 1;
    const candidates = splits
      ? Array.from(el.children).filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement && child.getAttribute('aria-hidden') !== 'true',
        )
      : [el];
    candidates.forEach((child) => {
      if (isImageOnly(child) && isFullWidth(child)) return;
      targets.push(child);
    });
  });
  return targets;
}

export default function ScrollReveal() {
  const { pathname } = useLocation();

  useIsomorphicLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const viewportBottom = window.innerHeight;
    const targets = collectTargets().filter(
      (el) => el.getBoundingClientRect().top > viewportBottom,
    );
    if (targets.length === 0) return;

    const timers = new Set<number>();

    const reveal = (el: HTMLElement, delay: number) => {
      el.style.setProperty('--reveal-delay', `${delay}ms`);
      el.classList.add(ACTIVE);
      el.classList.remove(PENDING);
      const timer = window.setTimeout(() => {
        el.classList.remove(ACTIVE);
        el.style.removeProperty('--reveal-delay');
        timers.delete(timer);
      }, delay + DURATION_MS + 100);
      timers.add(timer);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Stagger what arrives together, in reading order.
        const arriving = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) => {
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            return ra.top - rb.top || ra.left - rb.left;
          });
        arriving.forEach((el, i) => {
          observer.unobserve(el);
          reveal(el, Math.min(i, MAX_STAGGER) * STAGGER_MS);
        });
      },
      { rootMargin: '0px 0px -8% 0px' },
    );

    targets.forEach((el) => {
      el.classList.add(PENDING);
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      targets.forEach((el) => {
        el.classList.remove(PENDING, ACTIVE);
        el.style.removeProperty('--reveal-delay');
      });
    };
  }, [pathname]);

  return null;
}
