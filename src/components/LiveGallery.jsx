import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../data/site.js';

const categoryOrder = [
  'all',
  'wedding',
  'reception',
  'engagement',
  'haldi(pre-wedding)',
  'housewarming',
  'outdoor',
  'vehicle',
  'birthday',
  'naming-ceremony',
  'corporate',
  'other'
];

const categoryLabels = {
  all: 'All',
  wedding: 'Wedding',
  reception: 'Reception',
  engagement: 'Engagement',
  'haldi(pre-wedding)': 'Pre-Wedding',
  housewarming: 'House Warming',
  outdoor: 'Outdoor',
  vehicle: 'Vehicle',
  birthday: 'Birthday',
  'naming-ceremony': 'Naming Ceremony',
  corporate: 'Corporate',
  other: 'Other'
};

const normalizeCategory = (value) => String(value || 'other').trim().toLowerCase();

const labelForCategory = (category) =>
  categoryLabels[category] || category.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const imageFor = (item) => {
  const url = item?.cloudinaryUrl || '';
  if (!url || !url.includes('cloudinary')) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto/');
};

export default function LiveGallery() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState('loading');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetch(`${apiUrl}/api/gallery/admin/all`)
      .then((response) => {
        if (!response.ok) throw new Error('Gallery unavailable');
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
      .catch(() => setState('error'));
  }, []);

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
          const mediaUrl = isVideo ? item.cloudinaryUrl : imageFor(item);

          return (
            <figure key={item._id}>
              {isVideo ? (
                <video
                  src={mediaUrl}
                  aria-label={`${item.title || 'Event video'} by Chinmayi Events`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                />
              ) : (
                <img src={mediaUrl} alt={`${item.title || 'Event decoration'} by Chinmayi Events`} loading="lazy" />
              )}
            </figure>
          );
        })}
      </div>
    </div>
  );
}

