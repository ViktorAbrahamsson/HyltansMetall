/// <reference types="vite/client" />

declare module '*.module.scss' {
  const classes: Record<string, string>;
  export default classes;
}

/** The public origin, from vite.config.ts (Vercel production domain at build time). */
declare const __SITE_URL__: string;
