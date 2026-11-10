import { Content } from '../types';

const DEFAULT_SITE_NAME = 'Filmysky';

export const buildMovieTitle = (title: string, year?: number | string) => {
  const safeYear = year ? String(year) : 'HD';
  return `${title} (${safeYear}) Full Movie Download & Watch Online Hindi HD - ${DEFAULT_SITE_NAME}`;
};

export const buildMovieDescription = (title: string, year?: number | string) => {
  const safeYear = year ? String(year) : 'Latest';
  return `Download ${title} (${safeYear}) in Hindi Dubbed 480p, 720p, 1080p. Watch latest South Indian movies, Bollywood, and OTT Web Series on ${DEFAULT_SITE_NAME} - your #1 movie destination.`;
};

export const buildPosterAlt = (title: string) => `${title} Poster ${DEFAULT_SITE_NAME}`;

const toIsoDate = (value?: string | number) => {
  if (!value) return undefined;
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  return undefined;
};

const toIsoDuration = (value?: unknown) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string' && value.startsWith('PT')) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) return `PT${trimmed}M`;
  }
  if (typeof value === 'number' && value > 0) return `PT${Math.round(value)}M`;
  return undefined;
};

const resolveContentDate = (content: Content) => {
  return (
    toIsoDate(content.updatedAt as string | number | undefined) ||
    toIsoDate(content.createdAt as string | number | undefined) ||
    (content.year ? `${content.year}-01-01T00:00:00.000Z` : undefined)
  );
};

const resolveDuration = (content: Content) => {
  const value = (content as Content & { duration?: number | string; runtime?: number | string }).duration
    ?? (content as Content & { runtime?: number | string }).runtime;
  return toIsoDuration(value);
};

export const buildMovieSchema = (content: Content, canonicalUrl?: string) => {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: content.title,
    image: content.poster,
    genre: content.category,
  };

  const releaseDate = resolveContentDate(content);
  if (releaseDate) data.datePublished = releaseDate;

  if (typeof content.rating === 'number' && content.rating > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: content.rating,
      bestRating: 10,
      ratingCount: Math.max(1, Number(content.views || 1)),
    };
  }

  const duration = resolveDuration(content);
  if (duration) data.duration = duration;

  if (canonicalUrl) data.url = canonicalUrl;

  return data;
};

export const buildVideoSchema = (content: Content, canonicalUrl?: string) => {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: content.title,
    description: content.storyline,
    thumbnailUrl: [content.poster, content.backdrop].filter(Boolean),
  };

  const releaseDate = resolveContentDate(content);
  if (releaseDate) data.uploadDate = releaseDate;

  const duration = resolveDuration(content);
  if (duration) data.duration = duration;

  if (canonicalUrl) data.url = canonicalUrl;

  return data;
};

export const getRouteSeoDefaults = (pathname: string) => {
  if (pathname.startsWith('/admin')) return null;

  const map: Record<string, { title: string; description: string }> = {
    '/': {
      title: `${DEFAULT_SITE_NAME} - Latest Movies & Web Series`,
      description: `Watch and download the latest South Indian movies, Bollywood hits, and OTT web series on ${DEFAULT_SITE_NAME}.`,
    },
    '/movies': {
      title: `Movies - ${DEFAULT_SITE_NAME}`,
      description: `Browse the latest movie downloads, Hindi dubbed releases, and HD streaming on ${DEFAULT_SITE_NAME}.`,
    },
    '/series': {
      title: `Web Series - ${DEFAULT_SITE_NAME}`,
      description: `Discover trending OTT web series and binge-worthy seasons on ${DEFAULT_SITE_NAME}.`,
    },
    '/livetv': {
      title: `Live TV - ${DEFAULT_SITE_NAME}`,
      description: `Stream live TV channels and curated networks on ${DEFAULT_SITE_NAME}.`,
    },
    '/watchlist': {
      title: `Watchlist - ${DEFAULT_SITE_NAME}`,
      description: `Keep track of favorite movies and series on ${DEFAULT_SITE_NAME}.`,
    },
    '/upcoming': {
      title: `Upcoming - ${DEFAULT_SITE_NAME}`,
      description: `Preview upcoming movies and releases on ${DEFAULT_SITE_NAME}.`,
    },
    '/subscription': {
      title: `Subscriptions - ${DEFAULT_SITE_NAME}`,
      description: `Manage subscriptions and ad-free viewing on ${DEFAULT_SITE_NAME}.`,
    },
    '/profile': {
      title: `Profile - ${DEFAULT_SITE_NAME}`,
      description: `Manage your profile and preferences on ${DEFAULT_SITE_NAME}.`,
    },
    '/request': {
      title: `Request Content - ${DEFAULT_SITE_NAME}`,
      description: `Request new movies or series on ${DEFAULT_SITE_NAME}.`,
    },
    '/search': {
      title: `Search - ${DEFAULT_SITE_NAME}`,
      description: `Search movies, series, and live TV on ${DEFAULT_SITE_NAME}.`,
    },
    '/about': {
      title: `About - ${DEFAULT_SITE_NAME}`,
      description: `Learn more about ${DEFAULT_SITE_NAME} and its catalog.`,
    },
    '/contact': {
      title: `Contact - ${DEFAULT_SITE_NAME}`,
      description: `Get in touch with the ${DEFAULT_SITE_NAME} team.`,
    },
    '/privacy': {
      title: `Privacy Policy - ${DEFAULT_SITE_NAME}`,
      description: `Read the ${DEFAULT_SITE_NAME} privacy policy.`,
    },
    '/dmca': {
      title: `DMCA - ${DEFAULT_SITE_NAME}`,
      description: `View the ${DEFAULT_SITE_NAME} DMCA policy.`,
    },
  };

  if (map[pathname]) return map[pathname];

  return {
    title: `${DEFAULT_SITE_NAME} - Movies, Series & Live TV`,
    description: `Watch and download movies, web series, and live TV on ${DEFAULT_SITE_NAME}.`,
  };
};
