/**
 * Responsive-image helpers backed by the derivatives in /images/opt/.
 *
 * Kept separate from site.js so the width manifest is only pulled into
 * server-rendered .astro components and never into the client React bundle.
 */
import manifest from './image-manifest.json';

const parse = (src) => /^\/images\/([^/]+)\.(jpe?g|png|avif|webp)$/i.exec(src || '');

/** Widths that were actually generated for this image, largest last. */
const widthsFor = (name, requested) => {
  const available = manifest[name] || [];
  if (available.length === 0) return [];
  if (!requested) return available;
  const filtered = requested.filter((width) => available.includes(width));
  return filtered.length > 0 ? filtered : available;
};

/**
 * Maps /images/foo.jpg onto its pre-generated derivatives, returning srcset
 * strings for a <picture>. Falls back to the original path if the image is not
 * in the pipeline, so nothing ever renders a broken src.
 */
export const responsiveImage = (src, requestedWidths) => {
  const match = parse(src);
  if (!match) return { src, webpSrcSet: '', jpegSrcSet: '' };

  const name = match[1];
  const widths = widthsFor(name, requestedWidths);
  if (widths.length === 0) return { src, webpSrcSet: '', jpegSrcSet: '' };

  const build = (extension) =>
    widths.map((width) => `/images/opt/${name}-${width}.${extension} ${width}w`).join(', ');

  return {
    src: `/images/opt/${name}-${widths[widths.length - 1]}.jpg`,
    webpSrcSet: build('webp'),
    jpegSrcSet: build('jpg')
  };
};

/** Optimized WebP path for CSS background-image use (interior page heroes). */
export const heroBackground = (src, preferredWidth = 1200) => {
  const match = parse(src);
  if (!match) return src;

  const name = match[1];
  const widths = widthsFor(name);
  if (widths.length === 0) return src;

  // Largest available width that is no bigger than the preferred one.
  const width =
    [...widths].reverse().find((candidate) => candidate <= preferredWidth) ?? widths[0];

  return `/images/opt/${name}-${width}.webp`;
};
