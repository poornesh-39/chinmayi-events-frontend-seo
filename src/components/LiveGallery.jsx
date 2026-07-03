import { useEffect, useState } from 'react';
import { apiUrl } from '../data/site.js';

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

  useEffect(() => {
    fetch(`${apiUrl}/api/gallery/admin/all`)
      .then((response) => {
        if (!response.ok) throw new Error('Gallery unavailable');
        return response.json();
      })
      .then((data) => {
        setItems((data.galleries || []).slice(0, 12));
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  if (state === 'loading') {
    return <p className="live-note">Loading live gallery...</p>;
  }

  if (state === 'error' || items.length === 0) {
    return <p className="live-note">Live gallery is being updated. Please check the featured work above.</p>;
  }

  return (
    <div className="live-gallery">
      {items.map((item) => (
        <article key={item._id}>
          <img src={thumbnailFor(item)} alt={`${item.title} by Chinmayi Events`} loading="lazy" />
          <div>
            <h3>{item.title}</h3>
            <p>{item.eventCategory} · {item.mediaType}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
