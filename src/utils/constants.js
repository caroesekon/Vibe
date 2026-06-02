export const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
  { type: 'care', emoji: '🤗', label: 'Care' },
];

export const POST_AUDIENCE = [
  { value: 'public', label: 'Public', icon: '🌍' },
  { value: 'friends', label: 'Friends', icon: '👥' },
  { value: 'only_me', label: 'Only Me', icon: '🔒' },
];

export const REPORT_REASONS = [
  'spam',
  'hate_speech',
  'violence',
  'nudity',
  'harassment',
  'false_information',
  'intellectual_property',
  'self_harm',
  'other',
];

export const MARKETPLACE_CATEGORIES = [
  'electronics',
  'clothing',
  'furniture',
  'vehicles',
  'books',
  'sports',
  'home',
  'toys',
  'services',
  'other',
];

export const MARKETPLACE_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export const VERIFICATION_PLANS = [
  { value: 'monthly', label: 'Monthly', price: 'KSh 400', period: '/month' },
  { value: 'yearly', label: 'Yearly', price: 'KSh 4,000', period: '/year', save: 'Save 17%' },
  { value: 'permanent', label: 'Permanent', price: 'KSh 10,000', period: 'one-time' },
];

export const MAX_POST_CHARACTERS = 5000;
export const MAX_BIO_CHARACTERS = 500;
export const MAX_COMMENT_CHARACTERS = 2000;
export const MAX_MESSAGE_CHARACTERS = 5000;