export const site = {
  name: 'Chinmayi Events',
  tagline: 'Event Decoration in Chikkamagaluru',
  description:
    'Premium wedding, reception, birthday, engagement, floral theme, shamiyana, chair and carpet decoration services in Chikkamagaluru.',
  phonePrimary: '+919380350678',
  phonePrimaryLabel: '+91 93803 50678',
  phoneSecondaryLabel: '+91 97311 78038',
  contactPerson: 'Kishor',
  email: 'chinmayievents99@gmail.com',
  address:
    'Chandrakatte, Behind Shanimahathma Temple, Kempanahalli, Chikkamagaluru, Karnataka 577101',
  streetAddress: 'Chandrakatte, Behind Shanimahathma Temple, Kempanahalli',
  postalCode: '577101',
  locality: 'Chikkamagaluru',
  region: 'Karnataka',
  country: 'IN',
  instagram: 'https://www.instagram.com/chinmayi_events/',
  logo: '/images/chinmayi-events-logo.jpeg',
  heroImage: '/images/chikkamagaluru-wedding-stage-decoration.jpg',
  ogImage: '/images/chikkamagaluru-wedding-stage-decoration.jpg',

  /**
   * Pin coordinates for the "Chinmayi Events" Google Business Profile listing,
   * taken from the place URL that googleMapsUrl resolves to.
   */
  geo: { latitude: 13.3433058, longitude: 75.7754861 },

  /**
   * Canonical Google Business Profile place link. Feeds `hasMap` and `sameAs`,
   * which is how Google ties this site to the map listing, and every
   * "view on maps" link on the site.
   */
  googleMapsUrl: 'https://maps.app.goo.gl/6yAio4pVVEKuG7vn8',

  /** Extra verified profiles for `sameAs` (Facebook, JustDial, YouTube…). */
  otherProfiles: [],

  openingHoursLabel: 'Mon - Sun: 9:00 AM - 8:00 PM',
  openingHours: {
    days: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ],
    opens: '09:00',
    closes: '20:00'
  },

  /** schema.org expects a currency-symbol band here, not a sentence. */
  priceRange: '₹₹'
};

/**
 * Towns the team actually travels to. Drives `areaServed` in the schema and
 * the footer coverage line, so trim anything that is not genuinely served —
 * claiming coverage you do not deliver hurts more than it helps.
 */
export const areasServed = [
  'Chikkamagaluru',
  'Kempanahalli',
  'Aldur',
  'Mudigere',
  'Birur',
  'Kadur',
  'Tarikere',
  'Sringeri',
  'Koppa',
  'Narasimharajapura'
];

export const whatsappNumber =
  import.meta.env.PUBLIC_WHATSAPP_NUMBER || '919380350678';

const directApiUrl = (import.meta.env.PUBLIC_API_URL || '').replace(/\/$/, '');

export const apiUrl =
  directApiUrl || '';

export const siteUrl =
  import.meta.env.PUBLIC_SITE_URL || 'https://chinmayi-events.vercel.app';

export const whatsappHref = (message =
  'Hi Chinmayi Events, I would like to inquire about event decoration in Chikkamagaluru.') =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

/** Turn-by-turn directions to the verified map pin. */
export const directionsHref = () =>
  `https://www.google.com/maps/dir/?api=1&destination=${site.geo.latitude}%2C${site.geo.longitude}`;

/** Keyless Google Maps embed centred on the verified pin. */
export const mapEmbedSrc = () =>
  `https://maps.google.com/maps?q=${site.geo.latitude},${site.geo.longitude}&z=15&hl=en&output=embed`;

export const gmailHref = (subject = 'Event decoration enquiry') =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(site.email)}&su=${encodeURIComponent(subject)}`;

/**
 * Single source of truth for event categories. Order here drives the gallery
 * filter order and the option order in every form.
 */
export const eventTypes = [
  ['wedding', 'Wedding'],
  ['reception', 'Reception'],
  ['engagement', 'Engagement'],
  ['haldi(pre-wedding)', 'Haldi (Pre-Wedding)'],
  ['housewarming', 'Housewarming'],
  ['outdoor', 'Outdoor Events'],
  ['vehicle', 'Vehicle Decoration'],
  ['birthday', 'Birthday'],
  ['naming-ceremony', 'Naming Ceremony'],
  ['corporate', 'Corporate'],
  ['other', 'Other']
];

export const categoryOrder = ['all', ...eventTypes.map(([value]) => value)];

export const categoryLabels = {
  all: 'All',
  ...Object.fromEntries(eventTypes)
};

export const normalizeCategory = (value) =>
  String(value || 'other').trim().toLowerCase();

export const labelForCategory = (category) =>
  categoryLabels[category] ||
  String(category).replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

/** Adds Cloudinary auto format/quality so mobile gets WebP/AVIF at the right size. */
export const cloudinaryImage = (url, width) => {
  if (!url || !url.includes('cloudinary')) return url;
  const transform = width ? `c_limit,w_${width},q_auto,f_auto` : 'q_auto,f_auto';
  return url.replace('/upload/', `/upload/${transform}/`);
};

/** Derives a poster frame from a Cloudinary video URL. */
export const cloudinaryVideoThumb = (url, width = 720) => {
  if (!url || !url.includes('cloudinary')) return url;
  return url
    .replace('/upload/', `/upload/c_fill,w_${width},h_${Math.round((width * 2) / 3)},q_auto,f_auto/`)
    .replace(/\.(mp4|webm|mov)$/i, '.jpg');
};

export const services = [
  {
    slug: 'wedding-decoration-chikkamagaluru',
    title: 'Wedding Decoration in Chikkamagaluru',
    shortTitle: 'Wedding Decoration',
    description:
      'Elegant mandap, entrance, floral, seating and complete wedding venue decoration for families in and around Chikkamagaluru.',
    image: '/images/chikkamagaluru-wedding-stage-decoration.jpg',
    keywords:
      'wedding decoration Chikkamagaluru, mandap decoration Chikkamagaluru, wedding decorators near me',
    highlights: [
      'Traditional and contemporary mandap decoration',
      'Entrance, aisle, backdrop and seating setup',
      'Floral, lighting and theme coordination'
    ]
  },
  {
    slug: 'reception-stage-decoration-chikkamagaluru',
    title: 'Reception Stage Decoration in Chikkamagaluru',
    shortTitle: 'Reception Stage',
    description:
      'Photogenic reception stage designs, lighting, flower work and guest-facing decor for elegant evening celebrations.',
    image: '/images/chikkamagaluru-reception-stage-decoration.jpeg',
    keywords:
      'reception stage decoration Chikkamagaluru, stage decorators Chikkamagaluru',
    highlights: [
      'Grand stage backdrops for photos and video',
      'Lighting and floral accents',
      'Custom layouts for halls, lawns and home venues'
    ]
  },
  {
    slug: 'birthday-decoration-chikkamagaluru',
    title: 'Birthday Decoration in Chikkamagaluru',
    shortTitle: 'Birthday Decor',
    description:
      'Colorful birthday setups, cake table styling, balloon decor, kids themes and family celebration decoration.',
    image: '/images/chikkamagaluru-birthday-cake-table-decoration.jpg',
    keywords:
      'birthday decoration Chikkamagaluru, birthday decorators near me, cake table decoration',
    highlights: [
      'Kids and milestone birthday themes',
      'Cake table, backdrop and photo corner',
      'Compact home and venue-friendly setups'
    ]
  },
  {
    slug: 'engagement-decoration-chikkamagaluru',
    title: 'Engagement Decoration in Chikkamagaluru',
    shortTitle: 'Engagement Decor',
    description:
      'Elegant engagement, ring ceremony and pre-wedding decor with floral stages, backdrops and intimate styling.',
    image: '/images/chikkamagaluru-engagement-decoration.jpeg',
    keywords:
      'engagement decoration Chikkamagaluru, ring ceremony decoration Chikkamagaluru',
    highlights: [
      'Ring ceremony stage and couple backdrop',
      'Fresh or artificial floral styling',
      'Designs for homes, halls and outdoor spaces'
    ]
  },
  {
    slug: 'flower-theme-decoration-chikkamagaluru',
    title: 'Flower and Theme Decoration in Chikkamagaluru',
    shortTitle: 'Flower & Theme',
    description:
      'Fresh-looking floral arrangements and custom theme decoration for weddings, receptions, birthdays and family functions.',
    image: '/images/chikkamagaluru-flower-theme-decoration.jpg',
    keywords:
      'flower decoration Chikkamagaluru, theme decoration Chikkamagaluru, floral decorators',
    highlights: [
      'Flower walls, centerpieces and stage accents',
      'Theme planning around color and venue',
      'Custom details for memorable photos'
    ]
  },
  {
    slug: 'event-management-chikkamagaluru',
    title: 'Event Management and Decoration in Chikkamagaluru',
    shortTitle: 'Event Management',
    description:
      'End-to-end event setup in Chikkamagaluru: decoration design, stage and seating, shamiyana, lighting and on-day setup coordination for weddings, family functions and corporate events.',
    image: '/images/chikkamagaluru-custom-event-design.jpeg',
    keywords:
      'event management Chikkamagaluru, event organisers Chikkamagaluru, event planners near me, event management near me',
    highlights: [
      'Single point of contact from planning to setup day',
      'Decoration, stage, seating, shamiyana and lighting handled together',
      'Venue walkthrough, timeline and material planning before the date'
    ]
  },
  {
    slug: 'haldi-decoration-chikkamagaluru',
    title: 'Haldi and Pre-Wedding Decoration in Chikkamagaluru',
    shortTitle: 'Haldi Decor',
    description:
      'Bright marigold and floral haldi setups, seating, backdrops and photo corners for pre-wedding ceremonies at home or at the venue.',
    image: '/images/chikkamagaluru-gallery-floral-stage-17.jpeg',
    keywords:
      'haldi decoration Chikkamagaluru, pre wedding decoration Chikkamagaluru, haldi decorators near me',
    highlights: [
      'Marigold, floral and traditional haldi themes',
      'Seating, backdrop and photo corner styling',
      'Compact setups that fit home courtyards and terraces'
    ]
  },
  {
    slug: 'naming-ceremony-decoration-chikkamagaluru',
    title: 'Naming Ceremony Decoration in Chikkamagaluru',
    shortTitle: 'Naming Ceremony',
    description:
      'Warm, traditional naming ceremony and cradle ceremony decoration with floral backdrops, cradle styling and soft colour themes.',
    image: '/images/chikkamagaluru-gallery-floral-entrance-13.jpeg',
    keywords:
      'naming ceremony decoration Chikkamagaluru, cradle ceremony decoration, namakarana decoration Chikkamagaluru',
    highlights: [
      'Cradle, backdrop and welcome area styling',
      'Traditional colour and floral combinations',
      'Gentle setups suited to small family gatherings'
    ]
  },
  {
    slug: 'housewarming-decoration-chikkamagaluru',
    title: 'Housewarming Decoration in Chikkamagaluru',
    shortTitle: 'Housewarming',
    description:
      'Griha pravesha and housewarming decoration with entrance work, floral arrangements, rangoli-friendly layouts and pooja area styling.',
    image: '/images/chikkamagaluru-event-centerpiece-decoration.avif',
    keywords:
      'housewarming decoration Chikkamagaluru, griha pravesha decoration Chikkamagaluru, house warming decorators near me',
    highlights: [
      'Main entrance and doorway floral decoration',
      'Pooja area and hall arrangement',
      'Setups sized for new homes and apartments'
    ]
  },
  {
    slug: 'outdoor-event-decoration-chikkamagaluru',
    title: 'Outdoor Event Decoration in Chikkamagaluru',
    shortTitle: 'Outdoor Events',
    description:
      'Lawn, garden, estate and open-ground event decoration with weather-aware staging, lighting and guest seating for outdoor celebrations.',
    image: '/images/chikkamagaluru-gallery-outdoor-decor-5.jpeg',
    keywords:
      'outdoor event decoration Chikkamagaluru, lawn wedding decoration Chikkamagaluru, garden event decorators',
    highlights: [
      'Open-air stage, canopy and pathway decoration',
      'Evening lighting planned for outdoor venues',
      'Layouts that account for ground, weather and guest movement'
    ]
  },
  {
    slug: 'corporate-event-decoration-chikkamagaluru',
    title: 'Corporate Event Decoration in Chikkamagaluru',
    shortTitle: 'Corporate Events',
    description:
      'Clean, professional decoration for corporate functions, inaugurations, annual days and office celebrations, with stage, backdrop and lighting setup.',
    image: '/images/chikkamagaluru-gallery-event-lighting-18.jpeg',
    keywords:
      'corporate event decoration Chikkamagaluru, office event decorators Chikkamagaluru, inauguration decoration',
    highlights: [
      'Stage, podium and branded backdrop setup',
      'Inaugurations, annual days and office functions',
      'Restrained styling that suits a professional audience'
    ]
  },
  {
    slug: 'vehicle-decoration-chikkamagaluru',
    title: 'Vehicle Decoration in Chikkamagaluru',
    shortTitle: 'Vehicle Decor',
    description:
      'Floral car and vehicle decoration for weddings, receptions, bride and groom entries, and temple or procession occasions.',
    image: '/images/chikkamagaluru-flower-theme-decoration.jpg',
    keywords:
      'vehicle decoration Chikkamagaluru, wedding car decoration Chikkamagaluru, car flower decoration near me',
    highlights: [
      'Fresh floral car decoration for wedding entries',
      'Colour matched to the main event theme',
      'Setup timed to the departure schedule'
    ]
  },
  {
    slug: 'shamiyana-chair-carpet-pakkoda-chikkamagaluru',
    title: 'Shamiyana, Chair, Carpet and Pakkoda Setup in Chikkamagaluru',
    shortTitle: 'Shamiyana Setup',
    description:
      'Complete shamiyana, chair, carpet and pakkoda arrangements for weddings, family events and community celebrations.',
    image: '/images/chikkamagaluru-shamiyana-chair-carpet-setup.jpeg',
    keywords:
      'shamiyana Chikkamagaluru, chair carpet setup Chikkamagaluru, pakkoda setup',
    highlights: [
      'Functional setup for guest comfort',
      'Chair, carpet and covered arrangements',
      'Reliable execution for indoor and outdoor events'
    ]
  }
];

export const galleryHighlights = [
  {
    src: '/images/chikkamagaluru-wedding-stage-decoration.jpg',
    alt: 'Wedding stage decoration by Chinmayi Events in Chikkamagaluru',
    title: 'Wedding Stage'
  },
  {
    src: '/images/chikkamagaluru-reception-stage-decoration.jpeg',
    alt: 'Reception stage decoration in Chikkamagaluru',
    title: 'Reception Stage'
  },
  {
    src: '/images/chikkamagaluru-flower-theme-decoration.jpg',
    alt: 'Flower and theme event decoration in Chikkamagaluru',
    title: 'Flower Theme'
  },
  {
    src: '/images/chikkamagaluru-shamiyana-chair-carpet-setup.jpeg',
    alt: 'Shamiyana chair and carpet setup for events in Chikkamagaluru',
    title: 'Guest Setup'
  },
  {
    src: '/images/chikkamagaluru-birthday-cake-table-decoration.jpg',
    alt: 'Birthday cake table decoration in Chikkamagaluru',
    title: 'Birthday Decor'
  },
  {
    src: '/images/chikkamagaluru-custom-event-design.jpeg',
    alt: 'Custom event design and decoration by Chinmayi Events',
    title: 'Custom Design'
  }
];

export const faqs = [
  {
    question: 'How early should we book Chinmayi Events?',
    answer:
      'For weddings and receptions, booking at least 2 to 4 weeks in advance is recommended. Smaller birthday, engagement and home events can often be planned faster depending on date availability.'
  },
  {
    question: 'Do you provide event decoration outside Chikkamagaluru?',
    answer:
      'Yes. Chinmayi Events primarily serves Chikkamagaluru and nearby areas, with travel possible for selected events depending on the venue, date and setup requirement.'
  },
  {
    question: 'Can the decoration be customized for our theme?',
    answer:
      'Yes. Colors, flowers, backdrops, lighting, stage style, seating and entry decor can be customized around your event type, venue and budget.'
  },
  {
    question: 'Do you provide shamiyana, chairs and carpet setup?',
    answer:
      'Yes. Shamiyana, chair, carpet and pakkoda arrangements are available for weddings, family functions, community events and outdoor celebrations.'
  },
  {
    question: 'How do we get a quotation?',
    answer:
      'Call, WhatsApp or submit the contact form with your event date, venue, guest size and preferred decoration style. The team will respond with details and pricing guidance.'
  }
];

export const processSteps = [
  'Share your event date, venue and decoration idea.',
  'Discuss theme, colors, photos, guest size and budget.',
  'Confirm the design, materials and setup timeline.',
  'Relax while the team prepares and decorates your venue.'
];







