
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Content, Content as ContentType, Season } from '../types';
import { getContentById, updateUserWatchlist, incrementViewCount, getAllContent } from '../services/firebaseService';
import { useAppContext } from '../hooks/useAppContext';
import CategorySlider from '../components/CategorySlider';
import DownloadModal from '../components/DownloadModal';
import SeoMeta from '../components/SeoMeta';
import { buildMovieDescription, buildMovieSchema, buildMovieTitle, buildPosterAlt, buildVideoSchema } from '../utils/seo';
import { resolveWatchLinks, hasPlayableStream, DEFAULT_STREAM_SERVER } from '../utils/stream';

const DetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, setUser, permissions, appSettings } = useAppContext();
    const [content, setContent] = useState<ContentType | null>(null);
    const [allContent, setAllContent] = useState<ContentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWatchlisted, setIsWatchlisted] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
    
    // Modals
    const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);

    // Native Ad Loader
    useEffect(() => {
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = 'https://pl17643452.effectivegatecpm.com/f61ac2c778516770a6f5d469d542ecfd/invoke.js';
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        Promise.all([
            getContentById(id),
            new Promise<ContentType[]>(res => getAllContent(res))
        ]).then(([data, all]) => {
            setContent(data);
            if (data?.type === 'webseries' && data.seasons) {
                const savedSeasonNum = location.state?.seasonNumber;
                const seasonsArr = (Array.isArray(data.seasons) ? data.seasons : Object.values(data.seasons)) as Season[];
                const sortedSeasons = [...seasonsArr].sort((a, b) => a.number - b.number);
                
                if (savedSeasonNum) {
                    const savedSeason = sortedSeasons.find(s => s.number === savedSeasonNum);
                    setSelectedSeason(savedSeason || sortedSeasons[0]);
                } else {
                    setSelectedSeason(sortedSeasons[0]);
                }
            }
            setAllContent(all);
            setLoading(false);
            
            if (location.state?.openStreamModal) setIsStreamModalOpen(true);
            
            if (location.state) window.history.replaceState({}, document.title);
        });
    }, [id, location.state]);

    useEffect(() => {
        setIsWatchlisted(!!user?.watchlist?.[content?.id ?? '']);
    }, [user, content]);
    
    const recommendations = useMemo(() => {
        if (!content) return [];
        return allContent.filter(item => item.category === content.category && item.id !== content.id).slice(0, 10);
    }, [content, allContent]);

    const handleToggleWatchlist = async () => {
        if (!user || !content?.id) return;
        if (user.isAnonymous) { navigate('/auth'); return; }
        const newStatus = !isWatchlisted;
        setIsWatchlisted(newStatus);
        await updateUserWatchlist(user.id, content.id, newStatus);
        setUser(prev => prev ? ({ ...prev, watchlist: { ...(prev.watchlist), [content.id]: newStatus } }) : null);
    };
    
    const handlePlay = async () => {
        if (!content?.id) return;
        // Allow play without login
        /*
        if (!user) {
            navigate('/auth');
            return;
        }
        */
        
        if (user) {
            await incrementViewCount(user.id);
            setUser(prev => prev ? {...prev, viewCount: prev.viewCount + 1} : null);
        }
        
        const useInternalPlayer = appSettings?.playerConfig?.enableInternalPlayer !== false; 
        if (useInternalPlayer) {
            if (!permissions.shouldShowAds) navigate(`/player/${content.id}`, { state: { season: selectedSeason } });
            else navigate('/ad', { state: { destinationPath: `/player/${content.id}`, destinationState: { season: selectedSeason } } });
        } else {
            if (!permissions.shouldShowAds) setIsStreamModalOpen(true);
            else navigate('/ad', { state: { destinationPath: `/detail/${content.id}`, destinationState: { openStreamModal: true, seasonNumber: selectedSeason?.number } } });
        }
    };

    const handleDownload = () => {
        if (!content?.id) return;
        // Allow download without login
        // if (!user) {
        //    navigate('/auth');
        //    return;
        // }

        if (!permissions.shouldShowAds) {
            navigate(`/download/${content.id}`, { state: { seasonNumber: selectedSeason?.number } });
        } else {
            navigate('/ad', { state: { destinationPath: `/download/${content.id}`, destinationState: { seasonNumber: selectedSeason?.number } } });
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i></div>;
    if (!content) return <div className="text-center py-20">Content not found.</div>;

    const seasonsArr = content.type === 'webseries' && content.seasons ? (Array.isArray(content.seasons) ? content.seasons : Object.values(content.seasons)) as Season[] : [];
    const sortedSeasons = [...seasonsArr].sort((a, b) => a.number - b.number);

    const defaultStreamBaseUrl = appSettings?.playerConfig?.defaultServerBaseUrl || DEFAULT_STREAM_SERVER;
    const downloadLinks = content.type === 'webseries' && selectedSeason ? (Array.isArray(selectedSeason.qualityLinks) ? selectedSeason.qualityLinks : Object.values(selectedSeason.qualityLinks || {})) : (Array.isArray(content.qualityLinks) ? content.qualityLinks : Object.values(content.qualityLinks || {}));
    const watchLinks = resolveWatchLinks(content, selectedSeason, defaultStreamBaseUrl);

    const hasPlayLinks = watchLinks.length > 0 || hasPlayableStream(content, selectedSeason);
    const hasDownloadLinks = downloadLinks.length > 0;

    const cast = Array.isArray(content.cast) ? content.cast : (content.cast ? Object.values(content.cast) : []);

    const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/#${location.pathname}` : undefined;
    const seoTitle = buildMovieTitle(content.title, content.year);
    const seoDescription = buildMovieDescription(content.title, content.year);
    const movieSchema = buildMovieSchema(content, canonicalUrl);
    const videoSchema = buildVideoSchema(content, canonicalUrl);

    return (
        <div>
            <SeoMeta title={seoTitle} description={seoDescription} structuredData={[movieSchema, videoSchema]} schemaId={`seo-schema-${content.id}`} />
            <div className="relative h-64 md:h-96 w-full">
                <img src={content.backdrop} alt={content.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/70 to-transparent"></div>
            </div>
            
            <div className="p-4 md:p-6 -mt-24 md:-mt-32 relative md:max-w-5xl md:mx-auto">
                <div className="md:flex md:gap-6 items-end">
                    <img src={content.poster} alt={buildPosterAlt(content.title)} className="w-32 md:w-48 rounded-lg shadow-lg aspect-[2/3] flex-shrink-0 border-4 border-[var(--primary-color)]"/>
                    <div className="mt-4 md:mt-0">
                        <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">{content.title}</h1>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-300 mt-2">
                            <span className="flex items-center gap-1.5">
                                <i className="far fa-calendar-alt text-[var(--primary-color)]"></i> 
                                {content.year}
                            </span>
                            <span className="capitalize flex items-center gap-1.5">
                                <i className="fas fa-video text-[var(--primary-color)]"></i> 
                                {content.type}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <i className="fas fa-language text-[var(--primary-color)]"></i> 
                                {content.language}
                            </span>
                            <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                                <i className="fas fa-star"></i> 
                                {content.rating}/10
                            </span>
                        </div>
                    </div>
                </div>

                {content.type === 'webseries' && sortedSeasons.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-bold mb-4">Seasons</h2>
                        <div className="flex flex-wrap gap-3">
                            {sortedSeasons.map(s => (
                                <button key={s.number} onClick={() => setSelectedSeason(s)} className={`px-4 py-2 font-bold rounded-md border ${selectedSeason?.number === s.number ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' : 'bg-black/20 border-[var(--border-color)]'}`}>
                                    Season {s.number}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        {hasPlayLinks && (
                            <button onClick={handlePlay} className="flex-grow bg-[var(--primary-color)] text-white font-bold py-3 rounded-lg shadow-lg">Play Now</button>
                        )}
                        <button onClick={handleToggleWatchlist} className={`${hasPlayLinks ? 'w-28' : 'flex-grow'} bg-[var(--card-bg)] border border-[var(--border-color)] font-semibold py-3 rounded-lg text-sm transition-colors`}>
                             <i className={`fas fa-bookmark ${isWatchlisted ? 'text-[var(--primary-color)]' : 'text-gray-400'} mr-2`}></i>
                             {isWatchlisted ? 'Saved' : 'Save'}
                        </button>
                    </div>
                    {hasDownloadLinks && (
                        <button onClick={handleDownload} className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--primary-color)] font-bold py-3 rounded-lg">Download</button>
                    )}
                </div>
                
                <p className="mt-6 text-[var(--secondary-text-color)] text-sm leading-relaxed">{content.storyline}</p>
                
                {cast.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Cast</h2>
                        <div className="cast-slider flex overflow-x-auto gap-4 pb-2">
                            {cast.map(member => (
                                <div key={member.name} className="flex-shrink-0 w-24 text-center">
                                    <img src={member.image} alt={member.name} className="w-20 h-20 mx-auto rounded-full object-cover mb-2" />
                                    <p className="text-sm font-semibold truncate">{member.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {recommendations.length > 0 && (
                    <div className="mt-12 -mx-4 md:-mx-6">
                        <CategorySlider title="You Might Also Like" items={recommendations} />
                        
                        {/* NATIVE ADS PLACEMENT */}
                        <div className="px-4 py-6">
                            <div id="container-f61ac2c778516770a6f5d469d542ecfd" className="w-full min-h-[100px] flex justify-center items-center bg-black/5 rounded-lg overflow-hidden">
                                {/* Ad Content from invoke.js */}
                            </div>
                        </div>
                    </div>
                )}

                <DownloadModal isOpen={isStreamModalOpen} onClose={() => setIsStreamModalOpen(false)} links={watchLinks} title={content.title} actionType="stream" />
            </div>
        </div>
    );
};

export default DetailPage;
