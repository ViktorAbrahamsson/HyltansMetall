import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Moves focus to the new page's <h1> after a client-side navigation.
 *
 * A normal page load starts the visitor at the top of a fresh document, but a
 * router navigation only swaps <main>: focus stays on the link that was
 * clicked (in the header or footer), screen readers announce nothing, and the
 * next Tab continues from that old link. Focusing the heading announces the
 * new page by name and puts the keyboard at the start of its content. It also
 * lets a header dropdown close, since it stays open on :focus-within.
 *
 * Skipped on the first render (a real page load already does all this) and
 * when there is no h1. The heading gets tabindex="-1" so it can take focus
 * without entering the Tab order; main.scss hides the ring for that case.
 */
export default function RouteFocus() {
  const { pathname } = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const heading = document.querySelector<HTMLElement>('main h1');
    if (!heading) return;
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
