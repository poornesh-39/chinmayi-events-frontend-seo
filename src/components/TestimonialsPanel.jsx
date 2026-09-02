import { useEffect, useMemo, useState } from 'react';
import { apiUrl, eventTypes } from '../data/site.js';
import './TestimonialsPanel.css';

/**
 * Deliberately empty. This used to hold two invented testimonials, which the
 * island server-rendered into the homepage — so the reviews Google indexed
 * were written copy, not customers. Real reviews are now fetched at build time
 * and passed in via `initialReviews`; if none are available the block simply
 * does not render.
 */
const fallbackReviews = [];

const initialForm = {
  fullName: '',
  eventType: '',
  rating: 5,
  experience: ''
};

const stars = (rating) => Array.from({ length: Math.max(1, Math.min(5, Number(rating) || 1)) }, () => '★').join(' ');

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

/**
 * `initialReviews` is fetched at build time in index.astro so the
 * testimonials exist in the static HTML. The mount-time loader below still
 * runs and picks up anything newer.
 *
 * @param {{ initialReviews?: any[] }} props
 */
export default function TestimonialsPanel({ initialReviews = [] }) {
  const [reviews, setReviews] = useState(
    initialReviews.length > 0 ? initialReviews : fallbackReviews
  );
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleReviews = reviews.slice(0, 8);
  const activeReview = visibleReviews[activeIndex] || visibleReviews[0] || null;
  const nextReview =
    visibleReviews.length > 1
      ? visibleReviews[(activeIndex + 1) % visibleReviews.length]
      : null;

  const averageRating = useMemo(() => {
    if (!reviews.length) return null;
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

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (visibleReviews.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleReviews.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [visibleReviews.length]);

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

  return (
    <div className="testimonials-panel">
      <div className="testimonials-head centered">
        <div>
          <p className="eyebrow">Clients love</p>
          <h2>What Our Clients Say</h2>

        </div>
        {averageRating && (
          <div className="rating-summary">
            <strong>{averageRating}</strong>
            <span>★ ★ ★ ★ ★</span>
            <small>Average of {reviews.length} client reviews</small>
          </div>
        )}
      </div>

      <div className="review-cards-row" aria-label="Customer testimonials">
        {activeReview && <ReviewCard review={activeReview} label="What our clients say" />}
        {nextReview && <ReviewCard review={nextReview} label="Client experience" compact />}
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
    </div>
  );
}
