import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Content, QualityLink, Season, CastMember } from '../../types';
import { getContentById, addContent, updateContent } from '../../services/firebaseService';
import { formatStreamUrl, DEFAULT_STREAM_SERVER } from '../../utils/stream';
import { useAppContext } from '../../hooks/useAppContext';

const AdminContentForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { appSettings } = useAppContext();
    
    // Initialize with safe defaults to prevent "undefined" errors
    const [content, setContent] = useState<Partial<Content>>({
        type: 'movie',
        category: '',
        imdbId: '',
        tmdbId: '',
        cast: [],
        qualityLinks: [], 
        watchLinks: [], 
        seasons: [],
        isFeatured: false
    });
    const [loading, setLoading] = useState(false);

    // Updated category list
    const categories = [
        'Hollywood', 
        'Bollywood', 
        'Web Series', 
        'South Indian', 
        'Punjabi', 
        'Bhojpuri', 
        '18+', 
        'Upcoming',
        'Others'
    ];

    useEffect(() => {
        if (id) {
            setLoading(true);
            getContentById(id).then(data => {
                if (data) {
                    // Critical Fix: Ensure these are Arrays. Firebase may return objects for array-like structures.
                    setContent({
                        ...data,
                        imdbId: data.imdbId || '',
                        tmdbId: data.tmdbId || '',
                        sliderPoster: data.sliderPoster || '',
                        cast: Array.isArray(data.cast) ? data.cast : (data.cast ? Object.values(data.cast) : []),
                        qualityLinks: Array.isArray(data.qualityLinks) ? data.qualityLinks : (data.qualityLinks ? Object.values(data.qualityLinks) : []),
                        watchLinks: Array.isArray(data.watchLinks) ? data.watchLinks : (data.watchLinks ? Object.values(data.watchLinks) : []),
                        seasons: Array.isArray(data.seasons) ? data.seasons : (data.seasons ? Object.values(data.seasons) : []),
                        isFeatured: data.isFeatured || false
                    });
                }
                setLoading(false);
            });
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setContent(prev => ({ ...prev, [name]: val }));
    };

    const handleNestedChange = (index: number, field: string, value: any, list: keyof Pick<Content, 'cast' | 'qualityLinks' | 'watchLinks' | 'seasons'>) => {
        setContent(prev => {
            const rawList = prev[list];
            const currentList = Array.isArray(rawList) ? rawList : (rawList ? Object.values(rawList) : []);
            const newList = [...(currentList as any[])];
            if (newList[index]) {
                newList[index] = { ...newList[index], [field]: value };
            }
            return { ...prev, [list]: newList };
        });
    };
    
    const handleSeasonLinkChange = (seasonIndex: number, linkIndex: number, field: string, value: any, linkType: 'qualityLinks' | 'watchLinks') => {
        setContent(prev => {
            const rawSeasons = prev.seasons;
            const currentSeasons = Array.isArray(rawSeasons) ? rawSeasons : (rawSeasons ? Object.values(rawSeasons) : []);
            if (!currentSeasons[seasonIndex]) return prev;

            const newSeasons = [...currentSeasons];
            const rawLinks = newSeasons[seasonIndex][linkType];
            const targetLinks = Array.isArray(rawLinks) ? rawLinks : (rawLinks ? Object.values(rawLinks) : []);
            
            const newLinks = [...targetLinks];
            if (newLinks[linkIndex]) {
                newLinks[linkIndex] = { ...newLinks[linkIndex], [field]: value };
            }
            
            newSeasons[seasonIndex] = { ...newSeasons[seasonIndex], [linkType]: newLinks };
            return { ...prev, seasons: newSeasons };
        });
    };

    const addListItem = (list: keyof Pick<Content, 'cast' | 'qualityLinks' | 'watchLinks' | 'seasons'>) => {
         setContent(prev => {
            const rawList = prev[list];
            const currentList = Array.isArray(rawList) ? rawList : (rawList ? Object.values(rawList) : []);
            let newItem;
            if (list === 'qualityLinks' || list === 'watchLinks') {
                newItem = { quality: '720p', url: '' };
            } else if (list === 'seasons') {
                newItem = { number: (currentList.length + 1), qualityLinks: [], watchLinks: [], imdbId: '', tmdbId: '' };
            } else { // cast
                newItem = { name: '', image: '' };
            }
            return { ...prev, [list]: [...currentList, newItem] };
        });
    };

    const addSeasonLink = (seasonIndex: number, linkType: 'qualityLinks' | 'watchLinks') => {
        setContent(prev => {
            const rawSeasons = prev.seasons;
            const currentSeasons = Array.isArray(rawSeasons) ? rawSeasons : (rawSeasons ? Object.values(rawSeasons) : []);
            if (!currentSeasons[seasonIndex]) return prev;

            const newSeasons = [...currentSeasons];
            const rawLinks = newSeasons[seasonIndex][linkType];
            const currentLinks = Array.isArray(rawLinks) ? rawLinks : (rawLinks ? Object.values(rawLinks) : []);
            
            newSeasons[seasonIndex] = { 
                ...newSeasons[seasonIndex], 
                [linkType]: [...currentLinks, { quality: '720p', url: '' }]
            };
            return { ...prev, seasons: newSeasons };
        });
    };

    const removeListItem = (index: number, list: keyof Pick<Content, 'cast' | 'qualityLinks' | 'watchLinks' | 'seasons'>) => {
        setContent(prev => {
            const rawList = prev[list];
            const currentList = Array.isArray(rawList) ? rawList : (rawList ? Object.values(rawList) : []);
            const newList = [...currentList];
            newList.splice(index, 1);
            return { ...prev, [list]: newList };
        });
    };

    const removeSeasonLink = (seasonIndex: number, linkIndex: number, linkType: 'qualityLinks' | 'watchLinks') => {
        setContent(prev => {
            const rawSeasons = prev.seasons;
            const currentSeasons = Array.isArray(rawSeasons) ? rawSeasons : (rawSeasons ? Object.values(rawSeasons) : []);
            if (!currentSeasons[seasonIndex]) return prev;

            const newSeasons = [...currentSeasons];
            const rawLinks = newSeasons[seasonIndex][linkType];
            const currentLinks = Array.isArray(rawLinks) ? rawLinks : (rawLinks ? Object.values(rawLinks) : []);
            
            const newLinks = [...currentLinks];
            newLinks.splice(linkIndex, 1);
            newSeasons[seasonIndex] = { ...newSeasons[seasonIndex], [linkType]: newLinks };
            return { ...prev, seasons: newSeasons };
        });
    };

    // Quick helper to populate Slast Player link directly into Watch Links
    const handleAddSlastWatchLink = (sourceType: 'imdb' | 'tmdb') => {
        const idVal = sourceType === 'imdb' ? content.imdbId?.trim() : content.tmdbId?.trim();
        if (!idVal) {
            alert(`Please enter a valid ${sourceType.toUpperCase()} ID first!`);
            return;
        }

        const streamUrl = formatStreamUrl(idVal);
        const label = sourceType === 'imdb' ? 'Slast Player (IMDb)' : 'Slast Player (TMDB)';

        setContent(prev => {
            const rawLinks = prev.watchLinks;
            const currentLinks = Array.isArray(rawLinks) ? rawLinks : (rawLinks ? Object.values(rawLinks) : []);
            
            if (currentLinks.some(l => l.url === streamUrl)) {
                alert('This stream URL is already in Watch Links!');
                return prev;
            }

            return {
                ...prev,
                watchLinks: [...currentLinks, { quality: label, url: streamUrl }]
            };
        });
    };

    // Quick helper to add Slast Player link to a specific Season
    const handleAddSeasonSlastLink = (seasonIndex: number) => {
        setContent(prev => {
            const rawSeasons = prev.seasons;
            const currentSeasons = Array.isArray(rawSeasons) ? rawSeasons : (rawSeasons ? Object.values(rawSeasons) : []);
            const targetSeason = currentSeasons[seasonIndex];
            if (!targetSeason) return prev;

            const idVal = targetSeason.imdbId?.trim() || targetSeason.tmdbId?.trim() || prev.imdbId?.trim() || prev.tmdbId?.trim();
            if (!idVal) {
                alert('Please enter an IMDb ID or TMDB ID (either for this season or in main content) first!');
                return prev;
            }

            const streamUrl = formatStreamUrl(idVal, undefined, targetSeason.number);
            const rawLinks = targetSeason.watchLinks;
            const currentLinks = Array.isArray(rawLinks) ? rawLinks : (rawLinks ? Object.values(rawLinks) : []);

            if (currentLinks.some(l => l.url === streamUrl)) {
                alert(`Stream for Season ${targetSeason.number} is already added!`);
                return prev;
            }

            const newSeasons = [...currentSeasons];
            newSeasons[seasonIndex] = {
                ...targetSeason,
                watchLinks: [...currentLinks, { quality: `Slast Player (S${targetSeason.number})`, url: streamUrl }]
            };
            return { ...prev, seasons: newSeasons };
        });
    };

    const handleShortenLink = (index: number) => {
        const rawList = content.qualityLinks;
        const currentList = Array.isArray(rawList) ? rawList : (rawList ? Object.values(rawList) : []);
        const rawUrl = currentList[index]?.url?.trim();
        if (!rawUrl) {
            alert("Please enter a Download URL first!");
            return;
        }
        const shortener = appSettings?.urlShortener;
        if (shortener?.enabled && shortener.apiTemplate) {
            let template = shortener.apiTemplate;
            template = template.replace('{API_KEY}', encodeURIComponent(shortener.apiKey || '')).replace('{URL}', encodeURIComponent(rawUrl));
            handleNestedChange(index, 'url', template, 'qualityLinks');
            alert("Download Link formatted with URL Shortener!");
        } else {
            alert("To auto-shorten, configure your Shortener API in Admin -> Settings -> Download Button & URL Shortener.");
        }
    };

    const handleShortenSeasonLink = (seasonIndex: number, linkIndex: number) => {
        const rawSeasons = content.seasons;
        const currentSeasons = Array.isArray(rawSeasons) ? rawSeasons : (rawSeasons ? Object.values(rawSeasons) : []);
        const rawLinks = currentSeasons[seasonIndex]?.qualityLinks;
        const targetLinks = Array.isArray(rawLinks) ? rawLinks : (rawLinks ? Object.values(rawLinks) : []);
        const rawUrl = targetLinks[linkIndex]?.url?.trim();
        if (!rawUrl) {
            alert("Please enter a Download URL first!");
            return;
        }
        const shortener = appSettings?.urlShortener;
        if (shortener?.enabled && shortener.apiTemplate) {
            let template = shortener.apiTemplate;
            template = template.replace('{API_KEY}', encodeURIComponent(shortener.apiKey || '')).replace('{URL}', encodeURIComponent(rawUrl));
            handleSeasonLinkChange(seasonIndex, linkIndex, 'url', template, 'qualityLinks');
            alert("Download Link formatted with URL Shortener!");
        } else {
            alert("To auto-shorten, configure your Shortener API in Admin -> Settings -> Download Button & URL Shortener.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Use current ISO time for new content
            const now = new Date().toISOString(); 
            const finalContent = { 
                ...content,
                imdbId: content.imdbId?.trim() || '',
                tmdbId: content.tmdbId?.trim() || '',
                sliderPoster: content.sliderPoster?.trim() || '',
                updatedAt: now, 
                createdAt: id ? (content.createdAt || now) : now 
            };

            if (id) {
                await updateContent(id, finalContent as Content);
            } else {
                await addContent(finalContent as Omit<Content, 'id'>);
            }
            navigate('/admin/content');
        } catch (error) {
            console.error("Failed to save content:", error);
            alert("Failed to save content. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) {
        return <div className="flex justify-center items-center h-64"><i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i></div>;
    }

    const cast = Array.isArray(content.cast) ? content.cast : (content.cast ? Object.values(content.cast) : []);
    const qLinks = Array.isArray(content.qualityLinks) ? content.qualityLinks : (content.qualityLinks ? Object.values(content.qualityLinks) : []);
    const wLinks = Array.isArray(content.watchLinks) ? content.watchLinks : (content.watchLinks ? Object.values(content.watchLinks) : []);
    const seasons = Array.isArray(content.seasons) ? content.seasons : (content.seasons ? Object.values(content.seasons) : []);

    const activePreviewId = content.imdbId?.trim() || content.tmdbId?.trim();
    const activePreviewUrl = activePreviewId ? formatStreamUrl(activePreviewId) : '';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{id ? 'Edit Content' : 'Add New Content'}</h1>
                <button type="submit" disabled={loading} className="bg-[var(--primary-color)] text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity">
                    {loading ? 'Saving...' : 'Save Content'}
                </button>
            </div>
            
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--card-bg)] p-6 rounded-lg">
                <input name="title" value={content.title || ''} onChange={handleChange} placeholder="Title" required className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded" />
                <select name="type" value={content.type} onChange={handleChange} className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded">
                    <option value="movie">Movie</option>
                    <option value="webseries">Web Series</option>
                </select>
                <input name="year" type="number" value={content.year || ''} onChange={handleChange} placeholder="Year" className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded" />
                <input name="language" value={content.language || ''} onChange={handleChange} placeholder="Language" className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded" />
                <input name="rating" type="number" step="0.1" value={content.rating || ''} onChange={handleChange} placeholder="Rating" className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded" />
                <select name="category" value={content.category || ''} onChange={handleChange} required className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded">
                    <option value="" disabled>Select a Category</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <div className="md:col-span-2 bg-[var(--bg-color)] p-3 rounded border border-[var(--border-color)] flex items-center gap-3">
                    <input type="checkbox" id="isFeatured" name="isFeatured" checked={content.isFeatured || false} onChange={handleChange} className="w-5 h-5 accent-[var(--primary-color)]" />
                    <label htmlFor="isFeatured" className="cursor-pointer select-none">
                        <span className="font-bold text-[var(--primary-color)]">Feature in Home Slider</span>
                    </label>
                </div>
                <textarea name="storyline" value={content.storyline || ''} onChange={handleChange} placeholder="Storyline" className="md:col-span-2 p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded" rows={4} />
                <div>
                    <label className="font-semibold block mb-1">Poster Image URL</label>
                    <input type="url" name="poster" value={content.poster || ''} onChange={handleChange} placeholder="https://..." className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded" />
                </div>
                <div>
                    <label className="font-semibold block mb-1">Backdrop Image URL</label>
                    <input type="url" name="backdrop" value={content.backdrop || ''} onChange={handleChange} placeholder="Used on detail pages" className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded" />
                </div>
                <div className="md:col-span-2 overflow-hidden rounded-2xl border border-[var(--primary-color)]/35 bg-[var(--bg-color)] p-4 md:p-5">
                    <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_112px]">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <i className="fas fa-images text-[var(--primary-color)]" />
                                <label htmlFor="sliderPoster" className="font-bold">Home Slider Poster URL</label>
                                <span className="rounded-full bg-[var(--primary-color)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--primary-color)]">New</span>
                            </div>
                            <p className="mb-3 text-xs leading-5 text-[var(--secondary-text-color)]">Home screen carousel ke liye portrait 2:3 poster link. Blank chhodne par normal Poster Image URL automatically use hoga.</p>
                            <input id="sliderPoster" type="url" name="sliderPoster" value={content.sliderPoster || ''} onChange={handleChange} placeholder="https://example.com/movie-slider-poster.jpg" className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-3 outline-none transition-colors focus:border-[var(--primary-color)]" />
                        </div>
                        <div className="mx-auto aspect-[2/3] w-24 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-xl">
                            {(content.sliderPoster || content.poster) ? (
                                <img src={content.sliderPoster || content.poster} alt="Slider poster preview" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-2 px-2 text-center text-[10px] text-[var(--secondary-text-color)]"><i className="fas fa-image text-2xl opacity-50" />Preview</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Third-Party Stream Player (Slast / IMDb / TMDB) */}
            <div className="bg-[var(--card-bg)] p-6 rounded-lg border-2 border-amber-500/40 shadow-lg">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-play-circle text-2xl text-amber-400"></i>
                        <div>
                            <h2 className="text-xl font-bold text-amber-300">Third-Party Stream Player (Slast Player)</h2>
                            <p className="text-xs text-[var(--secondary-text-color)]">
                                Enter an IMDb ID (e.g. <span className="font-mono text-amber-200">tt36931126</span>) or TMDB ID. The video player will automatically stream from <span className="font-mono text-amber-200">https://slast430did.com/play/&#123;id&#125;</span>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-200">
                            <i className="fab fa-imdb text-yellow-500 mr-1 text-base"></i> IMDb ID
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="imdbId"
                                value={content.imdbId || ''}
                                onChange={handleChange}
                                placeholder="e.g. tt36931126"
                                className="flex-grow p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded font-mono text-sm"
                            />
                            {content.type === 'movie' && (
                                <button
                                    type="button"
                                    onClick={() => handleAddSlastWatchLink('imdb')}
                                    disabled={!content.imdbId?.trim()}
                                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded text-xs font-bold whitespace-nowrap"
                                    title="Add to Watch Links below"
                                >
                                    + Add to Links
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-200">
                            <i className="fas fa-film text-blue-400 mr-1"></i> TMDB ID
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="tmdbId"
                                value={content.tmdbId || ''}
                                onChange={handleChange}
                                placeholder="e.g. 1072790"
                                className="flex-grow p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded font-mono text-sm"
                            />
                            {content.type === 'movie' && (
                                <button
                                    type="button"
                                    onClick={() => handleAddSlastWatchLink('tmdb')}
                                    disabled={!content.tmdbId?.trim()}
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded text-xs font-bold whitespace-nowrap"
                                    title="Add to Watch Links below"
                                >
                                    + Add to Links
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {activePreviewUrl && (
                    <div className="mt-4 p-3 bg-black/40 rounded-lg border border-amber-500/20 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold uppercase tracking-wider">Stream URL Preview:</span>
                            <span className="font-mono text-gray-300 break-all">{activePreviewUrl}</span>
                        </div>
                        <a
                            href={activePreviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 underline"
                        >
                            Test Stream <i className="fas fa-external-link-alt text-[10px]"></i>
                        </a>
                    </div>
                )}
            </div>

            {/* Cast */}
            <div className="bg-[var(--card-bg)] p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Cast</h2>
                {cast.map((member, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 items-center">
                        <input value={member.name} onChange={(e) => handleNestedChange(index, 'name', e.target.value, 'cast')} placeholder="Name" className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded"/>
                        <input value={member.image} onChange={(e) => handleNestedChange(index, 'image', e.target.value, 'cast')} placeholder="Image URL" className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded"/>
                        <button type="button" onClick={() => removeListItem(index, 'cast')} className="text-red-500 hover:underline text-sm">Remove</button>
                    </div>
                ))}
                <button type="button" onClick={() => addListItem('cast')} className="text-green-500 font-semibold mt-2">+ Add Cast Member</button>
            </div>
            
            {/* Links & Seasons */}
            {content.type === 'movie' ? (
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-blue-500/30">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-blue-400">Watch Links (Stream)</h2>
                            <span className="text-xs text-[var(--secondary-text-color)]">
                                Note: IMDb or TMDB ID will also automatically be used as a stream server!
                            </span>
                        </div>
                        {wLinks.map((link, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 items-center">
                                <input value={link.quality} onChange={(e) => handleNestedChange(index, 'quality', e.target.value, 'watchLinks')} placeholder="Server / Quality Label" className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded"/>
                                <input value={link.url} onChange={(e) => handleNestedChange(index, 'url', e.target.value, 'watchLinks')} placeholder="Embed URL or IMDb/TMDB ID" className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded font-mono text-sm"/>
                                <button type="button" onClick={() => removeListItem(index, 'watchLinks')} className="text-red-500 hover:underline text-sm">Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addListItem('watchLinks')} className="text-blue-500 font-semibold mt-2">+ Add Watch Link</button>
                    </div>

                    <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-green-500/30">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                            <h2 className="text-xl font-bold text-green-400">Download Links</h2>
                            <span className="text-xs text-green-300/80 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                                Direct & URL Shortener links supported (GPLinks, ShrinkMe, Droplink, etc.)
                            </span>
                        </div>
                        {qLinks.map((link, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-[130px_1fr_auto_auto] gap-2 mb-2 items-center">
                                <input value={link.quality} onChange={(e) => handleNestedChange(index, 'quality', e.target.value, 'qualityLinks')} placeholder="Quality" className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-sm"/>
                                <input value={link.url} onChange={(e) => handleNestedChange(index, 'url', e.target.value, 'qualityLinks')} placeholder="Download URL or Shortener Link" className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded font-mono text-sm"/>
                                <button type="button" onClick={() => handleShortenLink(index)} className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 px-2.5 py-1.5 rounded text-xs font-bold" title="Convert with URL Shortener API">
                                    ⚡ Shorten
                                </button>
                                <button type="button" onClick={() => removeListItem(index, 'qualityLinks')} className="text-red-500 hover:underline text-sm px-1">Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addListItem('qualityLinks')} className="text-green-500 font-semibold mt-2">+ Add Download Link</button>
                    </div>
                </div>
            ) : (
                <div className="bg-[var(--card-bg)] p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Seasons</h2>
                    {seasons.map((season, sIdx) => {
                        const sWLinks = Array.isArray(season.watchLinks) ? season.watchLinks : (season.watchLinks ? Object.values(season.watchLinks) : []);
                        const sDLinks = Array.isArray(season.qualityLinks) ? season.qualityLinks : (season.qualityLinks ? Object.values(season.qualityLinks) : []);
                        return (
                            <div key={sIdx} className="p-4 border border-[var(--border-color)] rounded mb-4 bg-black/20">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 items-center">
                                    <input type="number" value={season.number} onChange={(e) => handleNestedChange(sIdx, 'number', parseInt(e.target.value), 'seasons')} placeholder="Season No." className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded"/>
                                    <input type="text" value={season.imdbId || ''} onChange={(e) => handleNestedChange(sIdx, 'imdbId', e.target.value, 'seasons')} placeholder="Season IMDb ID (optional)" className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded font-mono text-xs"/>
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={season.tmdbId || ''} onChange={(e) => handleNestedChange(sIdx, 'tmdbId', e.target.value, 'seasons')} placeholder="Season TMDB ID (optional)" className="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded font-mono text-xs flex-grow"/>
                                        <button type="button" onClick={() => removeListItem(sIdx, 'seasons')} className="text-red-500 hover:underline text-sm flex-shrink-0">Remove</button>
                                    </div>
                                </div>

                                <div className="mb-4 pl-4 border-l-2 border-blue-500/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-sm text-blue-400">Watch Links (Season {season.number})</h3>
                                        <button
                                            type="button"
                                            onClick={() => handleAddSeasonSlastLink(sIdx)}
                                            className="text-amber-400 hover:text-amber-300 text-xs font-bold"
                                        >
                                            ⚡ Auto-Add Slast Stream
                                        </button>
                                    </div>
                                    {sWLinks.map((link, lIdx) => (
                                        <div key={lIdx} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 items-center">
                                            <input value={link.quality} onChange={(e) => handleSeasonLinkChange(sIdx, lIdx, 'quality', e.target.value, 'watchLinks')} placeholder="Quality / Label" className="p-2 text-xs bg-[var(--bg-color)] border border-[var(--border-color)] rounded"/>
                                            <input value={link.url} onChange={(e) => handleSeasonLinkChange(sIdx, lIdx, 'url', e.target.value, 'watchLinks')} placeholder="URL or IMDb/TMDB ID" className="p-2 text-xs bg-[var(--bg-color)] border border-[var(--border-color)] rounded font-mono"/>
                                            <button type="button" onClick={() => removeSeasonLink(sIdx, lIdx, 'watchLinks')} className="text-red-500 text-xs">Remove</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addSeasonLink(sIdx, 'watchLinks')} className="text-blue-500 text-sm mt-2">+ Add Stream</button>
                                </div>

                                <div className="pl-4 border-l-2 border-green-500/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-sm text-green-400">Download Links</h3>
                                        <span className="text-[11px] text-green-300/80">Direct or Shortened URLs</span>
                                    </div>
                                    {sDLinks.map((link, lIdx) => (
                                        <div key={lIdx} className="grid grid-cols-1 md:grid-cols-[110px_1fr_auto_auto] gap-2 mb-2 items-center">
                                            <input value={link.quality} onChange={(e) => handleSeasonLinkChange(sIdx, lIdx, 'quality', e.target.value, 'qualityLinks')} placeholder="Quality" className="p-2 text-xs bg-[var(--bg-color)] border border-[var(--border-color)] rounded"/>
                                            <input value={link.url} onChange={(e) => handleSeasonLinkChange(sIdx, lIdx, 'url', e.target.value, 'qualityLinks')} placeholder="Download URL / Shortener Link" className="p-2 text-xs bg-[var(--bg-color)] border border-[var(--border-color)] rounded font-mono"/>
                                            <button type="button" onClick={() => handleShortenSeasonLink(sIdx, lIdx)} className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 px-2 py-1 rounded text-[11px] font-bold" title="Convert with URL Shortener">
                                                ⚡ Shorten
                                            </button>
                                            <button type="button" onClick={() => removeSeasonLink(sIdx, lIdx, 'qualityLinks')} className="text-red-500 text-xs px-1">Remove</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addSeasonLink(sIdx, 'qualityLinks')} className="text-green-500 text-sm mt-2">+ Add Download</button>
                                </div>
                            </div>
                        )
                    })}
                    <button type="button" onClick={() => addListItem('seasons')} className="text-green-500 font-semibold mt-2">+ Add Season</button>
                </div>
            )}
        </form>
    );
};

export default AdminContentForm;
