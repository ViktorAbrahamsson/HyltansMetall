import { useEffect, type RefObject } from 'react';

/** Movement (px) before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 6;
/** How far a flick carries on, in ms of the release velocity. */
const FLING_MS = 180;

interface Options {
  /** Turn the behaviour on (e.g. once the posts are rendered). */
  enabled: boolean;
  /** Distance between two resting positions: one tile plus the gap. */
  step: (track: HTMLElement) => number;
  /** Class added while dragging: switches off scroll snapping and shows the grabbing cursor. */
  draggingClass: string;
}

/**
 * Lets a mouse drag a horizontally scrolling row, the way a finger already
 * swipes it. Touch and pen keep the browser's own scrolling; only
 * `pointerType === 'mouse'` is handled here.
 *
 * - The row follows the pointer 1:1 while dragging (snapping is switched off
 *   via `draggingClass`, or it would fight the drag).
 * - On release it settles on a resting position: the nearest one, carried a
 *   little further by a quick flick, then snapping is switched back on.
 * - A press that moved less than DRAG_THRESHOLD is a click and goes through
 *   (the posts are links). A real drag swallows the click that follows, so
 *   letting go over a post never opens it.
 */
export function useDragToScroll(trackRef: RefObject<HTMLElement | null>, { enabled, step, draggingClass }: Options) {
  useEffect(() => {
    const track = trackRef.current;
    if (!enabled || !track) return;

    let pointerId: number | null = null;
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let suppressClick = false;
    // Recent positions, for the release velocity.
    let samples: { x: number; t: number }[] = [];
    let settleTimer = 0;

    const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      window.clearTimeout(settleTimer);
      track.classList.remove(draggingClass);
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      dragging = false;
      samples = [{ x: event.clientX, t: event.timeStamp }];
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        // Now it is a drag: take the pointer so the row keeps following it
        // even off the row, and stop snapping while it moves.
        dragging = true;
        track.setPointerCapture(event.pointerId);
        track.classList.add(draggingClass);
      }
      event.preventDefault();
      track.scrollLeft = startScroll - dx;
      samples.push({ x: event.clientX, t: event.timeStamp });
      if (samples.length > 5) samples.shift();
    };

    const finish = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      suppressClick = true;
      // If no click follows (released off the row), forget it.
      window.setTimeout(() => { suppressClick = false; }, 0);

      const first = samples[0];
      const last = samples[samples.length - 1];
      const velocity = last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0; // px/ms
      const size = step(track);
      const max = track.scrollWidth - track.clientWidth;
      const projected = track.scrollLeft - velocity * FLING_MS;
      const target = size ? Math.min(max, Math.max(0, Math.round(projected / size) * size)) : track.scrollLeft;

      track.scrollTo({ left: target, behavior: reducedMotion() ? 'auto' : 'smooth' });
      // Switch snapping back on once the row has arrived.
      const restore = () => track.classList.remove(draggingClass);
      // A plain boolean: TypeScript's DOM types assume every browser has
      // scrollend and would treat the fallback branch as unreachable.
      const hasScrollEnd: boolean = 'onscrollend' in window;
      if (hasScrollEnd) {
        track.addEventListener('scrollend', restore, { once: true });
        settleTimer = window.setTimeout(restore, 800); // in case no scroll was needed
      } else {
        settleTimer = window.setTimeout(restore, 450);
      }
    };

    // Swallow the click that ends a drag, before it reaches the link.
    const onClick = (event: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    // No ghost image of the photo or link while dragging.
    const onDragStart = (event: DragEvent) => event.preventDefault();

    track.addEventListener('pointerdown', onPointerDown);
    track.addEventListener('pointermove', onPointerMove);
    track.addEventListener('pointerup', finish);
    track.addEventListener('pointercancel', finish);
    track.addEventListener('click', onClick, true);
    track.addEventListener('dragstart', onDragStart);

    return () => {
      window.clearTimeout(settleTimer);
      track.classList.remove(draggingClass);
      track.removeEventListener('pointerdown', onPointerDown);
      track.removeEventListener('pointermove', onPointerMove);
      track.removeEventListener('pointerup', finish);
      track.removeEventListener('pointercancel', finish);
      track.removeEventListener('click', onClick, true);
      track.removeEventListener('dragstart', onDragStart);
    };
  }, [trackRef, enabled, step, draggingClass]);
}
