
// Fix: Removed circular import of 'Content'. The interface is defined in this file.
export type Theme = 'classic-dark' | 'FilmySky-dark' | 'gradient-luxe' | 'minimal-light';

export interface User {
  id: string;
  name: string;
  email: string | null;
  isAnonymous: boolean;
  role: boolean; // true for admin
  createdAt: number;
  viewCount: number;
  fcmToken?: string;
  walletBalance?: number; // Advertiser Wallet
  subscription?: {
    planName: string;
    expiresAt?: number; // For time-based plans
    viewLimit: number; // For view-based plans or base limit. -1 for unlimited (time-based).
    maxQuality: string;
    adsDisabled: boolean;
    liveTvAccess: boolean;
  };
  watchlist?: { [contentId: string]: boolean };
}

export interface CastMember {
    name: string;
    image: string;
}

export interface QualityLink {
    quality: string; // e.g., '1080', '720'
    url: string;
}

export interface Season {
    number: number;
    qualityLinks: QualityLink[]; // Now used for Downloads
    watchLinks?: QualityLink[]; // New: Used for Streaming (Iframe)
    imdbId?: string; // Optional Season-level IMDb ID
    tmdbId?: string; // Optional Season-level TMDB ID
}

export interface Content {
    id: string;
    title: string;
    type: 'movie' | 'webseries';
    poster: string;
    backdrop: string;
    sliderPoster?: string; // Optional portrait artwork used only by the home slider
    year: number;
    language: string;
    rating: number;
    storyline: string;
    category: string;
    cast?: CastMember[]; 
    imdbId?: string; // IMDb ID, e.g., 'tt36931126'
    tmdbId?: string; // TMDB ID, e.g., '1072790'
    // For movies
    qualityLinks?: QualityLink[]; // Now used for Downloads
    watchLinks?: QualityLink[]; // New: Used for Streaming (Iframe)
    // For series
    seasons?: Season[]; 
    views?: number; 
    createdAt?: string | number; 
    updatedAt?: string | number; 
    isFeatured?: boolean; // Controls Hero Slider visibility
}

export interface LiveTvStream {
    id: string;
    title: string;
    poster: string;
    streamUrl: string;
}

export interface LiveTvNetwork {
    id: string;
    name: string;
    poster: string; // 16:9 poster
}

export interface UpcomingContent {
    id: string;
    title: string;
    poster: string;
    releaseDate: number;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    type: 'time-based' | 'view-based';
    validity?: number; // in days, for time-based plans
    viewsToAdd?: number; // for view-based plans
    maxQuality: string;
    adsDisabled: boolean;
    liveTvAccess: boolean;
    benefits: string[];
}

export interface Comment {
    id: string;
    userId: string;
    userName:string;
    text: string;
    timestamp: number;
}

export interface ContentRequest {
    id: string;
    userId: string;
    userName: string;
    title: string;
    type: 'Movie' | 'Series';
    notes: string;
    status: 'pending' | 'completed' | 'rejected';
    requestedAt: number;
}

// Fix: Completed the PaymentRequest interface with all necessary fields.
export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string | null;
  type: 'subscription' | 'wallet';
  planId?: string; // Only for subscription payments
  planName?: string; // Added for convenience in admin panel
  amount: number; // Amount for wallet top-up or subscription price
  upiId?: string; // UPI ID used for payment
  transactionNote?: string; // Unique note for payment identification
  userTransactionId?: string; // User-provided transaction ID (optional)
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: number;
  gateway?: 'upi' | 'paypal' | 'card' | 'crypto';
  currency?: string;
  country?: string;
  autoVerified?: boolean;
}

// Fix: Defined AdCampaign interface.
export interface AdCampaign {
  id: string;
  userId: string;
  userName: string;
  name: string;
  adType: 'interstitial' | 'video';
  subType: 'website' | 'youtube'; // Only for interstitial, video will be internal video file
  duration: 15 | 30 | 45 | 59; // in seconds
  targetCategory: string; // 'All', 'Bollywood', etc.
  contentUrl: string; // URL of the ad content (website, youtube embed, or video file)
  targetUrl?: string; // URL to redirect to on click (optional)
  budget: number; // total budget allocated for the ad
  spent: number; // actual spent amount
  status: 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
  stats: {
    views: number;
    clicks: number;
  };
  createdAt: number;
  costPerView?: number; // Calculated from CPM
  costPerClick?: number; // Calculated from CPC
}

// Fix: Defined WalletTransaction interface.
export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  timestamp: number;
}

// Fix: Defined AppSettings interface based on usage across the app.
export interface AppSettings {
  logoText?: string;
  maintenance?: {
    status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED';
    scheduledEnd?: number; // timestamp
    message?: string;
  };
  subscriptionStatus?: 'ACTIVE' | 'INACTIVE';
  playerConfig?: {
    enableInternalPlayer: boolean; // If true, use /player/:id. If false, show link dialog.
    defaultServerBaseUrl?: string; // Base URL for streaming server, defaults to 'https://slast430did.com/play/'
  };
  adConfig?: {
    masterSwitch: { // Granular switches for different ad types
      video: boolean;
      interstitial: boolean;
    };
    panelStatus?: boolean; // Whether 'Advertise With Us' link shows
    minBudgets: {
      youtube: number;
      website: number;
      video: number;
    };
    rates: {
      youtube: {
        cpm: { '15': number; '30': number; '45': number; '59': number }; // Duration specific CPM
        cpc: number;
      };
      website: {
        cpm: { '15': number; '30': number; '45': number; '59': number };
        cpc: number;
      };
      video: {
        cpm: { '15': number; '30': number; '45': number; '59': number };
        cpc: number;
      };
    };
  };
  adBanner?: { // For a static banner ad
    imageUrl: string;
    linkUrl?: string;
  };
  customAdCode?: string; // HTML/JS code for ads on Player Page
  popupAdCode?: string; // HTML/JS code for popup ads
  adyestraAdCode?: string; // HTML/JS code for Adyestra placements
  apkUrl?: string; // Direct link for APK download
  minAddMoney?: number; // Minimum amount user can add to wallet
  upiIds?: string[]; // List of UPI IDs for payment
  socials?: {
    telegram?: string;
    whatsapp?: string;
    instagram?: string;
    website?: string;
  };
  youtube?: YouTubeConfig;
  posterBorderColor?: string;
  appDownload?: {
    enabled?: boolean;
    apkUrl?: string;
    appName?: string;
    buttonText?: string;
  };
  urlShortener?: {
    enabled?: boolean;
    providerName?: string;
    apiKey?: string;
    apiTemplate?: string;
    autoShorten?: boolean;
  };
  downloadAd?: {
    enabled?: boolean;
    adUrl?: string;
    adType?: 'direct_link' | 'countdown';
    timerSeconds?: number;
  };
  paymentConfig?: {
    autoVerifyEnabled?: boolean;
    enableInternational?: boolean;
    paypalEmail?: string;
    stripePublishableKey?: string;
    cryptoUsdtAddress?: string;
    cryptoNetwork?: string;
    merchantName?: string;
    exchangeRateUsdToInr?: number;
  };
}

// Fix: Defined ContactMessage interface.
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: number;
}

export interface YouTubeApiKey {
  key: string;
  creditsUsed: number;
  maxCredits: number;
  status: 'active' | 'available' | 'exhausted' | 'error';
  lastUsed?: number;
  errorReason?: string;
}

export interface YouTubeHomeBannerAd {
  enabled: boolean;
  type: 'image' | 'code';
  imageUrl?: string;
  targetUrl?: string;
  title?: string;
  code?: string;
  frequency: number; // Every X videos
  showAtTop?: boolean;
}

export interface YouTubeShortsAd {
  enabled: boolean;
  frequency: number; // Every X shorts
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  targetUrl: string;
}

export interface YouTubeConfig {
  apiKeys: YouTubeApiKey[];
  activeKeyIndex: number;
  quotaPerKey: number; // Default 1000 credits
  ads: {
    homeBanner: YouTubeHomeBannerAd;
    shortsAd: YouTubeShortsAd;
  };
}

export interface YouTubeVideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  channelThumbnail?: string;
  publishedAt: string;
  viewCount?: string;
  duration?: string;
  likeCount?: string;
  commentCount?: string;
  isShort?: boolean;
}

export interface YouTubeCommentItem {
  id: string;
  authorName: string;
  authorProfileImageUrl?: string;
  textDisplay: string;
  likeCount: number;
  publishedAt: string;
}

