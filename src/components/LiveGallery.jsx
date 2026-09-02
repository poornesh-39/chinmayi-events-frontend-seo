import { useEffect, useMemo, useState } from 'react';
import {
  apiUrl,
  categoryOrder,
  cloudinaryImage,
  cloudinaryVideoThumb,
  labelForCategory,
  normalizeCategory
} from '../data/site.js';

/**
 * `initialItems` is fetched at build time in gallery.astro so the static HTML
 * already contains every photo. Without it a crawler only ever sees the
 * loading placeholder. The mount-time fetch below still runs, so a visitor
 * gets anything uploaded since the last deploy.
 *
 * @param {{ initialItems?: any[] }} props
 */
export default function LiveGallery({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const [state, setState] = useState(initialItems.length > 0 ? 'ready' : 'loading');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const controller = new AbortController();

    // TODO: switch to a dedicated public endpoint once the backend adds one —
    // this admin route should not be readable without auth.
    fetch(`${apiUrl}/api/gallery/admin/all`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Gallery unavailable (${response.status})`);
        return response.json();
      })
      .then((data) => {
        const sortedItems = (data.galleries || []).sort((a, b) => {
          const categoryA = normalizeCategory(a.eventCategory);
          const categoryB = normalizeCategory(b.eventCategory);
          const orderA = categoryOrder.indexOf(categoryA) === -1 ? 999 : categoryOrder.indexOf(categoryA);
          const orderB = categoryOrder.indexOf(categoryB) === -1 ? 999 : categoryOrder.indexOf(categoryB);

          if (orderA !== orderB) return orderA - orderB;
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        setItems(sortedItems);
        setState('ready');
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        console.error('Failed to load gallery:', error);
        // Keep the build-time photos on screen rather than replacing a working
        // gallery with an error message.
        setState(initialItems.length > 0 ? 'ready' : 'error');
      });

    return () => controller.abort();
  }, [initialItems.length]);

  const categories = useMemo(() => {
    const uploadedCategories = [...new Set(items.map((item) => normalizeCategory(item.eventCategory)))];
    const orderedCategories = categoryOrder.filter((category) => category === 'all' || uploadedCategories.includes(category));
    const remainingCategories = uploadedCategories.filter((category) => !orderedCategories.includes(category));
    return [...orderedCategories, ...remainingCategories];
  }, [items]);

  const visibleItems = useMemo(() => {
    const filteredItems = activeCategory === 'all'
      ? items
      : items.filter((item) => normalizeCategory(item.eventCategory) === activeCategory);

    return filteredItems;
  }, [activeCategory, items]);

  if (state === 'loading') {
    return <p className="live-note">Loading recent photos...</p>;
  }

  if (state === 'error' || items.length === 0) {
    return <p className="live-note">Gallery media is being updated. Please check back soon.</p>;
  }

  return (
    <div className="recent-gallery-wrap">
      <div className="gallery-filter-row" aria-label="Filter gallery by event category">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={activeCategory === category ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {labelForCategory(category)}
          </button>
        ))}
      </div>

      <div className="live-gallery">
        {visibleItems.map((item) => {
          const isVideo = item.mediaType === 'video';
          const url = item.cloudinaryUrl || '';

          return (
            <figure key={item._id}>
              {isVideo ? (
                <video
                  src={url}
                  poster={cloudinaryVideoThumb(url)}
                  aria-label={`${item.title || 'Event video'} by Chinmayi Events`}
                  muted
                  loop
                  playsInline
                  controls
                  preload="none"
                />
              ) : (
                <img
                  src={cloudinaryImage(url, 800)}
                  srcSet={`${cloudinaryImage(url, 400)} 400w, ${cloudinaryImage(url, 800)} 800w, ${cloudinaryImage(url, 1200)} 1200w`}
                  sizes="(max-width: 760px) 50vw, (max-width: 980px) 33vw, 25vw"
                  alt={`${item.title || 'Event decoration'} by Chinmayi Events`}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </figure>
          );
        })}
      </div>
    </div>
  );
}

