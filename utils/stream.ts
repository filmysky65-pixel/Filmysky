import type { Content, QualityLink, Season } from '../types.ts';

export const DEFAULT_STREAM_SERVER = 'https://slast430did.com/play/';

/**
 * Normalizes an IMDb ID, TMDB ID, or direct stream link into a full player embed URL.
 * e.g., 'tt36931126' -> 'https://slast430did.com/play/tt36931126'
 * e.g., '1072790' -> 'https://slast430did.com/play/1072790'
 */
export const formatStreamUrl = (
    idOrUrl: string,
    baseUrl: string = DEFAULT_STREAM_SERVER,
    season?: number,
    episode?: number
): string => {
    if (!idOrUrl) return '';
    const trimmed = idOrUrl.trim();
    if (!trimmed) return '';

    let fullUrl: string;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        fullUrl = trimmed;
    } else {
        const cleanBase = (baseUrl || DEFAULT_STREAM_SERVER).replace(/\/+$/, '');
        fullUrl = `${cleanBase}/${trimmed}`;
    }

    // Append season/episode query parameters if provided and not already present
    if (season !== undefined && !fullUrl.includes('s=')) {
        const separator = fullUrl.includes('?') ? '&' : '?';
        if (episode !== undefined) {
            fullUrl = `${fullUrl}${separator}s=${season}&e=${episode}`;
        } else {
            fullUrl = `${fullUrl}${separator}s=${season}`;
        }
    }

    return fullUrl;
};

const toQualityLinks = (raw: any): QualityLink[] => {
    if (!raw) return [];
    const arr = Array.isArray(raw) ? raw : Object.values(raw);
    return arr.filter((item): item is QualityLink => !!item && typeof item === 'object' && 'url' in item);
};

/**
 * Resolves all available watch (streaming) links for a movie or webseries season,
 * integrating any explicit watchLinks with auto-generated links from IMDb ID and TMDB ID.
 */
export const resolveWatchLinks = (
    content?: Content | null,
    currentSeason?: Season | null,
    serverBaseUrl: string = DEFAULT_STREAM_SERVER
): QualityLink[] => {
    if (!content) return [];

    const effectiveBase = serverBaseUrl || DEFAULT_STREAM_SERVER;
    const links: QualityLink[] = [];
    const seenUrls = new Set<string>();

    const addLink = (quality: string, rawUrlOrId: string) => {
        if (!rawUrlOrId) return;
        const formatted = formatStreamUrl(
            rawUrlOrId,
            effectiveBase,
            content.type === 'webseries' ? currentSeason?.number : undefined
        );
        if (formatted && !seenUrls.has(formatted)) {
            seenUrls.add(formatted);
            links.push({ quality, url: formatted });
        }
    };

    if (content.type === 'movie') {
        // 1. If explicit watchLinks are defined in admin, include them
        const explicitLinks = toQualityLinks(content.watchLinks);
        for (const item of explicitLinks) {
            if (item && item.url) {
                addLink(item.quality || 'Server', item.url);
            }
        }

        // 2. Auto-generate from IMDb ID if present
        if (content.imdbId && content.imdbId.trim()) {
            const cleanImdb = content.imdbId.trim();
            addLink('Slast Player (IMDb)', cleanImdb);
        }

        // 3. Auto-generate from TMDB ID if present
        if (content.tmdbId && content.tmdbId.trim()) {
            const cleanTmdb = content.tmdbId.trim();
            addLink('Slast Player (TMDB)', cleanTmdb);
        }
    } else if (content.type === 'webseries') {
        const season = currentSeason || (content.seasons && content.seasons[0]) || null;
        if (season) {
            const explicitLinks = toQualityLinks(season.watchLinks);
            for (const item of explicitLinks) {
                if (item && item.url) {
                    addLink(item.quality || `S${season.number} Server`, item.url);
                }
            }

            // Season-level or Series-level IMDb
            const imdb = season.imdbId || content.imdbId;
            if (imdb && imdb.trim()) {
                addLink(`Slast Player (S${season.number} IMDb)`, imdb.trim());
            }

            // Season-level or Series-level TMDB
            const tmdb = season.tmdbId || content.tmdbId;
            if (tmdb && tmdb.trim()) {
                addLink(`Slast Player (S${season.number} TMDB)`, tmdb.trim());
            }
        }
    }

    return links;
};

/**
 * Checks whether content has any streamable source (either explicit watch links or IMDb/TMDB IDs).
 */
export const hasPlayableStream = (
    content?: Content | null,
    currentSeason?: Season | null
): boolean => {
    if (!content) return false;

    if (content.type === 'movie') {
        if (content.imdbId && content.imdbId.trim()) return true;
        if (content.tmdbId && content.tmdbId.trim()) return true;
        const links = toQualityLinks(content.watchLinks);
        return links.some(l => !!l?.url);
    }

    if (content.type === 'webseries') {
        if (content.imdbId && content.imdbId.trim()) return true;
        if (content.tmdbId && content.tmdbId.trim()) return true;
        const season = currentSeason || (content.seasons && content.seasons[0]);
        if (season) {
            if (season.imdbId && season.imdbId.trim()) return true;
            if (season.tmdbId && season.tmdbId.trim()) return true;
            const links = toQualityLinks(season.watchLinks);
            if (links.some(l => !!l?.url)) return true;
        }
        // Or if any season has watch links
        if (content.seasons && Array.isArray(content.seasons)) {
            return content.seasons.some(s => 
                (s.imdbId && s.imdbId.trim()) ||
                (s.tmdbId && s.tmdbId.trim()) ||
                toQualityLinks(s.watchLinks).some(l => !!l?.url)
            );
        }
    }

    return false;
};
