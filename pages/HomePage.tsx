import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Content } from '../types';
import { getAllContent } from '../services/firebaseService';

interface HeroSliderProps {
    items: Content[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const safeItems = useMemo(() => (Array.isArray(items) ? items : []).slice(0, 5), [items]);

    const nextSlide = useCallback(() => {
        if (safeItems.length > 1) setCurrentIndex(index => (index + 1) % safeItems.length);
    }, [safeItems.length]);

    const previousSlide = useCallback(() => {
        if (safeItems.length > 1) setCurrentIndex(index => (index - 1 + safeItems.length) % safeItems.length);
    }, [safeItems.length]);

    useEffect(() => {
        if (safeItems.length < 2) return;
        const interval = window.setInterval(nextSlide, 6000);
        return () => window.clearInterval(interval);
    }, [nextSlide, safeItems.length]);

    useEffect(() => {
        if (currentIndex >= safeItems.length) setCurrentIndex(0);
    }, [currentIndex, safeItems.length]);

    const currentItem = safeItems[currentIndex];
    if (!currentItem) return null;

    return (
        <section className="relative mb-5 px-3 pt-2 sm:px-5 sm:pt-4" aria-label="Featured movies">
            <div className="relative mx-auto max-w-6xl">
                <div className="mb-2 flex items-center justify-between px-1">
                    <h2 className="text-[18px] font-extrabold tracking-tight text-white sm:text-2xl">Featured movies</h2>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-0.5 text-xs font-bold tabular-nums text-white/60 sm:text-sm">
                        <span className="text-white">{String(currentIndex + 1).padStart(2, '0')}</span> / {String(safeItems.length).padStart(2, '0')}
                    </span>
                </div>

                <div className="group relative">
                    <Link
                        to={`/detail/${currentItem.id}`}
                        className="relative block aspect-[1.4/1] overflow-hidden rounded-[20px] border border-white/10 bg-[#111] shadow-lg sm:aspect-[16/8] sm:rounded-[24px]"
                        aria-label={`View ${currentItem.title}`}
                    >
                        <img
                            key={currentItem.id}
                            src={currentItem.sliderPoster || currentItem.backdrop || currentItem.poster || ''}
                            alt={`${currentItem.title} featured artwork`}
                            className="absolute inset-0 h-full w-full object-cover animate-[heroFade_.55s_ease-out]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

                        <div className="absolute inset-x-0 bottom-0 z-10 p-3.5 sm:p-7">
                            <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-white/80 sm:text-xs">
                                {currentItem.year && <span>{currentItem.year}</span>}
                                {currentItem.language && <><span className="text-[#e50914]">●</span><span>{currentItem.language}</span></>}
                                {currentItem.rating > 0 && <><span className="text-[#e50914]">●</span><span className="text-amber-400">★</span><span>{currentItem.rating}</span></>}
                            </div>
                            <h3 className="line-clamp-2 max-w-2xl text-[16px] font-black leading-snug text-white drop-shadow-md sm:text-3xl">{currentItem.title}</h3>
                            <span className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-extrabold text-[#151515] shadow-md transition-transform group-hover:scale-105">
                                <i className="fas fa-play text-[#e50914]" aria-hidden="true" /> Watch now
                            </span>
                        </div>
                    </Link>

                    {safeItems.length > 1 && <>
                        <button type="button" onClick={previousSlide} aria-label="Previous featured movie" className="absolute left-2.5 top-[45%] z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition hover:bg-black/80 sm:h-10 sm:w-10">
                            <i className="fas fa-chevron-left" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={nextSlide} aria-label="Next featured movie" className="absolute right-2.5 top-[45%] z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition hover:bg-black/80 sm:h-10 sm:w-10">
                            <i className="fas fa-chevron-right" aria-hidden="true" />
                        </button>
                    </>}
                </div>
            </div>
            <style>{`@keyframes heroFade_ { from { opacity:.5; transform:scale(1.02) } to { opacity:1; transform:scale(1) } }`}</style>
        </section>
    );
};

const parseDate = (date: string | number | undefined): number => {
    if (!date) return 0;
    if (typeof date === 'number') return date;
    const parsed = Date.parse(date);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const HomePage: React.FC = () => {
    const [content, setContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = getAllContent(items => {
            setContent(Array.isArray(items) ? items : []);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const latestItems = useMemo(
        () => [...content].sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt)),
        [content]
    );

    const featuredItems = useMemo(() => {
        const selected = content.filter(item => item.isFeatured === true);
        const rest = latestItems.filter(item => item.isFeatured !== true);
        return [...selected, ...rest].slice(0, 5);
    }, [content, latestItems]);

    return (
        <div className="min-h-[calc(100vh-4rem)] overflow-hidden bg-black text-white pb-36 sm:pb-32 relative">
            {loading ? (
                <div className="flex min-h-[65vh] items-center justify-center">
                    <i className="fas fa-spinner fa-spin text-3xl text-[#e50914]" aria-label="Loading movies" />
                </div>
            ) : latestItems.length ? (
                <>
                    <HeroSlider items={featuredItems} />
                    <main className="mx-auto max-w-6xl px-3 sm:px-5">
                        <div className="grid grid-cols-2 gap-3 sm:gap-5">
                            {latestItems.map(item => (
                                <Link key={item.id} to={`/detail/${item.id}`} className="group relative isolate aspect-[0.65/1] overflow-hidden rounded-[18px] bg-[#141414] shadow-md ring-1 ring-white/10">
                                    <img src={item.poster || item.backdrop || ''} alt={`${item.title} poster`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/95" />

                                    {item.language && (
                                        <span className="absolute right-2 top-2 max-w-[75%] truncate rounded-full border border-white/15 bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                                            {item.language}
                                        </span>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 p-3 text-center sm:p-4">
                                        <h3 className="line-clamp-2 text-xs font-bold leading-snug text-white sm:text-sm">
                                            {item.title}{item.year ? ` ${item.year}` : ''}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </main>
                </>
            ) : (
                <main className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center">
                    <i className="fas fa-film mb-4 text-4xl text-white/30" />
                    <h1 className="text-xl font-bold">No movies yet</h1>
                    <p className="mt-2 text-sm text-white/55">New movies and series will appear here when available.</p>
                </main>
            )}
        </div>
    );
};

export default HomePage;
