import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Content, Season } from '../types';
import { getContentById } from '../services/firebaseService';
import { useAppContext } from '../hooks/useAppContext';
import AdContainer from '../components/AdContainer';
import SeoMeta from '../components/SeoMeta';
import { buildMovieDescription, buildMovieTitle, buildPosterAlt } from '../utils/seo';
import { executeDownloadWithAd } from '../utils/downloadAdHelper';

const DownloadPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { permissions, appSettings } = useAppContext();
    const [content, setContent] = useState<Content | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getContentById(id).then((data) => {
            setContent(data);
            if (data?.type === 'webseries' && data.seasons) {
                const savedSeasonNum = location.state?.seasonNumber as number | undefined;
                const seasonsArr = (Array.isArray(data.seasons) ? data.seasons : Object.values(data.seasons)) as Season[];
                const sortedSeasons = [...seasonsArr].sort((a, b) => a.number - b.number);
                if (savedSeasonNum) {
                    const savedSeason = sortedSeasons.find(s => s.number === savedSeasonNum);
                    setSelectedSeason(savedSeason || sortedSeasons[0]);
                } else {
                    setSelectedSeason(sortedSeasons[0]);
                }
            }
            setLoading(false);
        });
    }, [id, location.state]);

    const downloadLinks = useMemo(() => {
        if (!content) return [];
        if (content.type === 'webseries' && selectedSeason) {
            return Array.isArray(selectedSeason.qualityLinks)
                ? selectedSeason.qualityLinks
                : Object.values(selectedSeason.qualityLinks || {});
        }
        return Array.isArray(content.qualityLinks) ? content.qualityLinks : Object.values(content.qualityLinks || {});
    }, [content, selectedSeason]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex justify-center items-center text-white">
                <i className="fas fa-spinner fa-spin text-3xl"></i>
            </div>
        );
    }

    if (!content) {
        return (
            <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex flex-col items-center justify-center">
                <p className="text-lg">Content not found.</p>
                <button onClick={() => navigate('/')} className="mt-4 bg-[var(--primary-color)] text-white font-bold py-2 px-6 rounded-lg">
                    Go Home
                </button>
            </div>
        );
    }

    const seasonsArr = content.type === 'webseries' && content.seasons
        ? (Array.isArray(content.seasons) ? content.seasons : Object.values(content.seasons)) as Season[]
        : [];
    const sortedSeasons = [...seasonsArr].sort((a, b) => a.number - b.number);
    const seoTitle = buildMovieTitle(content.title, content.year);
    const seoDescription = buildMovieDescription(content.title, content.year);

    return (
        <div className="min-h-screen relative overflow-hidden">
            <SeoMeta title={seoTitle} description={seoDescription} />
            <div className="absolute inset-0">
                <img src={content.backdrop} alt={content.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[var(--bg-color)]"></div>
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                <header className="w-full px-4 py-4 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10">
                    <button onClick={() => navigate(-1)} className="text-white flex items-center gap-2">
                        <i className="fas fa-arrow-left"></i>
                        Back
                    </button>
                    <div className="text-white font-bold">Download</div>
                    <div className="w-16"></div>
                </header>

                <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
                        <div className="flex flex-col items-center md:items-start">
                            <img src={content.poster} alt={buildPosterAlt(content.title)} className="w-44 md:w-56 rounded-2xl shadow-2xl border-t-4 border-b-4 border-[var(--primary-color)]" />
                            <div className="mt-4 text-center md:text-left">
                                <h1 className="text-2xl md:text-4xl font-bold text-white">{content.title}</h1>
                                <p className="text-sm text-gray-300 mt-2">{content.year} • {content.language} • {content.type}</p>
                            </div>
                        </div>

                        <div className="bg-[var(--card-bg)]/80 border border-[var(--border-color)] rounded-2xl p-5 md:p-8 backdrop-blur-xl shadow-2xl">
                            {content.type === 'webseries' && sortedSeasons.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-sm uppercase tracking-wider text-[var(--secondary-text-color)] mb-2">Select Season</p>
                                    <div className="flex flex-wrap gap-2">
                                        {sortedSeasons.map(season => (
                                            <button
                                                key={season.number}
                                                onClick={() => setSelectedSeason(season)}
                                                className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${selectedSeason?.number === season.number ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' : 'bg-black/30 border-[var(--border-color)] text-white/80 hover:text-white'}`}
                                            >
                                                Season {season.number}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {downloadLinks.length > 0 ? downloadLinks.map((link, index) => (
                                    <button
                                        key={`${link.quality}-${index}`}
                                        onClick={() => executeDownloadWithAd(link.url, appSettings, permissions.shouldShowAds)}
                                        className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--primary-color)] transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="w-11 h-11 rounded-full bg-[var(--primary-color)]/15 text-[var(--primary-color)] flex items-center justify-center group-hover:bg-[var(--primary-color)] group-hover:text-white transition-colors">
                                                <i className="fas fa-download"></i>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{link.quality} Quality</div>
                                                <div className="text-xs text-[var(--secondary-text-color)]">Tap to download</div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-[var(--primary-color)]">Download</span>
                                    </button>
                                )) : (
                                    <div className="text-center py-8 text-[var(--secondary-text-color)]">
                                        <i className="fas fa-exclamation-circle text-4xl mb-3 opacity-50"></i>
                                        <p>No download links available.</p>
                                    </div>
                                )}
                            </div>

                            {permissions.shouldShowAds && appSettings?.adyestraAdCode && (
                                <div className="mt-8 p-4 rounded-xl border border-[var(--border-color)] bg-black/20">
                                    <AdContainer code={appSettings.adyestraAdCode} />
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DownloadPage;
