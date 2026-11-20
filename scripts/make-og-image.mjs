// Builds public/og-image.jpg, the picture shown when a link to the site is
// shared (Facebook, LinkedIn, Messenger, Slack...). Those crawlers do not run
// JavaScript and want a plain JPEG at a stable URL, so it lives in public/
// rather than going through the image manifest.
//
// 1200x630 is the size every major platform crops to. Run after changing the
// source photo:  node scripts/make-og-image.mjs
import sharp from 'sharp';

const SOURCE = 'src/assets/images/products/anglar-trio-1200.webp';
const OUT = 'public/og-image.jpg';

const info = await sharp(SOURCE)
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUT);

console.log(`${OUT}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} kB`);
