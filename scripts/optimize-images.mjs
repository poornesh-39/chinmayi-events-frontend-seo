/**
 * Generates responsive WebP + JPEG derivatives for everything in public/images.
 *
 * Originals are never modified — derivatives land in public/images/opt/ as
 * <name>-<width>.webp and <name>-<width>.jpg, which `responsiveImage()` in
 * src/data/site.js turns into srcset strings.
 *
 * Run with: npm run images
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = 'public/images';
const OUTPUT_DIR = 'public/images/opt';
const MANIFEST_PATH = 'src/data/image-manifest.json';
const WIDTHS = [400, 800, 1200, 1600];
const SOURCE_PATTERN = /\.(jpe?g|png|avif|webp)$/i;

// The logo renders in small circles, so it only needs square crops.
const LOGO_FILE = 'chinmayi-events-logo.jpeg';
const LOGO_WIDTHS = [64, 128, 192, 256, 512];

/**
 * Home-screen icons cannot be transparent — iOS composites them onto black and
 * Android onto the surface colour, either of which would lose the gold. These
 * get the brand maroon behind them instead.
 */
const ICON_WIDTHS = [180, 192, 512];
const ICON_BACKGROUND = { r: 0x6e, g: 0x1f, b: 0x2f, alpha: 1 };

/**
 * Keys the flat dark backdrop out of the supplied logo and returns a PNG with
 * a real alpha channel.
 *
 * The source is gold artwork on a near-neutral charcoal field that carries a
 * slight vignette (roughly 37-58 per channel corner to corner), so a hard
 * colour match would leave a dirty halo. Instead each pixel's distance from the
 * sampled backdrop drives a soft ramp, and surviving pixels are un-mixed with
 * `fg = (px - bg * (1 - a)) / a` to strip the dark fringe the original
 * anti-aliasing baked in. Without that un-mix the edges read as a grey outline
 * once the logo sits on the light header.
 */
const keyOutBackdrop = async (source) => {
  const { data, info } = await sharp(source)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const at = (x, y) => (y * width + x) * channels;

  // Sample the four corners; they are backdrop on every version of this asset.
  const patch = 12;
  let sr = 0;
  let sg = 0;
  let sb = 0;
  let samples = 0;
  for (const [ox, oy] of [
    [0, 0],
    [width - patch, 0],
    [0, height - patch],
    [width - patch, height - patch]
  ]) {
    for (let y = oy; y < oy + patch; y += 1) {
      for (let x = ox; x < ox + patch; x += 1) {
        const i = at(x, y);
        sr += data[i];
        sg += data[i + 1];
        sb += data[i + 2];
        samples += 1;
      }
    }
  }

  const bg = [sr / samples, sg / samples, sb / samples];

  // Below LOW the pixel is backdrop, above HIGH it is artwork; between the two
  // it is an anti-aliased edge and keeps partial alpha. Measured over the
  // known-backdrop borders of the source, JPEG noise reaches a distance of
  // ~34, so LOW sits above that — at 22 the tail survived as a faint haze
  // across the whole canvas.
  const LOW = 36;
  const HIGH = 64;

  const out = Buffer.alloc(width * height * 4);
  for (let p = 0; p < width * height; p += 1) {
    const i = p * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const distance = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
    const alpha = Math.min(1, Math.max(0, (distance - LOW) / (HIGH - LOW)));

    const o = p * 4;
    if (alpha <= 0) {
      out[o] = 0;
      out[o + 1] = 0;
      out[o + 2] = 0;
      out[o + 3] = 0;
      continue;
    }

    const unmix = (value, backdrop) =>
      Math.round(Math.min(255, Math.max(0, (value - backdrop * (1 - alpha)) / alpha)));

    out[o] = unmix(r, bg[0]);
    out[o + 1] = unmix(g, bg[1]);
    out[o + 2] = unmix(b, bg[2]);
    out[o + 3] = Math.round(alpha * 255);
  }

  // Re-centre on a square canvas.
  //
  // The artwork is not centred in the source: it sits about 3% high and fills
  // only ~78% of the frame. The old opaque backdrop hid that, because the
  // black square itself defined the visual box. With the backdrop gone the
  // artwork is the box, so it has to be trimmed to its own bounds and padded
  // evenly or it reads as floating high in the header.
  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (out[(y * width + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) return sharp(out, { raw: { width, height, channels: 4 } }).png().toBuffer();

  const boxWidth = maxX - minX + 1;
  const boxHeight = maxY - minY + 1;
  // A little breathing room so the crest never touches the edge of the frame.
  const side = Math.ceil(Math.max(boxWidth, boxHeight) * 1.06);
  const left = Math.round((side - boxWidth) / 2);
  const top = Math.round((side - boxHeight) / 2);

  return sharp(out, { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: boxWidth, height: boxHeight })
    .extend({
      top,
      bottom: side - boxHeight - top,
      left,
      right: side - boxWidth - left,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();
};

mkdirSync(OUTPUT_DIR, { recursive: true });

const baseName = (file) => file.replace(SOURCE_PATTERN, '');

let generated = 0;
let skipped = 0;

const encoders = {
  webp: (pipeline) => pipeline.webp({ quality: 82, effort: 5 }),
  jpeg: (pipeline) => pipeline.jpeg({ quality: 78, mozjpeg: true, progressive: true }),
  png: (pipeline) => pipeline.png({ compressionLevel: 9 })
};

const emit = async (pipeline, outPath, format) => {
  if (existsSync(outPath)) {
    skipped += 1;
    return;
  }

  await encoders[format](pipeline.clone()).toFile(outPath);
  generated += 1;
};

const run = async () => {
  const files = readdirSync(SOURCE_DIR).filter(
    (file) => SOURCE_PATTERN.test(file) && statSync(path.join(SOURCE_DIR, file)).isFile()
  );

  // Records which widths actually exist per image, so the srcset helpers never
  // advertise a derivative that was skipped to avoid upscaling.
  const manifest = {};

  for (const file of files) {
    const source = path.join(SOURCE_DIR, file);
    const name = baseName(file);
    const metadata = await sharp(source).metadata();

    if (file === LOGO_FILE) {
      const transparent = await keyOutBackdrop(source);

      for (const width of LOGO_WIDTHS) {
        // Same square framing as before — only the backdrop changes.
        const pipeline = sharp(transparent).resize(width, width, {
          fit: 'cover',
          position: 'centre'
        });
        await emit(pipeline, path.join(OUTPUT_DIR, `${name}-${width}.webp`), 'webp');
        await emit(pipeline, path.join(OUTPUT_DIR, `${name}-${width}.png`), 'png');
        // JPEG has no alpha; this is only a fallback, so give it the brand
        // colour rather than letting the encoder decide.
        await emit(
          sharp(transparent)
            .resize(width, width, { fit: 'cover', position: 'centre' })
            .flatten({ background: ICON_BACKGROUND }),
          path.join(OUTPUT_DIR, `${name}-${width}.jpg`),
          'jpeg'
        );
      }

      for (const width of ICON_WIDTHS) {
        await emit(
          sharp(transparent)
            .resize(width, width, { fit: 'cover', position: 'centre' })
            .flatten({ background: ICON_BACKGROUND }),
          path.join(OUTPUT_DIR, `${name}-icon-${width}.png`),
          'png'
        );
      }

      manifest[name] = LOGO_WIDTHS;
      continue;
    }

    // Never upscale — only emit widths the original can actually satisfy.
    const sourceWidth = metadata.width ?? 0;
    const targets = WIDTHS.filter((width) => width <= sourceWidth);
    if (targets.length === 0 && sourceWidth > 0) targets.push(sourceWidth);

    for (const width of targets) {
      const pipeline = sharp(source).resize({ width, withoutEnlargement: true });
      await emit(pipeline, path.join(OUTPUT_DIR, `${name}-${width}.webp`), 'webp');
      await emit(pipeline, path.join(OUTPUT_DIR, `${name}-${width}.jpg`), 'jpeg');
    }

    manifest[name] = targets;
  }

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(
    `Images: ${generated} generated, ${skipped} already present, ${Object.keys(manifest).length} in manifest.`
  );
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
