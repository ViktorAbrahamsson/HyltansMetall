import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useLocation, useNavigationType } from 'react-router';

/**
 * The router keeps the scroll position when the path changes, so a click from
 * halfway down one page lands halfway down the next. Reset on navigation —
 * but leave POP (back/forward) alone, where the browser restores the position
 * the visitor actually left.
 *
 * A layout effect, not a passive one: ScrollReveal measures the new page in
 * its own layout effect and must see the reset position. Passive effects run
 * after every layout effect, so a useEffect here left ScrollReveal measuring
 * against the previous page's scroll and the reveal silently did nothing.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useIsomorphicLayoutEffect(() => {
    if (navigationType === 'POP') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, navigationType]);

  return null;
}
