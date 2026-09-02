import { useEffect, useRef, useState } from 'react';
import { apiUrl, cloudinaryImage, cloudinaryVideoThumb, labelForCategory, normalizeCategory, site } from '../data/site.js';
import './EventHighlights.css';

/**
 * How long an image highlight stays on screen before the story auto-advances.
 * Videos advance on their own `ended` event instead of this timer.
 */
const IMAGE_STORY_DURATION = 4500;

const fallbackHighlight = {
  _id: 'fallback-highlight',
  title: 'Wedding event highlight decoration by Chinmayi Events',
  cloudinaryUrl: '/images/opt/chikkamagaluru-gallery-night-stage-10-800.webp',
  mediaType: 'image'
};

const videoThumb = (url) => cloudinaryVideoThumb(url, 480);

const getMediaSrc = (item) => item?.cloudinaryUrl || fallbackHighlight.cloudinaryUrl;
const getMediaTitle = (item) => item?.title || fallbackHighlight.title;
const getPreviewSrc = (item) =>
  item?.mediaType === 'video' ? videoThumb(getMediaSrc(item)) : cloudinaryImage(getMediaSrc(item), 160);
const getViewerImageSrc = (item) => cloudinaryImage(getMediaSrc(item), 1080);
const getStoryLabel = (item) =>
  item?.eventCategory ? labelForCategory(normalizeCategory(item.eventCategory)) : 'Highlight';

const normalizeHighlights = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item?.cloudinaryUrl).slice(0, 10);
};

/**
 * `initialHighlights` is fetched at build time in index.astro so the reel
 * exists in the static HTML for crawlers. This still refreshes on mount in
 * case the admin has published something newer since the last build.
 *
 * @param {{ initialHighlights?: any[] }} props
 */
export default function EventHighlights({ initialHighlights = [] }) {
  const [highlights, setHighlights] = useState(
    initialHighlights.length > 0 ? initialHighlights : [fallbackHighlight]
  );
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = useRef(null);

  const activeItem = highlights[activeIndex] || fallbackHighlight;
  const isVideo = activeItem?.mediaType === 'video';

  useEffect(() => {
    let cancelled = false;

    const applyHighlights = (items) => {
      const selected = normalizeHighlights(items);
      if (cancelled || selected.length === 0) return false;
      setHighlights(selected);
      setActiveIndex(0);
      return true;
    };

    (async () => {
      try {
        const response = await fetch(`${apiUrl}/api/gallery/highlights`);
        if (!response.ok) throw new Error('Could not load highlights');
        const data = await response.json();
        if (applyHighlights(data.highlights)) return;
      } catch {
        // Fall through to the admin gallery fallback while the highlights route is not live.
      }

      try {
        const response = await fetch(`${apiUrl}/api/gallery/admin/all`);
        if (!response.ok) throw new Error('Could not load gallery fallback');
        const data = await response.json();
        const galleryItems = normalizeHighlights(data.galleries);
        const selected = galleryItems.filter((item) => item.isHighlight);
        applyHighlights(selected.length > 0 ? selected : galleryItems.slice(0, 6));
      } catch {
        // Keep the static/fallback reel.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const openViewer = (index) => {
    setActiveIndex(index);
    setVideoProgress(0);
    setMuted(true);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);

  const nextStory = () => {
    setVideoProgress(0);
    setActiveIndex((current) => (current + 1) % highlights.length);
  };

  const prevStory = () => {
    setVideoProgress(0);
    setActiveIndex((current) => (current - 1 + highlights.length) % highlights.length);
  };

  const handleVideoProgress = (event) => {
    const video = event.currentTarget;
    if (!video.duration) return;
    setVideoProgress((video.currentTime / video.duration) * 100);
  };

  useEffect(() => {
    if (!viewerOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeViewer();
      if (event.key === 'ArrowRight') nextStory();
      if (event.key === 'ArrowLeft') prevStory();
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerOpen, highlights.length]);

  return (
    <>
      <div className="eh-card">
        <div className="eh-row" role="list" aria-label="Event highlight reel">
          {highlights.map((item, index) => (
            <button
              key={item._id || item.cloudinaryUrl || index}
              type="button"
              role="listitem"
              className="eh-bubble"
              onClick={() => openViewer(index)}
            >
              <span className="eh-ring">
                <span className="eh-ring-inner">
                  <img src={getPreviewSrc(item)} alt="" loading="lazy" />
                  {item?.mediaType === 'video' && (
                    <span className="eh-play-badge" aria-hidden="true" />
                  )}
                </span>
              </span>
              <span className="eh-bubble-label">{getStoryLabel(item)}</span>
            </button>
          ))}
        </div>

        <a className="eh-card-cta" href={site.instagram} target="_blank" rel="noopener noreferrer">
          More highlights on Instagram
        </a>
      </div>

      {viewerOpen && (
        <div
          className="eh-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={`Event highlight: ${getMediaTitle(activeItem)}`}
        >
          <div className="eh-viewer-panel">
            <div className="eh-viewer-progress">
              {highlights.map((item, index) => (
                <span className="eh-progress-track" key={item._id || item.cloudinaryUrl || index}>
                  {index < activeIndex && <span className="eh-progress-fill" style={{ width: '100%' }} />}
                  {index === activeIndex && !isVideo && (
                    <span
                      key={`fill-${activeIndex}`}
                      className="eh-progress-fill eh-progress-animating"
                      style={{ animationDuration: `${IMAGE_STORY_DURATION}ms` }}
                      onAnimationEnd={nextStory}
                    />
                  )}
                  {index === activeIndex && isVideo && (
                    <span className="eh-progress-fill" style={{ width: `${videoProgress}%` }} />
                  )}
                </span>
              ))}
            </div>

            <div className="eh-viewer-head">
              <div className="eh-viewer-brand">
                <img src={site.logo} alt="" />
                <strong>chinmayi_events</strong>
                <span>{getStoryLabel(activeItem)}</span>
              </div>
              <div className="eh-viewer-actions">
                {isVideo && (
                  <button
                    type="button"
                    className="eh-icon-button"
                    onClick={() => setMuted((current) => !current)}
                    aria-label={muted ? 'Unmute video' : 'Mute video'}
                  >
                    {muted ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
                        <path d="M16 8l6 8M22 8l-6 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
                        <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a9 9 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                )}
                <button type="button" className="eh-icon-button" onClick={closeViewer} aria-label="Close highlights">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="eh-viewer-stage">
              <button type="button" className="eh-tap-zone eh-tap-prev" onClick={prevStory} aria-label="Previous highlight" />
              <button type="button" className="eh-tap-zone eh-tap-next" onClick={nextStory} aria-label="Next highlight" />

              {isVideo ? (
                <video
                  key={activeItem._id || activeItem.cloudinaryUrl}
                  ref={videoRef}
                  className="eh-viewer-media"
                  src={getMediaSrc(activeItem)}
                  poster={videoThumb(getMediaSrc(activeItem))}
                  autoPlay
                  playsInline
                  muted={muted}
                  onTimeUpdate={handleVideoProgress}
                  onEnded={nextStory}
                />
              ) : (
                <img className="eh-viewer-media" src={getViewerImageSrc(activeItem)} alt={getMediaTitle(activeItem)} />
              )}
            </div>

            <a className="eh-viewer-cta" href={site.instagram} target="_blank" rel="noopener noreferrer">
              More highlights on Instagram
            </a>
          </div>
        </div>
      )}
    </>
  );
}
