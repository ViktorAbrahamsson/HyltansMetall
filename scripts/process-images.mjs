/**
 * Turns raw photos from the (gitignored) inbox into the sorted, web-sized WebP
 * assets that the site imports.
 *
 * Usage:  INBOX=/path/to/inbox node scripts/process-images.mjs
 *         (defaults to <repo>/src/assets/images/inbox)
 *
 * Each job emits several widths plus a ~20px blurred placeholder, and the whole
 * set is written out as src/assets/images/manifest.ts. Components read the
 * manifest rather than importing .webp files directly, so srcset and the
 * placeholder travel together with the image.
 *
 * Orientation: most of these photos carry EXIF orientation=6, but a few were
 * cropped in an editor that rotated the pixels and kept the tag anyway. Trusting
 * the tag blindly would turn those 90 degrees. `rotate` below is therefore set
 * per file from visual inspection, not read from EXIF.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INBOX = process.env.INBOX || path.join(root, 'src/assets/images/inbox');
const OUT = path.join(root, 'src/assets/images');

// WebP quality for every rendered width (the blur placeholder has its own).
const QUALITY = 80;
const BLUR_WIDTH = 20;

/**
 * Target aspect ratios and the widths rendered for each. Widths above the
 * source's own width are skipped so nothing is upscaled.
 */
// The 640 rung serves the common phone case: a photo across the content width
// (~342-364 CSS px) at 1.75-2x density needs ~600-640px, and the ladder used
// to jump from 400 straight to 800 (PageSpeed flagged ~240 KB extra on mobile).
const SHAPES = {
  portrait: { ratio: 4 / 5, widths: [400, 640, 800] },
  landscape: { ratio: 3 / 2, widths: [400, 640, 800, 1200] },
  square: { ratio: 1, widths: [400, 640, 800, 1200] },
  strip: { ratio: 3 / 2, widths: [400, 640, 800, 1200] },
  wide: { ratio: 16 / 9, widths: [800, 1400, 1800] },
  banner: { ratio: 3.2, widths: [800, 1200, 1600] },
  // No ratio: keeps the source's own proportions and its transparency. For
  // small cut-outs drawn at a fixed height, so the widths are 1x/2x/3x.
  cutout: { ratio: null, widths: [32, 64, 96] },
};

/**
 * `rotate: true`  -> EXIF tag is correct, bake the rotation in.
 * `rotate: false` -> pixels are already upright, ignore the (stale) tag.
 * `crop`          -> where the subject sits; 'attention' lets sharp pick.
 * `preCrop`       -> optional {left,top,width,height} on the *source* pixels,
 *                    applied before rotation. For cutting something out of frame
 *                    that no automatic crop would know to avoid.
 * `trim`          -> cut away transparent margins first (cut-outs only).
 * `angle`         -> fixed clockwise turn in degrees, after the preCrop (which
 *                    it requires). For a photo shot sideways with no EXIF tag.
 */
const JOBS = [
  // --- Products -----------------------------------------------------------
  { src: 'polerade-produkter-hakan.jpg', out: 'products/ljusstakar', shape: 'landscape', rotate: true, crop: 'attention' },
  // Category card photos, square: the tomte family stands cap to foot in a
  // tall frame and any landscape cut takes the caps off, while a square holds
  // all three. The angel card uses the pair with candles from its own page.
  // preCrop is in raw pixels; angle 90 does what tomtefamilj's EXIF 6 would.
  {
    src: 'tomtar/tomtefamilj.jpg',
    out: 'products/tomtar-kort',
    shape: 'square',
    rotate: false,
    crop: 'center',
    preCrop: { left: 621, top: 0, width: 3024, height: 3024 },
    angle: 90,
  },
  {
    src: 'round3/angel-par.jpg',
    out: 'products/anglar-kort',
    shape: 'square',
    rotate: false,
    crop: 'center',
    preCrop: { left: 1146, top: 0, width: 1848, height: 1848 },
  },

  // --- Tomtar ---------------------------------------------------------------
  // Shot outdoors on moss. All five are 3:4 portraits with a correct EXIF tag,
  // and every one of them is a standing figure that fills the frame top to
  // bottom. A landscape crop therefore keeps only the middle half of the height
  // and takes the cap tips with it — tried, and it beheaded both group shots —
  // so these all stay in the portrait frame, which loses ~6% of the height.
  { src: 'tomtar/tomtefar.jpg', out: 'products/tomtefar', shape: 'portrait', rotate: true, crop: 'attention' },
  { src: 'tomtar/tomtemor.jpg', out: 'products/tomtemor', shape: 'portrait', rotate: true, crop: 'attention' },
  { src: 'tomtar/tomtenisse.jpg', out: 'products/tomtenisse', shape: 'portrait', rotate: true, crop: 'attention' },
  { src: 'tomtar/tomtefamilj.jpg', out: 'products/tomtar-familj', shape: 'portrait', rotate: true, crop: 'attention' },
  { src: 'tomtar/tomtefar-tomtemor.jpg', out: 'products/tomtar-paret', shape: 'portrait', rotate: true, crop: 'attention' },
  // Round 4: 4000x1848 phone shots with upright pixels (orientation 1). Each
  // preCrop is already the target ratio, placed on the figures by eye.
  // Seven standing tomtar on a windowsill: 3:2 around the whole row.
  {
    src: 'round4/tomtar-fonster.jpg',
    out: 'products/tomtar-fonster',
    shape: 'landscape',
    rotate: false,
    crop: 'center',
    preCrop: { left: 644, top: 0, width: 2772, height: 1848 },
  },
  // The same row, the two in focus at the front: 4:5 around them.
  {
    src: 'round4/tomtar-fonster-nara.jpg',
    out: 'products/tomtar-fonster-nara',
    shape: 'portrait',
    rotate: false,
    crop: 'center',
    preCrop: { left: 1032, top: 0, width: 1478, height: 1848 },
  },
  // The reclining tomte on leather: one in focus, then four together.
  {
    src: 'round4/liggande-tomte.jpg',
    out: 'products/liggande-tomte',
    shape: 'landscape',
    rotate: false,
    crop: 'center',
    preCrop: { left: 200, top: 0, width: 2772, height: 1848 },
  },
  {
    src: 'round4/liggande-tomtar.jpg',
    out: 'products/liggande-tomtar',
    shape: 'landscape',
    rotate: false,
    crop: 'center',
    preCrop: { left: 385, top: 0, width: 2772, height: 1848 },
  },

  // --- Änglar -------------------------------------------------------------
  // Shot on a barrel top, 4000x1848 with upright pixels; the figures sit in
  // the middle of the frame, so a plain centre crop keeps them whole.
  { src: 'round3/angel-par.jpg', out: 'products/angel', shape: 'landscape', rotate: false, crop: 'center' },
  { src: 'round3/anglar-trio.jpg', out: 'products/anglar-trio', shape: 'landscape', rotate: false, crop: 'center' },
  { src: 'round3/anglar-verkstad.jpg', out: 'products/anglar-verkstad', shape: 'landscape', rotate: true, crop: 'attention' },
  // Same barrel, two more angles. Tall with the candles, so 4:5; preCrop is
  // already 4:5 and centred on the pair, which sit a little off-centre.
  {
    src: 'round3/angel-sida.jpg',
    out: 'products/angel-sida',
    shape: 'portrait',
    rotate: false,
    crop: 'center',
    preCrop: { left: 1318, top: 0, width: 1478, height: 1848 },
  },
  {
    src: 'round3/angel-snett.jpg',
    out: 'products/angel-snett',
    shape: 'portrait',
    rotate: false,
    crop: 'center',
    preCrop: { left: 1375, top: 0, width: 1478, height: 1848 },
  },

  // --- Specialtillverkning: earlier commissions -----------------------------
  // The "Tidigare arbeten" grid alternates portrait and landscape tiles, so
  // each piece is cut to whichever frame its subject suits. The tiles fill
  // their cells with object-fit, so a landscape cut lands at ~1.6:1 on screen.
  // Shot with the plates standing on end; turned so the names read across.
  // preCrop trims the source top so the plates stay centred once turned.
  {
    src: 'round3/namnskyltar.jpg',
    out: 'custom/namnskyltar',
    shape: 'landscape',
    rotate: false,
    crop: 'center',
    preCrop: { left: 0, top: 300, width: 1536, height: 1748 },
    angle: 270,
  },
  { src: 'round3/namnskyltar-ra.jpg', out: 'custom/namnskyltar-ra', shape: 'portrait', rotate: false, crop: 'attention' },
  { src: 'round3/klockor.jpg', out: 'custom/klockor', shape: 'landscape', rotate: true, crop: 'attention' },
  { src: 'round3/plakett.jpg', out: 'custom/plakett', shape: 'portrait', rotate: true, crop: 'center' },
  { src: 'round3/ringar.jpg', out: 'custom/ringar', shape: 'portrait', rotate: true, crop: 'attention' },
  { src: 'round3/beslag.jpg', out: 'custom/beslag', shape: 'landscape', rotate: true, crop: 'attention' },
  // Not in the grid: the photo beside "Vad vi gjuter", so landscape.
  { src: 'round3/beslag-serie.jpg', out: 'custom/beslag-serie', shape: 'landscape', rotate: true, crop: 'center' },
  // Two script pieces side by side, so it is cut wide; preCrop centres the
  // lettering.
  {
    src: 'round3/sweet-sixteen.jpg',
    out: 'custom/sweet-sixteen',
    shape: 'wide',
    rotate: false,
    crop: 'center',
    preCrop: { left: 170, top: 266, width: 3200, height: 1600 },
  },
  // Two identical plaques side by side; the landscape frame holds both.
  { src: 'round3/kalmar.jpg', out: 'custom/kalmar', shape: 'landscape', rotate: false, crop: 'center' },
  // Older inbox photos of the foundry's own pieces, added to the same grid.
  // EXIF orientation is correct on these (checked by eye).
  { src: 'klocka.jpg', out: 'custom/pendyl', shape: 'portrait', rotate: true, crop: 'center' },
  { src: 'kraftor.jpg', out: 'custom/kraftor', shape: 'portrait', rotate: true, crop: 'attention' },
  // These two are tall shots cut to landscape, and 'attention' picked the box
  // lid and the blurred background. preCrop picks the band with the pieces in
  // it, in raw (unrotated) pixels, then angle 90 does what EXIF tag 6 would.
  {
    src: 'kraftor-2.jpg',
    out: 'custom/kraftor-ask',
    shape: 'landscape',
    rotate: false,
    crop: 'center',
    preCrop: { left: 1784, top: 0, width: 1232, height: 1848 },
    angle: 90,
  },
  { src: 'fagel.jpg', out: 'custom/faglar-mossa', shape: 'landscape', rotate: true, crop: 'attention' },
  {
    src: 'faglar-3.jpg',
    out: 'custom/faglar-rad',
    shape: 'landscape',
    rotate: false,
    crop: 'center',
    preCrop: { left: 1344, top: 0, width: 1232, height: 1848 },
    angle: 90,
  },

  // --- Process steps (order matches ManufacturingPage copy) ---------------
  // A square shot; 'attention' locked onto the face and cut the models out.
  // preCrop frames the models (cross piece and horseshoe) on the mould plate,
  // with the hands placing them, already at 3:2.
  {
    src: 'next-generation-3.jpg',
    out: 'process/01-modell',
    shape: 'landscape',
    rotate: false,
    crop: 'center',
    preCrop: { left: 90, top: 520, width: 900, height: 600 },
  },
  { src: 'formpackning.jpg', out: 'process/02-sandpackning', shape: 'landscape', rotate: true, crop: 'center' },
  { src: 'ugn-2.jpg', out: 'process/03-smaltning', shape: 'landscape', rotate: false, crop: 'attention' },
  { src: 'form-ten.jpg', out: 'process/04-gjutning', shape: 'landscape', rotate: false, crop: 'attention' },
  // No EXIF orientation tag at all, so there is no rotation to get wrong here.
  { src: 'fardiga-produkter-ten.jpg', out: 'process/05-rensning', shape: 'landscape', rotate: false, crop: 'attention' },

  // --- Workshop / people ---------------------------------------------------
  // The painted foundry-worker figurine on its own, beside the home page's
  // "Hantverket lever vidare". 4000x1848 with the figure dead centre.
  { src: 'round3/gjutarfigur.jpg', out: 'workshop/gjutarfigur', shape: 'portrait', rotate: false, crop: 'center' },
  { src: 'next-generation.jpg', out: 'workshop/generationer', shape: 'strip', rotate: false, crop: 'attention' },
  { src: 'next-generation-2.jpg', out: 'workshop/larling', shape: 'strip', rotate: false, crop: 'attention' },
  { src: 'form-metall.jpg', out: 'workshop/deglar', shape: 'strip', rotate: true, crop: 'attention' },
  { src: 'kol.jpg', out: 'workshop/kol', shape: 'strip', rotate: true, crop: 'attention' },
  { src: 'polerade-produkter-hakan.jpg', out: 'workshop/polerat', shape: 'strip', rotate: true, crop: 'attention' },

  // --- History -------------------------------------------------------------
  // A phone photo of a framed black-and-white print, taken sideways. preCrop
  // drops the frame edge (source left = picture bottom), angle stands it up.
  {
    src: 'round3/arkiv-gjutare.jpg',
    out: 'history/arkiv-gjutare',
    shape: 'landscape',
    rotate: false,
    crop: 'north',
    preCrop: { left: 36, top: 0, width: 1750, height: 2310 },
    angle: 270,
  },
  // Håkan, Lars and Bengt, photographed for National Geographic: a phone shot
  // of the printed page. Cropped from the bottom so the magazine's logo, in the
  // lower right corner, stays whole.
  { src: 'round3/national-geographic.jpg', out: 'history/national-geographic', shape: 'landscape', rotate: false, crop: 'south' },

  // --- Place ---------------------------------------------------------------
  { src: 'fasad-malning.jpg', out: 'place/fasad', shape: 'strip', rotate: true, crop: 'attention' },
  { src: 'fonster.jpg', out: 'place/natt', shape: 'wide', rotate: true, crop: 'attention' },

  // --- Brand ---------------------------------------------------------------
  // The foundry-worker figure from the old site's header, a transparent PNG.
  { src: 'gjutare.png', out: 'brand/gjutare', shape: 'cutout', rotate: false, trim: true },

  // --- Hero ----------------------------------------------------------------
  // preCrop trims the source top, which becomes the band's right edge after the
  // CW rotation, to keep bystanders' legs out of frame.
  {
    src: 'fardiga-produkter.jpg',
    out: 'hero/gjutgods',
    shape: 'banner',
    rotate: true,
    crop: 'center',
    preCrop: { left: 0, top: 1100, width: 4032, height: 1924 },
  },
];

if (!existsSync(INBOX)) {
  console.error(`Inbox not found: ${INBOX}\nSet INBOX=<path> or create the folder.`);
  process.exit(1);
}

/** Source dimensions as they will be *after* any preCrop and rotation. */
async function sourceSize(file, rotate, preCrop, angle) {
  const meta = await sharp(file).metadata();
  const w = preCrop ? preCrop.width : meta.width;
  const h = preCrop ? preCrop.height : meta.height;
  const swap =
    (rotate && meta.orientation && meta.orientation >= 5) ||
    (angle && angle % 180 !== 0);
  return swap ? { w: h, h: w } : { w, h };
}

const identifier = (out, width) =>
  out.replace(/[^a-zA-Z0-9]+/g, '_') + '_' + width;

const entries = [];
let failed = 0;

for (const job of JOBS) {
  const from = path.join(INBOX, job.src);
  if (!existsSync(from)) {
    console.error(`  MISSING  ${job.src}`);
    failed++;
    continue;
  }

  const shape = SHAPES[job.shape];
  const source = await sourceSize(from, job.rotate, job.preCrop, job.angle);

  // Never render wider than the source. Where the source falls between two
  // rungs of the ladder, add its own width so we use every pixel it has
  // (several of these photos are only ~620px wide once rotated).
  let widths = shape.widths.filter((w) => w <= source.w);
  const widest = shape.widths[shape.widths.length - 1];
  if (source.w < widest && !widths.includes(source.w)) widths.push(source.w);
  if (widths.length === 0) widths = [source.w];
  widths.sort((a, b) => a - b);

  const position =
    job.crop === 'attention' ? sharp.strategy.attention : job.crop;

  // A fixed angle is baked into an intermediate buffer first: chained in one
  // pipeline with extract and resize, it did not apply in call order and the
  // output was a zoomed-in, unrotated corner of the picture.
  const input = job.angle
    ? await sharp(from, { failOn: 'none' })
        .extract(job.preCrop)
        .rotate(job.angle)
        .toBuffer()
    : from;

  const render = (width) => {
    const pipeline = sharp(input, { failOn: 'none' });
    if (job.preCrop && !job.angle) pipeline.extract(job.preCrop);
    if (job.trim) pipeline.trim();
    if (job.rotate) pipeline.rotate();
    if (!shape.ratio) return pipeline.resize(width);
    return pipeline.resize(width, Math.round(width / shape.ratio), {
      fit: 'cover',
      position,
      withoutEnlargement: false,
    });
  };

  const rendered = [];
  for (const width of widths) {
    const dest = path.join(OUT, `${job.out}-${width}.webp`);
    mkdirSync(path.dirname(dest), { recursive: true });
    const info = await render(width).webp({ quality: QUALITY, effort: 5 }).toFile(dest);
    rendered.push({ width: info.width, height: info.height, bytes: info.size });
  }

  // Placeholder: tiny, heavily compressed, inlined as a data URI.
  const blurBuf = await render(BLUR_WIDTH).webp({ quality: 30, effort: 6 }).toBuffer();
  const blur = `data:image/webp;base64,${blurBuf.toString('base64')}`;

  const largest = rendered[rendered.length - 1];
  entries.push({ out: job.out, widths: rendered, largest, blur });

  const total = rendered.reduce((sum, r) => sum + r.bytes, 0);
  console.log(
    `  ${job.out}`.padEnd(34) +
      `${rendered.map((r) => r.width).join('/')}`.padEnd(16) +
      `${(total / 1024).toFixed(0)} KB total, blur ${(blur.length / 1024).toFixed(1)} KB`
  );
}

// ─── Manifest ────────────────────────────────────────────────────────────────
const imports = entries
  .flatMap((e) =>
    e.widths.map(
      (r) =>
        `import ${identifier(e.out, r.width)} from './${e.out}-${r.width}.webp';`
    )
  )
  .join('\n');

const body = entries
  .map((e) => {
    const srcSet = e.widths
      .map((r) => `\${${identifier(e.out, r.width)}} ${r.width}w`)
      .join(', ');
    return `  '${e.out}': {
    src: ${identifier(e.out, e.largest.width)},
    srcSet: \`${srcSet}\`,
    width: ${e.largest.width},
    height: ${e.largest.height},
    blur: '${e.blur}',
  },`;
  })
  .join('\n');

const manifest = `// AUTO-GENERATED by scripts/process-images.mjs — do not edit by hand.
// Re-run: INBOX=<path> node scripts/process-images.mjs

${imports}

export interface ResponsiveImage {
  /** Largest rendered width, used as the src fallback. */
  src: string;
  srcSet: string;
  width: number;
  height: number;
  /** Tiny blurred placeholder, inlined as a data URI. */
  blur: string;
}

export const images = {
${body}
} satisfies Record<string, ResponsiveImage>;

export type ImageKey = keyof typeof images;
`;

writeFileSync(path.join(OUT, 'manifest.ts'), manifest, 'utf8');

console.log(`\n${entries.length} images written, ${failed} failed.`);
console.log('manifest: src/assets/images/manifest.ts');
if (failed) process.exit(1);
