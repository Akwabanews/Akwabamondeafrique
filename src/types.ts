export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  socials: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    mail?: string;
  };
  specialties: string[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  image?: string;
  video?: string;
  audioUrl?: string; // Podcast/Audio support
  gallery?: string[]; // Multiple photos
  author: string;
  authorRole?: string;
  excerpt: string;
  content: string;
  readingTime: string;
  imageCredit?: string;
  source?: string;
  views: number;
  likes: number;
  reactions?: Record<string, number>; // Emoji reactions
  commentsCount?: number;
  tags?: string[];
  status: 'draft' | 'published';
  isPremium?: boolean;
  premiumPreviewSelection?: 'auto' | 'manual';
  manualPreview?: string;
  scheduledAt?: string;
  // SEO & Social
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: string;
}

export interface Comment {
  id: string;
  userId?: string;
  userPhoto?: string;
  username: string;
  date: string;
  content: string;
  likes: number;
  likedBy?: string[]; // Array of user IDs who liked
  replies: Comment[];
  articleId: string;
  reportedBy?: string[]; // Array of user IDs who reported
  isReported?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'user' | 'editor' | 'admin';
  likedArticles: string[];
  bookmarkedArticles: string[];
  followedAuthors: string[];
  followedCategories: string[];
  votedPolls: string[];
  badges: string[];
  points: number;
  isPremium?: boolean;
  premiumSince?: string;
  premiumUntil?: string; // ISO date string
  paymentMethod?: string;
  history?: { articleId: string; date: string }[];
}

export interface ChatMessage {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  date: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  location: string;
  category: string;
  image?: string;
  imageCredit?: string;
  gallery?: string[];
  video?: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
  scheduledAt?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface SiteSettings {
  aboutText: string;
  email: string;
  phone: string;
  address: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  // Ads
  adSlotHeader?: string;
  adSlotSidebar?: string;
  adSlotFooter?: string;
  // Breaking News
  urgentBannerText?: string;
  urgentBannerActive?: boolean;
  urgentBannerLink?: string;
  flashNews?: string; // Semicolon separated news for ticker
  // Categories
  categories: string[];
  categories_icons?: Record<string, string>;
  // Maintenance
  maintenanceMode: boolean;
  // Donations & Premium
  donationAmounts: number[];
  donationPaymentMethods: string[];
  premiumPrice: number;
  isDonationActive: boolean;
  isPremiumActive: boolean;
  activePaymentMethods: {
    paypal?: boolean;
    stripe?: boolean;
    flutterwave?: boolean;
    orangeMoney?: boolean;
    mtn?: boolean;
    moov?: boolean;
    wave?: boolean;
  };
  paymentLinks?: {
    paypal?: string;
    stripe?: string;
    flutterwave?: string;
    orangeMoney?: string;
    mtn?: string;
    moov?: string;
    wave?: string;
  };
  premiumDurationMonths?: number;
  paypalId?: string;
  stripePublicKey?: string;
  flutterwavePublicKey?: string;
  orangeMoneyNumber?: string;
  mtnMoneyNumber?: string;
  moovMoneyNumber?: string;
  waveNumber?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  date: string;
}

export interface MediaAsset {
  id: string;
  url: string;
  type: 'image' | 'video';
  date: string;
  fileName?: string;
}

export interface LiveBlog {
  id: string;
  articleId: string; // Linked to article if it's a "Live" article
  title: string;
  updates: LiveUpdate[];
  status: 'live' | 'ended';
  createdAt: string;
}

export interface LiveUpdate {
  id: string;
  content: string;
  date: string;
  type: 'info' | 'urgent' | 'media';
  imageUrl?: string;
  videoUrl?: string;
  author: string;
}

export interface WebTV {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  category: string;
  date: string;
  views: number;
  isPremium?: boolean;
}

export interface Classified {
  id: string;
  title: string;
  description: string;
  price?: string;
  category: 'emploi' | 'immobilier' | 'véhicules' | 'services' | 'divers';
  location: string;
  contact: string;
  imageUrl?: string;
  userId: string;
  username: string;
  date: string;
  status: 'active' | 'sold' | 'expired';
}

export interface SiteStats {
  views: number;
}

export interface AppNotification {
  id: string;
  userId?: string;
  topic?: string;
  title: string;
  message: string;
  link?: string;
  date: string;
  read: boolean;
  type: 'article' | 'event' | 'urgent' | 'system';
}

export interface SupportMessage {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  date: string;
  isAdmin: boolean;
}
