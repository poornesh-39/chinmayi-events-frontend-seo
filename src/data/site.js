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
    'Chandrakatte, Behind Shanimahathma Temple, Kempanahalli, Chikkamagaluru-577101',
  locality: 'Chikkamagaluru',
  region: 'Karnataka',
  country: 'IN',
  instagram: 'https://www.instagram.com/chinmayi_events/',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Chandrakatte%2C%20Behind%20Shanimahathma%20Temple%2C%20Kempanahalli%2C%20Chikkamagaluru%20577101',
  logo: '/images/chinmayi-events-logo.jpeg',
  heroImage: '/images/chikkamagaluru-wedding-stage-decoration.jpg',
  ogImage: '/images/chikkamagaluru-wedding-stage-decoration.jpg'
};

export const whatsappNumber =
  import.meta.env.PUBLIC_WHATSAPP_NUMBER || '919380350678';

const directApiUrl = (import.meta.env.PUBLIC_API_URL || '').replace(/\/$/, '');

export const apiUrl =
  directApiUrl || '';

export const siteUrl =
  import.meta.env.PUBLIC_SITE_URL || 'https://chinmayi-events.netlify.app';

export const whatsappHref = (message =
  'Hi Chinmayi Events, I would like to inquire about event decoration in Chikkamagaluru.') =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

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







