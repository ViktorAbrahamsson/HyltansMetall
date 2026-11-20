// Builds the share images: the picture shown when a link to the site is
// shared (Facebook, LinkedIn, Messenger, Slack...). Those crawlers do not run
// JavaScript and want a plain JPEG at a stable URL, so these live in public/
// rather than going through the image manifest.
//
//   public/og-image.jpg   the default: home page, 404, the JSON-LD logo image
//   public/og/<page>.jpg  one per content page
//
// 1200x630 is the size every major platform crops to. Sources are the largest
// processed WebP of each photo (already rotated the right way). Square photos
// use `contain`: the whole picture centred over a blurred, darkened copy of
// itself, because a 1200x630 crop would cut the tomte caps or the candles.
//
// The page -> image mapping and each image's alt text live in
// src/components/layout/Seo.tsx (SHARE_IMAGES); keep the keys in step.
// Run after changing a source photo:  node scripts/make-og-image.mjs
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const W = 1200;
const H = 630;
const IMAGES = 'src/assets/images';

const JOBS = [
  { out: 'public/og-image.jpg', source: 'products/anglar-trio-1200', fit: 'cover' },
  // Both categories side by side: the angel and the tomte card photos.
  { out: 'public/og/produkter.jpg', sources: ['products/anglar-kort-1200', 'products/tomtar-kort-1200'], fit: 'split' },
  { out: 'public/og/anglar.jpg', source: 'products/anglar-kort-1200', fit: 'contain' },
  { out: 'public/og/tomtar.jpg', source: 'products/tomtar-kort-1200', fit: 'contain' },
  { out: 'public/og/specialtillverkning.jpg', source: 'custom/beslag-serie-1200', fit: 'cover' },
  { out: 'public/og/gjutprocessen.jpg', source: 'process/03-smaltning-1200', fit: 'cover', position: 'centre' },
  { out: 'public/og/om-oss.jpg', source: 'workshop/generationer-1200', fit: 'cover' },
  { out: 'public/og/kontakt.jpg', source: 'place/fasad-1200', fit: 'cover' },
];

mkdirSync('public/og', { recursive: true });

for (const job of JOBS) {
  const src = `${IMAGES}/${job.source}.webp`;
  let image;
  if (job.fit === 'split') {
    // Two photos, each cropped to one half, with a 4px coal seam between.
    const half = (W - 4) / 2;
    const halves = await Promise.all(job.sources.map((s) =>
      sharp(`${IMAGES}/${s}.webp`).resize(half, H, { fit: 'cover' }).toBuffer()));
    image = sharp({ create: { width: W, height: H, channels: 3, background: '#161210' } })
      .composite([{ input: halves[0], left: 0, top: 0 }, { input: halves[1], left: half + 4, top: 0 }]);
  } else if (job.fit === 'cover') {
    image = sharp(src).resize(W, H, { fit: 'cover', position: job.position ?? 'attention' });
  } else {
    const background = await sharp(src)
      .resize(W, H, { fit: 'cover' })
      .blur(28)
      .modulate({ brightness: 0.55 })
      .toBuffer();
    const foreground = await sharp(src).resize({ height: H, width: W, fit: 'inside' }).toBuffer();
    image = sharp(background).composite([{ input: foreground, gravity: 'centre' }]);
  }
  const info = await image.jpeg({ quality: 82, mozjpeg: true }).toFile(job.out);
  console.log(`${job.out}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} kB`);
}
