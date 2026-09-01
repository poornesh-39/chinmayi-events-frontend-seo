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

mkdirSync(OUTPUT_DIR, { recursive: true });

const baseName = (file) => file.replace(SOURCE_PATTERN, '');

let generated = 0;
let skipped = 0;

const encoders = {
  webp: (pipeline) => pipeline.webp({ quality: 76, effort: 5 }),
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
      for (const width of LOGO_WIDTHS) {
        const pipeline = sharp(source).resize(width, width, { fit: 'cover', position: 'centre' });
        await emit(pipeline, path.join(OUTPUT_DIR, `${name}-${width}.webp`), 'webp');
        await emit(pipeline, path.join(OUTPUT_DIR, `${name}-${width}.jpg`), 'jpeg');
        // PWA manifest icons must be PNG.
        await emit(pipeline, path.join(OUTPUT_DIR, `${name}-${width}.png`), 'png');
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
