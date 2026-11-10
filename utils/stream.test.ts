import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatStreamUrl, resolveWatchLinks, hasPlayableStream, DEFAULT_STREAM_SERVER } from './stream.ts';
import type { Content, Season } from '../types.ts';

test('formatStreamUrl correctly formats IMDb IDs and TMDB IDs', () => {
    assert.equal(
        formatStreamUrl('tt36931126'),
        'https://slast430did.com/play/tt36931126'
    );
    assert.equal(
        formatStreamUrl('1072790'),
        'https://slast430did.com/play/1072790'
    );
    assert.equal(
        formatStreamUrl('https://slast430did.com/play/tt36931126'),
        'https://slast430did.com/play/tt36931126'
    );
    assert.equal(
        formatStreamUrl('tt36931126', 'https://custom-server.com/watch/'),
        'https://custom-server.com/watch/tt36931126'
    );
    assert.equal(
        formatStreamUrl('tt36931126', DEFAULT_STREAM_SERVER, 1),
        'https://slast430did.com/play/tt36931126?s=1'
    );
    assert.equal(
        formatStreamUrl('tt36931126', DEFAULT_STREAM_SERVER, 2, 4),
        'https://slast430did.com/play/tt36931126?s=2&e=4'
    );
});

test('resolveWatchLinks integrates explicit links and auto-generated Slast streams for movies', () => {
    const movieWithIds: Content = {
        id: 'movie-1',
        title: 'Immortal',
        type: 'movie',
        poster: 'https://example.com/poster.jpg',
        backdrop: 'https://example.com/backdrop.jpg',
        year: 2026,
        language: 'Tamil',
        rating: 8.5,
        storyline: 'Immortal action movie',
        category: 'South Indian',
        imdbId: 'tt36931126',
        tmdbId: '1072790',
        watchLinks: [
            { quality: '1080p', url: 'https://existing-server.com/play/immortal' }
        ]
    };

    const resolved = resolveWatchLinks(movieWithIds, null);
    assert.equal(resolved.length, 3);
    assert.equal(resolved[0].quality, '1080p');
    assert.equal(resolved[0].url, 'https://existing-server.com/play/immortal');
    assert.equal(resolved[1].quality, 'Slast Player (IMDb)');
    assert.equal(resolved[1].url, 'https://slast430did.com/play/tt36931126');
    assert.equal(resolved[2].quality, 'Slast Player (TMDB)');
    assert.equal(resolved[2].url, 'https://slast430did.com/play/1072790');
});

test('resolveWatchLinks deduplicates identical stream links', () => {
    const movieWithDuplicate: Content = {
        id: 'movie-2',
        title: 'Immortal',
        type: 'movie',
        poster: 'https://example.com/poster.jpg',
        backdrop: 'https://example.com/backdrop.jpg',
        year: 2026,
        language: 'Tamil',
        rating: 8.5,
        storyline: 'Immortal action movie',
        category: 'South Indian',
        imdbId: 'tt36931126',
        watchLinks: [
            { quality: 'Slast Server', url: 'https://slast430did.com/play/tt36931126' }
        ]
    };

    const resolved = resolveWatchLinks(movieWithDuplicate, null);
    assert.equal(resolved.length, 1);
    assert.equal(resolved[0].url, 'https://slast430did.com/play/tt36931126');
});

test('resolveWatchLinks handles web series seasons with IMDb ID', () => {
    const season1: Season = {
        number: 1,
        qualityLinks: [],
        imdbId: 'tt36931126'
    };

    const webseries: Content = {
        id: 'series-1',
        title: 'Stranger Tales',
        type: 'webseries',
        poster: 'https://example.com/poster.jpg',
        backdrop: 'https://example.com/backdrop.jpg',
        year: 2025,
        language: 'English',
        rating: 8.9,
        storyline: 'Sci-fi series',
        category: 'Web Series',
        seasons: [season1]
    };

    const resolved = resolveWatchLinks(webseries, season1);
    assert.equal(resolved.length, 1);
    assert.equal(resolved[0].quality, 'Slast Player (S1 IMDb)');
    assert.equal(resolved[0].url, 'https://slast430did.com/play/tt36931126?s=1');
});

test('hasPlayableStream detects playable movies and web series', () => {
    assert.equal(hasPlayableStream(null), false);
    assert.equal(hasPlayableStream({
        id: 'm1',
        title: 'Empty Movie',
        type: 'movie',
        poster: '',
        backdrop: '',
        year: 2024,
        language: 'Hindi',
        rating: 7,
        storyline: '',
        category: 'Bollywood'
    }), false);

    assert.equal(hasPlayableStream({
        id: 'm2',
        title: 'IMDb Movie',
        type: 'movie',
        poster: '',
        backdrop: '',
        year: 2026,
        language: 'Tamil',
        rating: 8,
        storyline: '',
        category: 'South Indian',
        imdbId: 'tt36931126'
    }), true);

    assert.equal(hasPlayableStream({
        id: 'm3',
        title: 'TMDB Movie',
        type: 'movie',
        poster: '',
        backdrop: '',
        year: 2026,
        language: 'Hindi',
        rating: 8,
        storyline: '',
        category: 'Bollywood',
        tmdbId: '1072790'
    }), true);
});
