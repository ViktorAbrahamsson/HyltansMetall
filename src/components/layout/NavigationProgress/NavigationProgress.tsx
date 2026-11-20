import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import styles from './NavigationProgress.module.scss';

/** Never sit on the bar longer than this, whatever is still loading. */
const MAX_WAIT_MS = 4000;
/** Keep it up at least this long, so a fast load still reads as a sweep. */
const MIN_SHOW_MS = 350;

/**
 * A thin bronze bar along the top of the window while a newly navigated page
 * loads. Every page's code is already in the bundle, so the page itself swaps
 * at once; what still arrives are its photos. The bar therefore runs until
 * the images in view on the new page have loaded (or failed), capped at
 * MAX_WAIT_MS, then fills and fades.
 *
 * Driven by direct style changes rather than state, so it never re-renders
 * the page. Not on the first load (the browser shows its own progress then),
 * and decorative: RouteFocus already announces the new page to screen
 * readers.
 */
export default function NavigationProgress() {
  const { pathname } = useLocation();
  const barRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const bar = barRef.current;
    if (!bar) return;

    const started = performance.now();
    const timers: number[] = [];
    const cleanups: (() => void)[] = [];
    let finished = false;

    // Restart from empty without animating backwards.
    bar.classList.remove(styles['nav-progress--done'], styles['nav-progress--running']);
    void bar.offsetWidth;
    bar.classList.add(styles['nav-progress--running']);

    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - started));
      timers.push(window.setTimeout(() => {
        bar.classList.add(styles['nav-progress--done']);
        bar.classList.remove(styles['nav-progress--running']);
      }, wait));
    };

    // Images in view on the new page that have not arrived yet. ScrollToTop
    // has already reset the scroll (a layout effect, run before this one).
    const pending = Array.from(document.querySelectorAll<HTMLImageElement>('main img')).filter((img) => {
      if (img.complete) return false;
      const rect = img.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0;
    });

    if (pending.length === 0) {
      finish();
    } else {
      let left = pending.length;
      const settle = () => { left -= 1; if (left === 0) finish(); };
      for (const img of pending) {
        img.addEventListener('load', settle, { once: true });
        img.addEventListener('error', settle, { once: true });
        cleanups.push(() => {
          img.removeEventListener('load', settle);
          img.removeEventListener('error', settle);
        });
      }
      timers.push(window.setTimeout(finish, MAX_WAIT_MS));
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      cleanups.forEach((fn) => fn());
    };
  }, [pathname]);

  return <div ref={barRef} className={styles['nav-progress']} aria-hidden="true" />;
}
