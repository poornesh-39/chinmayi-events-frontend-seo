import { useEffect, useState } from 'react';
import { apiUrl } from '../data/site.js';
import './AdminPanel.css';

const credentials = {
  email: 'admin@chinmayievents.com',
  password: 'admin123'
};

const categories = [
  ['wedding', 'Wedding'],
  ['birthday', 'Birthday'],
  ['engagement', 'Engagement'],
  ['reception', 'Reception'],
  ['haldi(pre-wedding)', 'Haldi (Pre-Wedding)'],
  ['naming-ceremony', 'Naming Ceremony'],
  ['housewarming', 'Housewarming'],
  ['corporate', 'Corporate'],
  ['other', 'Other']
];

const videoThumb = (url) => {
  if (!url || !url.includes('cloudinary')) return url;
  return url
    .replace('/upload/', '/upload/c_fill,w_720,h_480,q_auto,f_auto/')
    .replace(/\.(mp4|webm)$/i, '.jpg');
};

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('gallery');
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
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
                    <img src={item.mediaType === 'video' ? videoThumb(item.cloudinaryUrl) : item.cloudinaryUrl} alt={item.title} />
                    {item.isHighlight && <span className="highlight-badge">Highlight</span>}
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.eventCategory} - {item.mediaType}</p>
                    <div className="media-actions">
                      <button
                        type="button"
                        className={item.isHighlight ? 'highlight-btn active' : 'highlight-btn'}
                        onClick={() => toggleHighlight(item._id)}
                        disabled={loading}
                      >
                        {item.isHighlight ? 'Remove Highlight' : 'Set Highlight'}
                      </button>
                      <button type="button" className="delete-btn" onClick={() => deleteItem(item._id)} disabled={loading}>Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quotations' && (
        <div className="admin-card quote-card">
          <h2>Quotation Tool</h2>
          <p>
            The full PDF quotation creator still lives in the existing frontend admin panel.
            Keep using it there until we port that larger workflow into this Astro admin.
          </p>
          <a href="https://chinmayi-events.netlify.app" target="_blank" rel="noopener noreferrer">Open existing admin</a>
        </div>
      )}
    </section>
  );
}
