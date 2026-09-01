import { useEffect, useMemo, useState } from 'react';
import { apiUrl, cloudinaryVideoThumb, eventTypes, site } from '../data/site.js';
import './TestimonialsPanel.css';

const fallbackReviews = [
  {
    _id: 'fallback-1',
    fullName: 'Ankita & Rohan',
    eventType: 'wedding',
    rating: 5,
    experience:
      'Chinmayi Events made our wedding absolutely magical. Every detail was perfect and exactly what we dreamed of.'
  },
  {
    _id: 'fallback-2',
    fullName: 'Pooja R',
    eventType: 'reception',
    rating: 5,
    experience:
      'Excellent work. The decoration was beyond our expectations. Highly recommended.'
  }
];

const fallbackHighlight = {
  _id: 'fallback-highlight',
  title: 'Wedding event highlight decoration by Chinmayi Events',
  cloudinaryUrl: '/images/opt/chikkamagaluru-gallery-night-stage-10-800.webp',
  mediaType: 'image'
};

const initialForm = {
  fullName: '',
  eventType: '',
  rating: 5,
  experience: ''
};

const stars = (rating) => Array.from({ length: Math.max(1, Math.min(5, Number(rating) || 1)) }, () => '★').join(' ');

const videoThumb = (url) => cloudinaryVideoThumb(url, 960);

const getMediaSrc = (highlight) => highlight?.cloudinaryUrl || fallbackHighlight.cloudinaryUrl;
const getMediaTitle = (highlight) => highlight?.title || fallbackHighlight.title;
const getPreviewSrc = (highlight) => (highlight?.mediaType === 'video' ? videoThumb(getMediaSrc(highlight)) : getMediaSrc(highlight));

const normalizeHighlights = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item?.cloudinaryUrl).slice(0, 8);
};

const ReviewCard = ({ review, label, compact = false }) => (
  <article className={`review-card-live ${compact ? 'compact' : ''}`}>
    <p className="eyebrow">{label}</p>
    <span className="quote-mark">&quot;</span>
    <p className="review-text">{review.experience}</p>
    <div className="review-person">
      <strong>{review.fullName}</strong>
      <small>{review.eventType}</small>
      <span>{stars(review.rating)}</span>
    </div>
  </article>
);

const HighlightPreview = ({ highlight }) => (
  <>
    <img src={getPreviewSrc(highlight)} alt={getMediaTitle(highlight)} loading="lazy" />
    <span>{highlight?.mediaType === 'video' ? 'Play' : 'View'}</span>
    <strong>{getMediaTitle(highlight)}</strong>
  </>
);

const ModalMedia = ({ highlight }) => {
  const src = getMediaSrc(highlight);
  const title = getMediaTitle(highlight);

  if (highlight?.mediaType === 'video') {
    return <video src={src} poster={videoThumb(src)} controls autoPlay preload="metadata" aria-label={title} />;
  }

  return <img src={src} alt={title} />;
};

export default function TestimonialsPanel() {
  const [reviews, setReviews] = useState(fallbackReviews);
  const [highlights, setHighlights] = useState([fallbackHighlight]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const visibleReviews = reviews.slice(0, 8);
  const activeReview = visibleReviews[activeIndex] || fallbackReviews[0];
  const nextReview = visibleReviews[(activeIndex + 1) % visibleReviews.length] || fallbackReviews[1] || activeReview;
  const activeHighlight = highlights[highlightIndex] || fallbackHighlight;

  const averageRating = useMemo(() => {
    if (!reviews.length) return '5.0';
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const loadReviews = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/experience`);
      if (!response.ok) throw new Error('Could not load testimonials');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setReviews(data);
        setActiveIndex(0);
      }
    } catch {
      // Keep the sample testimonials if live reviews are unavailable.
    }
  };

  const loadHighlights = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/gallery/highlights`);
      if (!response.ok) throw new Error('Could not load highlights');
      const data = await response.json();
      const selected = normalizeHighlights(data.highlights);
      if (selected.length > 0) {
        setHighlights(selected);
        setHighlightIndex(0);
        return;
      }
    } catch {
      // Fall through to the admin gallery fallback while the new backend route is not live.
    }

    try {
      const response = await fetch(`${apiUrl}/api/gallery/admin/all`);
      if (!response.ok) throw new Error('Could not load gallery fallback');
      const data = await response.json();
      const galleryItems = normalizeHighlights(data.galleries);
      const selected = galleryItems.filter((item) => item.isHighlight);
      const fallbackItems = selected.length > 0 ? selected : galleryItems.slice(0, 6);
      if (fallbackItems.length > 0) {
        setHighlights(fallbackItems);
        setHighlightIndex(0);
        return;
      }
    } catch {
      // Keep the static fallback image.
    }

    setHighlights([fallbackHighlight]);
    setHighlightIndex(0);
  };

  useEffect(() => {
    loadReviews();
    loadHighlights();
  }, []);

  useEffect(() => {
    if (visibleReviews.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleReviews.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [visibleReviews.length]);

  useEffect(() => {
    if (highlights.length <= 1 || modalOpen) return undefined;

    const timer = window.setInterval(() => {
      setHighlightIndex((current) => (current + 1) % highlights.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [highlights.length, modalOpen]);

  useEffect(() => {
    if (!modalOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setModalOpen(false);
      if (event.key === 'ArrowRight') setHighlightIndex((current) => (current + 1) % highlights.length);
      if (event.key === 'ArrowLeft') setHighlightIndex((current) => (current - 1 + highlights.length) % highlights.length);
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen, highlights.length]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'rating' ? Number(value) : value
    }));
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('Sharing your review...');

    try {
      const response = await fetch(`${apiUrl}/api/experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error('Review submission failed');

      const data = await response.json();
      setReviews((current) => [data.data, ...current.filter((review) => !review._id.startsWith?.('fallback'))]);
      setActiveIndex(0);
      setForm(initialForm);
      setMessage('Thank you. Your review is now visible here.');
    } catch {
      setMessage('Could not submit the review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const showPreviousHighlight = () => {
    setHighlightIndex((current) => (current - 1 + highlights.length) % highlights.length);
  };

  const showNextHighlight = () => {
    setHighlightIndex((current) => (current + 1) % highlights.length);
  };

  return (
    <div className="testimonials-panel">
      <div className="testimonials-head centered">
        <div>
          <p className="eyebrow">Clients love</p>
          <h2>What Our Clients Say</h2>

        </div>
        <div className="rating-summary">
          <strong>{averageRating}</strong>
          <span>★ ★ ★ ★ ★</span>
          <small>Customer rating</small>
        </div>
      </div>

      <div className="proof-showcase" aria-label="Customer testimonials and event highlight">
        <div className="highlight-showcase-block">
          <article className="highlight-card-center">
            <p className="eyebrow">Event highlights</p>
            <h3>Moments That Last Forever</h3>
            <button
              type="button"
              className="video-tile-live highlight-open-button"
              onClick={() => setModalOpen(true)}
              aria-label="Open Chinmayi Events highlights"
            >
              <HighlightPreview highlight={activeHighlight} />
            </button>
            <a className="instagram-highlight-link" href={site.instagram} target="_blank" rel="noopener noreferrer">
              More highlights on Instagram
            </a>
          </article>

          {highlights.length > 1 && (
            <div className="highlight-dots" aria-label="Choose highlight">
              {highlights.map((item, index) => (
                <button
                  key={item._id || item.cloudinaryUrl}
                  type="button"
                  className={index === highlightIndex ? 'active' : ''}
                  onClick={() => setHighlightIndex(index)}
                  aria-label={`Show highlight ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="reviews-showcase-block">
          <div className="review-cards-row">
            <ReviewCard review={activeReview} label="What our clients say" />
            <ReviewCard review={nextReview} label="Google reviews" compact />
          </div>

          {visibleReviews.length > 1 && (
            <div className="review-dots" aria-label="Choose testimonial">
              {visibleReviews.map((review, index) => (
                <button
                  key={review._id}
                  type="button"
                  className={index === activeIndex ? 'active' : ''}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <form className="review-form" onSubmit={submitReview}>
        <div>
          <p className="eyebrow">Share your experience</p>
          <h3>Add Your Review</h3>
        </div>
        <div className="review-form-grid">
          <label>
            <span>Name</span>
            <input name="fullName" value={form.fullName} onChange={updateForm} required placeholder="Your name" />
          </label>
          <label>
            <span>Event type</span>
            <select name="eventType" value={form.eventType} onChange={updateForm} required>
              <option value="">Select event</option>
              {eventTypes.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <div className="rating-field">
            <span>Rating</span>
            <div className="star-rating" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  className={rating <= Number(form.rating) ? 'active' : ''}
                  role="radio"
                  aria-checked={rating === Number(form.rating)}
                  aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
                  onClick={() => setForm((current) => ({ ...current, rating }))}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>
        <label>
          <span>Review</span>
          <textarea
            name="experience"
            value={form.experience}
            onChange={updateForm}
            required
            rows={4}
            placeholder="Tell future customers about your event decoration experience..."
          />
        </label>
        <button className="submit-review-button" type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {message && <p className="review-message">{message}</p>}
      </form>

      {modalOpen && (
        <div className="highlight-modal" role="dialog" aria-modal="true" aria-label="Event highlights">
          <button type="button" className="highlight-modal-backdrop" onClick={() => setModalOpen(false)} aria-label="Close highlights" />
          <div className="highlight-modal-panel">
            <div className="highlight-modal-head">
              <div>
                <p className="eyebrow">Event highlights</p>
                <h3>{getMediaTitle(activeHighlight)}</h3>
              </div>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close highlights">Close</button>
            </div>

            <div className="highlight-modal-media">
              <ModalMedia highlight={activeHighlight} />
              {highlights.length > 1 && (
                <>
                  <button type="button" className="modal-arrow prev" onClick={showPreviousHighlight} aria-label="Previous highlight">Prev</button>
                  <button type="button" className="modal-arrow next" onClick={showNextHighlight} aria-label="Next highlight">Next</button>
                </>
              )}
            </div>

            {highlights.length > 1 && (
              <div className="highlight-thumbs" aria-label="Highlight thumbnails">
                {highlights.map((item, index) => (
                  <button
                    key={item._id || item.cloudinaryUrl}
                    type="button"
                    className={index === highlightIndex ? 'active' : ''}
                    onClick={() => setHighlightIndex(index)}
                    aria-label={`Open highlight ${index + 1}`}
                  >
                    <img src={getPreviewSrc(item)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
