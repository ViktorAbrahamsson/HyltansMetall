/**
 * Builds the PNG favicons from public/favicon.svg — a ladle pouring molten
 * bronze. The SVG itself is the main icon (crisp at any size); the PNGs are
 * for browsers and crawlers that will not take an SVG.
 *
 * Usage:  node scripts/make-favicons.mjs
 *
 * Writes into public/, which Vite serves from the site root:
 *   favicon-32.png, favicon-48.png  the tile as drawn, rounded corners
 *   apple-touch-icon.png (180)      square-cornered: iOS rounds it itself and
 *                                   would show the SVG's corners as a dark rim
 *   icon-192.png, icon-512.png      for site.webmanifest (Android home screen,
 *                                   install prompts), square-cornered too
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'public');
const svg = readFileSync(path.join(OUT, 'favicon.svg'), 'utf8');

// Square the tile's corners for the touch icon. Fail loudly if the tile is
// ever redrawn so this no longer matches, rather than shipping rounded corners.
const tile = /(<rect id="tile"[^>]*?) rx="[\d.]+"/;
if (!tile.test(svg)) {
  console.error('favicon.svg: no <rect id="tile" ... rx="…"> to square off.');
  process.exit(1);
}
const squareSvg = svg.replace(tile, '$1');

async function icon(source, size, file) {
  // A high density rasterises the 32-unit drawing well above the target size,
  // so the downscale does the antialiasing instead of librsvg's edges.
  await sharp(Buffer.from(source), { density: 72 * (size / 32) * 4 })
    .resize(size, size)
    .png()
    .toFile(path.join(OUT, file));
  console.log(`  ${file}`);
}

await icon(svg, 32, 'favicon-32.png');
await icon(svg, 48, 'favicon-48.png');
await icon(squareSvg, 180, 'apple-touch-icon.png');
await icon(squareSvg, 192, 'icon-192.png');
await icon(squareSvg, 512, 'icon-512.png');
console.log('favicons written to public/');
