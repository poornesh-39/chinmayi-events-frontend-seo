/**
 * Build-time reads of the backend, so admin-managed content ships as real HTML.
 *
 * The gallery and the testimonials used to exist only inside client islands
 * that fetch on mount. Crawlers render the page before those requests resolve,
 * so Google indexed a "Loading recent photos..." placeholder and none of the
 * review text — the strongest local-SEO signal the business has.
 *
 * These helpers run in the Astro frontmatter during `astro build`, so the same
 * data is baked into the static HTML. The islands still hydrate on top and
 * refresh in the browser; this only changes what a crawler sees first.
 *
 * The backend sleeps on Render's free tier, so a cold start can outlast the
 * timeout. Every failure degrades to an empty list and the island fills in
 * client-side exactly as before — a slow backend must never fail the build.
 */
import { apiUrl, categoryOrder, normalizeCategory } from './site.js';

/**
 * @typedef {Object} GalleryItem
 * @property {string} [_id]
 * @property {string} [title]
 * @property {string} [eventCategory]
 * @property {string} [cloudinaryUrl]
 * @property {string} [mediaType]
 * @property {boolean} [isHighlight]
 * @property {string} [createdAt]
 * @property {string} [uploadedAt]
 *
 * @typedef {Object} Experience
 * @property {string} [_id]
 * @property {string} [fullName]
 * @property {string} [eventType]
 * @property {number} [rating]
 * @property {string} [experience]
 * @property {string} [createdAt]
 */

const TIMEOUT_MS = 20000;

const getJson = async (path) => {
  if (!apiUrl) {
    console.warn(`[live-content] PUBLIC_API_URL is unset — skipping ${path}`);
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${apiUrl}${path}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(
      `[live-content] ${path} unavailable at build time (${error.message}) — ` +
        'the page will fall back to client-side loading.'
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Newest-first testimonials, matching what TestimonialsPanel expects.
 * @returns {Promise<Experience[]>}
 */
export const getExperiences = async () => {
  const data = await getJson('/api/experience');
  return Array.isArray(data) ? data : [];
};

/**
 * Gallery items in the same order LiveGallery sorts them into, so the
 * server-rendered markup and the hydrated markup agree.
 * @returns {Promise<GalleryItem[]>}
 */
export const getGalleryItems = async () => {
  const data = await getJson('/api/gallery/admin/all');
  const galleries = Array.isArray(data?.galleries) ? data.galleries : [];

  const rank = (item) => {
    const index = categoryOrder.indexOf(normalizeCategory(item.eventCategory));
    return index === -1 ? 999 : index;
  };

  return [...galleries].sort((a, b) => {
    const difference = rank(a) - rank(b);
    if (difference !== 0) return difference;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
};

/**
 * Real AggregateRating input. Returns null below a small threshold so the
 * schema is only emitted when it reflects genuine reviews shown on the page.
 */
export const ratingSummary = (/** @type {Experience[]} */ experiences) => {
  const ratings = (experiences || [])
    .map((item) => Number(item?.rating))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 5);

  if (ratings.length < 3) return null;

  const total = ratings.reduce((sum, value) => sum + value, 0);
  return {
    ratingValue: (total / ratings.length).toFixed(1),
    reviewCount: ratings.length
  };
};

/**
 * Most recent gallery images, used for the image entries in the sitemap.
 * @param {GalleryItem[]} items
 * @param {number} [limit]
 * @returns {{ url: string, title: string }[]}
 */
export const galleryImageUrls = (items, limit = 40) =>
  (items || [])
    .filter((item) => item?.mediaType !== 'video' && item?.cloudinaryUrl)
    .slice(0, limit)
    .map((item) => ({
      url: String(item.cloudinaryUrl),
      title: item.title || 'Event decoration by Chinmayi Events'
    }));
