import { useEffect, useState } from 'react';
import { apiUrl, cloudinaryVideoThumb, eventTypes } from '../data/site.js';
import QuotationTool from './QuotationTool.jsx';
import './AdminPanel.css';

const credentials = {
  email: 'admin@chinmayievents.com',
  password: 'admin123'
};

const categories = eventTypes;

const videoThumb = (url) => cloudinaryVideoThumb(url, 720);

// Below this width, opening the original media in a new tab is clumsy on a
// phone browser — show it in an in-page lightbox instead. Matches the
// breakpoint the gallery card layout itself switches on.
const MOBILE_PREVIEW_QUERY = '(max-width: 720px)';

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('gallery');
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventCategory: '',
    file: null
  });

  const loadGallery = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/gallery/admin/all`);
      if (!response.ok) throw new Error('Could not load gallery');
      const data = await response.json();
      setItems(data.galleries || []);
      setStatus('');
    } catch {
      setStatus('Could not load gallery media.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn && activeTab === 'gallery') loadGallery();
  }, [loggedIn, activeTab]);

  const login = (event) => {
    event.preventDefault();
    if (email === credentials.email && password === credentials.password) {
      setLoggedIn(true);
      setStatus('');
    } else {
      setStatus('Invalid admin credentials.');
    }
  };

  const updateForm = (event) => {
    const { name, value, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value
    }));
  };

  const upload = async (event) => {
    event.preventDefault();
    if (!form.title || !form.eventCategory || !form.file) {
      setStatus('Title, category and file are required.');
      return;
    }

    const body = new FormData();
    body.append('title', form.title);
    body.append('description', form.description);
    body.append('eventCategory', form.eventCategory);
    body.append('file', form.file);

    setLoading(true);
    setStatus('Uploading to Cloudinary...');
    try {
      const response = await fetch(`${apiUrl}/api/gallery/upload`, {
        method: 'POST',
        body
      });
      if (!response.ok) throw new Error('Upload failed');
      setForm({ title: '', description: '', eventCategory: '', file: null });
      event.target.reset();
      setStatus('Media uploaded successfully.');
      await loadGallery();
    } catch {
      setStatus('Upload failed. Check file size, type and backend Cloudinary env.');
    } finally {
      setLoading(false);
    }
  };

  const toggleHighlight = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/gallery/${id}/highlight`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Highlight update failed');
      const data = await response.json();
      setItems((current) => current.map((item) => (item._id === id ? data.gallery : item)));
      setStatus(data.message || 'Highlight updated.');
    } catch {
      setStatus('Could not update highlight. Deploy the latest backend changes first.');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Delete this gallery media?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/gallery/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');
      setItems((current) => current.filter((item) => item._id !== id));
      setStatus('Media deleted.');
    } catch {
      setStatus('Delete failed.');
    } finally {
      setLoading(false);
    }
  };

  const openMediaPreview = (event, item) => {
    if (typeof window !== 'undefined' && window.matchMedia(MOBILE_PREVIEW_QUERY).matches) {
      event.preventDefault();
      setPreviewItem(item);
    }
    // Otherwise let the anchor's default behaviour open the original file in a new tab.
  };

  useEffect(() => {
    if (!previewItem) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setPreviewItem(null);
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewItem]);

  if (!loggedIn) {
    return (
      <section className="admin-shell">
        <form className="admin-login" onSubmit={login}>
          <p className="eyebrow">Admin</p>
          <h1>Chinmayi Events Admin</h1>
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button type="submit">Login</button>
          {status && <p className="admin-status">{status}</p>}
        </form>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-top">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Chinmayi Events Admin</h1>
        </div>
        <a href="/">Back to website</a>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>Gallery</button>
        <button className={activeTab === 'quotations' ? 'active' : ''} onClick={() => setActiveTab('quotations')}>Quotations</button>
      </div>

      {activeTab === 'gallery' && (
        <div className="admin-grid">
          <form className="admin-card" onSubmit={upload}>
            <h2>Upload Media</h2>
            <label>
              <span>Title</span>
              <input name="title" value={form.title} onChange={updateForm} placeholder="Wedding stage, entrance decor..." />
            </label>
            <label>
              <span>Description</span>
              <textarea name="description" value={form.description} onChange={updateForm} rows={3} />
            </label>
            <label>
              <span>Category</span>
              <select name="eventCategory" value={form.eventCategory} onChange={updateForm}>
                <option value="">Select category</option>
                {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              <span>Image or video</span>
              <input name="file" type="file" accept="image/*,video/*" onChange={updateForm} />
            </label>
            <button type="submit" disabled={loading}>{loading ? 'Working...' : 'Upload to Cloudinary'}</button>
            {status && <p className="admin-status">{status}</p>}
          </form>

          <div className="admin-card media-card">
            <div className="media-head">
              <div>
                <h2>Media Library</h2>
                <p>Mark the best Cloudinary photos or videos as homepage highlights.</p>
              </div>
              <button type="button" onClick={loadGallery} disabled={loading}>Refresh</button>
            </div>
            {loading && items.length === 0 ? <p>Loading gallery...</p> : null}
            <div className="media-grid">
              {items.map((item) => (
                <article key={item._id}>
                  <div className="media-preview">
                    <a
                      className="media-preview-link"
                      href={item.cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => openMediaPreview(event, item)}
                      aria-label={`Open full-size ${item.mediaType === 'video' ? 'video' : 'photo'}: ${item.title}`}
                    >
                      <img src={item.mediaType === 'video' ? videoThumb(item.cloudinaryUrl) : item.cloudinaryUrl} alt={item.title} />
                      {item.mediaType === 'video' && <span className="media-play-badge" aria-hidden="true" />}
                    </a>
                    {item.isHighlight && <span className="highlight-badge">Highlight</span>}
                    <div className="media-icon-actions">
                      <button
                        type="button"
                        className={item.isHighlight ? 'highlight-btn active' : 'highlight-btn'}
                        onClick={() => toggleHighlight(item._id)}
                        disabled={loading}
                        title={item.isHighlight ? 'Remove Highlight' : 'Set Highlight'}
                      >
                        <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L12 3Z"
                            fill={item.isHighlight ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="btn-label">{item.isHighlight ? 'Remove Highlight' : 'Set Highlight'}</span>
                      </button>
                      <button type="button" className="delete-btn" onClick={() => deleteItem(item._id)} disabled={loading} title="Delete">
                        <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="btn-label">Delete</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.eventCategory} - {item.mediaType}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quotations' && <QuotationTool />}

      {previewItem && (
        <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={previewItem.title}>
          <button
            type="button"
            className="media-lightbox-backdrop"
            onClick={() => setPreviewItem(null)}
            aria-label="Close preview"
          />
          <div className="media-lightbox-panel">
            <button type="button" className="media-lightbox-close" onClick={() => setPreviewItem(null)} aria-label="Close preview">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {previewItem.mediaType === 'video' ? (
              <video src={previewItem.cloudinaryUrl} controls autoPlay playsInline />
            ) : (
              <img src={previewItem.cloudinaryUrl} alt={previewItem.title} />
            )}
            <p className="media-lightbox-title">{previewItem.title}</p>
          </div>
        </div>
      )}
    </section>
  );
}

