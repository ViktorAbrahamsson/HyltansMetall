import { useRef } from 'react';
import { Link } from 'react-router';
import EmberField from './EmberField';
import styles from './Hero.module.scss';

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  /** Bring the block after the hero to the top, just under the fixed header. */
  function scrollToNext() {
    const next = heroRef.current?.nextElementSibling;
    if (!next) return;
    const header = document.querySelector('header');
    const top = next.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight ?? 0);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  return (
    <section ref={heroRef} className={`block--dark ${styles.hero}`} aria-label="Introduktion">
      {/* Molten glow pool */}
      <div className={styles['hero__glow']} aria-hidden="true" />

      {/* Rising foundry embers */}
      <EmberField />

      {/* Legibility scrim */}
      <div className={styles['hero__scrim']} aria-hidden="true" />

      {/* Ghost numeral */}
      <span className={`ghost-numeral ${styles['hero__ghost']}`} aria-hidden="true">1926</span>

      {/* Content */}
      <div className={`container ${styles['hero__content']}`}>
        <p className="label">Gjuteri · Gnosjö</p>
        <h1 className={styles['hero__heading']}>
          Hyltans <span className="molten">Metall AB</span>
        </h1>
        <p className={styles['hero__tagline']}>
          Sandgjutning i brons och mässing.
          <br />
          Hantverk från Gnosjö.
          <br />
          Grundat 1926.
        </p>
        <div className={styles['hero__actions']}>
          <Link to="/produkter" className="btn">Se våra produkter</Link>
          <Link to="/om-oss" className="btn btn--ghost">Om oss</Link>
        </div>
      </div>

      {/* Scroll cue. Only the stack is the button: the wrapper spans the
          container's width and would otherwise catch clicks across the hero. */}
      <div className={styles['hero__scroll-cue']}>
        <button
          type="button"
          className={styles['hero__scroll-cue-stack']}
          onClick={scrollToNext}
          aria-label="Scrolla ner till nästa del"
        >
          <span className={styles['hero__scroll-cue-label']} aria-hidden="true">Scrolla</span>
          <span className={styles['hero__scroll-cue-mark']} aria-hidden="true">
            <span className={styles['hero__scroll-cue-line']} />
            <svg
              className={styles['hero__scroll-cue-arrow']}
              viewBox="0 0 12 8"
              width="12"
              height="8"
              focusable="false"
            >
              <path
                d="M1 1.5L6 6.5l5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </section>
  );
}
