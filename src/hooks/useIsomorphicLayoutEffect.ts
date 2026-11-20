import { useEffect, useLayoutEffect } from 'react';

/**
 * useLayoutEffect in the browser, useEffect on the server. Layout effects never
 * run during prerendering anyway, but React warns about every one it meets
 * there; this keeps the prerender output clean.
 */
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
