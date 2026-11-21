import { useEffect, useRef } from 'react';
import styles from './Hero.module.scss';

interface Ember {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  speed: number;
  twinkle: number;
  color: string;
}

const COLORS = ['#FFB066', '#E2B05E', '#D9A24B', '#B07A2E'];
const COUNT = 70;
/** How far the glow reaches beyond an ember's core, in CSS px. */
const GLOW = 8;
/** Sprite resolution, in device px. Drawn at most ~21 CSS px, so this is ample. */
const SPRITE = 64;

/**
 * One glowing dot per colour, drawn once: a bright core fading out through a
 * soft halo. Each frame then only stamps these with drawImage.
 *
 * This replaces a per-ember `shadowBlur`, which made the browser compute a
 * fresh blur for all 70 embers on every frame. With a GPU that is cheap; drawn
 * in software (PageSpeed's test machines, many low-end phones) each frame
 * became a long task, and PageSpeed measured 27-34 s of Total Blocking Time on
 * the home page. Stamping a sprite costs almost nothing either way.
 */
function makeSprite(color: string): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  sprite.width = SPRITE;
  sprite.height = SPRITE;
  const c = sprite.getContext('2d')!;
  const r = SPRITE / 2;
  const g = c.createRadialGradient(r, r, 0, r, r, r);
  const rgb = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16)).join(',');
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.14, `rgba(${rgb},0.95)`);
  g.addColorStop(0.32, `rgba(${rgb},0.35)`);
  g.addColorStop(0.6, `rgba(${rgb},0.08)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, SPRITE, SPRITE);
  return sprite;
}

export default function EmberField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (anywhere: boolean): Ember => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 10,
      r: 0.6 + Math.random() * 1.7,
      vy: 0.18 + Math.random() * 0.55,
      sway: 10 + Math.random() * 30,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
      twinkle: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });

    const embers: Ember[] = Array.from({ length: COUNT }, () => spawn(true));
    const sprites = new Map(COLORS.map((color) => [color, makeSprite(color)]));

    let t = 0;
    /** `step`: how far to advance, in 60 fps frames (1 = one frame at 60 Hz). */
    const drawFrame = (step: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.y -= e.vy * step;
        if (e.y < -12) embers[i] = spawn(false);

        const x = e.x + Math.sin(t * e.speed + e.phase) * e.sway * 0.12;
        // flicker + fade out toward the top third
        const flicker = 0.55 + 0.45 * Math.sin(t * 2.2 + e.twinkle);
        const heightFade = Math.min(1, Math.max(0, e.y / (height * 0.35)));
        const alpha = 0.7 * flicker * heightFade;
        if (alpha <= 0.01) continue;

        const size = (e.r + GLOW) * 2;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprites.get(e.color)!, x - size / 2, e.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    if (reducedMotion) {
      // one static, dimmer frame — no animation
      t = 1;
      drawFrame(0);
      return () => window.removeEventListener('resize', resize);
    }

    let raf = 0;
    let running = true;
    let last = 0;
    // Driven by real elapsed time, not frame count: counting frames ran the
    // embers 2.5x too fast on a 144 Hz screen. A long gap (tab in the
    // background) is clamped so the embers don't jump.
    const loop = (now: number) => {
      if (!running) return;
      const step = last ? Math.min((now - last) / (1000 / 60), 4) : 1;
      last = now;
      t += step / 60;
      drawFrame(step);
      raf = requestAnimationFrame(loop);
    };

    // pause the loop while the hero is scrolled out of view
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      if (visible && !running) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(loop);
      } else if (!visible) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    observer.observe(canvas);
    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles['hero__embers']} aria-hidden="true" />;
}
