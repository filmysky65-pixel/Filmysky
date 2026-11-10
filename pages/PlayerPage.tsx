
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Content, Season, QualityLink } from '../types';
import { getContentById, incrementViewCount } from '../services/firebaseService';
import { useAppContext } from '../hooks/useAppContext';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import PlayerHeader from '../components/PlayerHeader';
import SeasonList from '../components/EpisodeList';
import AdBanner from '../components/AdBanner';
import AdContainer from '../components/AdContainer';
import DownloadModal from '../components/DownloadModal';
import CommentsSection from '../components/CommentsSection';
import SeoMeta from '../components/SeoMeta';
import { buildMovieDescription, buildMovieTitle, buildPosterAlt } from '../utils/seo';
import { resolveWatchLinks, DEFAULT_STREAM_SERVER } from '../utils/stream';


const PlayerPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser, permissions, appSettings } = useAppContext();

    const [content, setContent] = useState<Content | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentSeason, setCurrentSeason] = useState<Season | null>(location.state?.season || null);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'episodes' | 'comments'>('episodes');

    useEffect(() => {
        if (!id) {
            navigate('/');
            return;
        }
        setLoading(true);
        getContentById(id).then(data => {
            if (data) {
                setContent(data);
                if (data.type === 'webseries' && !location.state?.season) {
                    const sortedSeasons = [...(data.seasons || [])].sort((a,b) => a.number - b.number);
                    setCurrentSeason(sortedSeasons[0] || null);
                    setActiveTab('episodes');
                } else if (data.type === 'movie') {
                    setActiveTab('comments');
                }
            } else {
                navigate('/');
            }
            setLoading(false);
        });
    }, [id, navigate, location.state?.season]);

    const handleSeasonSelect = async (season: Season) => {
        if (!user || !content?.id) return;

        if (currentSeason && season.number !== currentSeason.number) {
            // Check if ads should be skipped (e.g. Premium User)
            if (!permissions.shouldShowAds) {
                setCurrentSeason(season);
            } else {
                 // Go to Ad Page first if changing season and not premium
                 navigate('/ad', {
                    state: {
                        destinationPath: `/player/${content.id}`,
                        destinationState: { season: season }
                    }
                });
            }
        } else {
             setCurrentSeason(season);
        }
    };

    const defaultStreamBaseUrl = appSettings?.playerConfig?.defaultServerBaseUrl || DEFAULT_STREAM_SERVER;

    // Watch Links (Streaming / Iframe) - Resolves explicit links + IMDb ID / TMDB ID stream servers
    const watchLinks: QualityLink[] = useMemo(() => {
        return resolveWatchLinks(content, currentSeason, defaultStreamBaseUrl);
    }, [content, currentSeason, defaultStreamBaseUrl]);

    // Download Links (For Modal)
    const downloadLinks: QualityLink[] = useMemo(() => {
        let links: QualityLink[] = [];
        if (content?.type === 'movie') {
            links = content.qualityLinks || [];
        } else if (content?.type === 'webseries' && currentSeason) {
            links = currentSeason.qualityLinks || [];
        }
        return links;
    }, [content, currentSeason]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex justify-center items-center">
                <i className="fas fa-spinner fa-spin text-4xl text-white"></i>
            </div>
        );
    }

    if (!content) {
        return null; 
    }

    const seoTitle = buildMovieTitle(content.title, content.year);
    const seoDescription = buildMovieDescription(content.title, content.year);

    return (
        <div className="bg-black text-white h-screen flex flex-col">
            <SeoMeta title={seoTitle} description={seoDescription} />
            <PlayerHeader 
                title={content.title}
                subtitle={currentSeason ? `Season ${currentSeason.number}` : undefined}
                onOpenDownloadModal={downloadLinks.length > 0 ? () => setIsDownloadModalOpen(true) : undefined}
                onBack={() => navigate(`/detail/${content.id}`)}
            />
            <main className="flex-grow pt-16 flex flex-col md:grid md:grid-cols-[1fr_auto] overflow-hidden">
                <div className="w-full aspect-video bg-black relative flex-shrink-0">
                    <div className="absolute inset-0 w-full h-full">
                        {watchLinks.length > 0 ? (
                            <CustomVideoPlayer 
                                links={watchLinks}
                                poster={content.backdrop}
                                posterAlt={buildPosterAlt(content.title)}
                            />
                        ) : (
                            <div className="w-full h-full flex justify-center items-center bg-black absolute inset-0">
                                <img src={content.poster} alt={buildPosterAlt(content.title)} className="w-full h-full object-contain opacity-20" />
                                <p className="absolute text-center p-4">Video not available for this selection.</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <aside className="w-full md:w-96 bg-[var(--card-bg)] flex flex-col overflow-hidden border-t md:border-l md:border-t-0 border-[var(--border-color)]">
                    {/* Tabs */}
                    <div className="flex border-b border-[var(--border-color)]">
                        {content.type === 'webseries' && (
                            <button 
                                onClick={() => setActiveTab('episodes')}
                                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'episodes' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--secondary-text-color)] hover:text-white'}`}
                            >
                                Episodes
                            </button>
                        )}
                        <button 
                            onClick={() => setActiveTab('comments')}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'comments' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--secondary-text-color)] hover:text-white'}`}
                        >
                            Comments
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-4 relative">
                        {activeTab === 'episodes' && content.type === 'webseries' && content.seasons && currentSeason && (
                            <div className="space-y-4 pb-20 md:pb-4">
                                <SeasonList 
                                    seasons={content.seasons}
                                    currentSeasonNumber={currentSeason.number}
                                    onSeasonSelect={handleSeasonSelect}
                                />
                                {permissions.shouldShowAds && appSettings?.customAdCode && (
                                    <div className="w-full flex justify-center bg-black/20 rounded-lg overflow-hidden mt-4">
                                        <AdContainer code={appSettings.customAdCode} />
                                    </div>
                                )}
                                <AdBanner />
                            </div>
                        )}

                        {activeTab === 'comments' && (
                            <div className="h-full flex flex-col pb-20 md:pb-0">
                                <CommentsSection contentId={content.id} />
                            </div>
                        )}
                    </div>
                </aside>
            </main>
            <DownloadModal 
                isOpen={isDownloadModalOpen}

                onClose={() => setIsDownloadModalOpen(false)}
                links={downloadLinks}
                title={`${content.title} ${currentSeason ? `- S${currentSeason.number}` : ''}`}
            />
        </div>
    );
};

export default PlayerPage;
