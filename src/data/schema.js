/**
 * Structured data, in one place.
 *
 * Everything hangs off two stable `@id` values. Pages reference the business
 * by `@id` instead of restating its details, so Google resolves one business
 * entity across the whole site rather than a dozen look-alikes — which is what
 * local ranking is built on.
 *
 * Fields sourced from `site.js` are omitted entirely when unset (geo, map URL)
 * rather than published with placeholder values.
 */
import { areasServed, services, site, siteUrl } from './site.js';

export const businessId = `${siteUrl}/#business`;
export const websiteId = `${siteUrl}/#website`;

const absolute = (path) => new URL(path, siteUrl).toString();

// Number(null) and Number('') are both 0, which is a real coordinate in the
// Gulf of Guinea — so check the raw value is present before coercing.
const coordinate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const hasGeo = () =>
  coordinate(site.geo?.latitude) !== null && coordinate(site.geo?.longitude) !== null;

/** Every verified profile that points back at this business. */
const sameAs = () =>
  [site.instagram, site.googleMapsUrl, ...(site.otherProfiles || [])].filter(Boolean);

/**
 * The business entity. Emitted once per page from BaseLayout.
 *
 * `rating` is only passed on pages that actually display the reviews it
 * summarises — structured data that is not visible on the page is a
 * guidelines violation, regardless of whether the numbers are real.
 */
export const localBusinessSchema = ({ rating = null } = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': businessId,
  additionalType: 'https://en.wikipedia.org/wiki/Event_management',
  name: site.name,
  alternateName: 'Chinmayi Events Chikkamagaluru',
  description: site.description,
  url: siteUrl,
  image: absolute(site.ogImage),
  logo: absolute(site.logo),
  telephone: site.phonePrimary,
  email: site.email,
  priceRange: site.priceRange,
  currenciesAccepted: 'INR',
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.streetAddress,
    addressLocality: site.locality,
    addressRegion: site.region,
    postalCode: site.postalCode,
    addressCountry: site.country
  },
  ...(hasGeo() && {
    geo: {
      '@type': 'GeoCoordinates',
      latitude: coordinate(site.geo.latitude),
      longitude: coordinate(site.geo.longitude)
    }
  }),
  ...(site.googleMapsUrl && { hasMap: site.googleMapsUrl }),
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: site.openingHours.days,
      opens: site.openingHours.opens,
      closes: site.openingHours.closes
    }
  ],
  areaServed: areasServed.map((name) => ({
    '@type': 'City',
    name,
    containedInPlace: { '@type': 'AdministrativeArea', name: site.region }
  })),
  knowsAbout: [
    'Event management',
    'Wedding decoration',
    'Reception stage decoration',
    'Floral decoration',
    'Shamiyana and seating setup'
  ],
  makesOffer: services.map((service) => ({
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: service.title,
      url: absolute(`/services/${service.slug}/`)
    }
  })),
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: site.phonePrimary,
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['Kannada', 'English', 'Hindi']
  },
  sameAs: sameAs(),
  ...(rating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.ratingValue,
      reviewCount: rating.reviewCount,
      bestRating: 5,
      worstRating: 1
    }
  })
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': websiteId,
  url: siteUrl,
  name: site.name,
  inLanguage: 'en-IN',
  publisher: { '@id': businessId }
});

/** `trail` is [[name, path], …]; the home crumb is added automatically. */
export const breadcrumbSchema = (trail) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', '/'], ...trail].map(([name, path], index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: absolute(path)
  }))
});

/** Reviews shown on the page, mirrored into the business entity. */
export const reviewSchema = (experiences, limit = 10) =>
  (experiences || []).slice(0, limit).map((entry) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@id': businessId },
    author: { '@type': 'Person', name: entry.fullName },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: Number(entry.rating),
      bestRating: 5,
      worstRating: 1
    },
    reviewBody: entry.experience,
    ...(entry.createdAt && { datePublished: String(entry.createdAt).slice(0, 10) })
  }));
