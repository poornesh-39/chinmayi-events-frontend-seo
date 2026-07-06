import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../data/site.js';

const categoryOrder = [
  'all',
  'wedding',
  'reception',
  'engagement',
  'haldi(pre-wedding)',
  'housewarming',
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
  birthday: 'Birthday',
  'naming-ceremony': 'Naming Ceremony',
  corporate: 'Corporate',
  other: 'Other'
};

const normalizeCategory = (value) => String(value || 'other').trim().toLowerCase();

const labelForCategory = (category) =>
  categoryLabels[category] || category.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const thumbnailFor = (item) => {
  const url = item?.cloudinaryUrl || '';
  if (!url || !url.includes('cloudinary')) return url;
  if (item.mediaType !== 'video') {
    return url.replace('/upload/', '/upload/c_fill,w_720,h_520,q_auto,f_auto/');
  }
  return url
    .replace('/upload/', '/upload/c_fill,w_720,h_520,q_auto,f_auto/')
    .replace(/\.(mp4|webm)$/i, '.jpg');
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

    return filteredItems.slice(0, 18);
  }, [activeCategory, items]);

  if (state === 'loading') {
    return <p className="live-note">Loading recent photos...</p>;
  }

  if (state === 'error' || items.length === 0) {
    return <p className="live-note">Recent photos are being updated. Please check the featured work above.</p>;
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
          const category = normalizeCategory(item.eventCategory);

          return (
            <article key={item._id}>
              <img src={thumbnailFor(item)} alt={`${item.title} by Chinmayi Events`} loading="lazy" />
              <div>
                <h3>{item.title}</h3>
                <p>{labelForCategory(category)} · {item.mediaType === 'video' ? 'Video' : 'Photo'}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
