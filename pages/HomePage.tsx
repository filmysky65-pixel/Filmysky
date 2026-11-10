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
        <section className="relative mb-8 px-3 pt-5 sm:px-5 sm:pt-7" aria-label="Featured movies">
            <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-56 max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,.17),transparent_68%)]" />
            <div className="relative mx-auto max-w-6xl">
                <div className="mb-3 flex items-center justify-between px-1">
                    <h1 className="text-[22px] font-extrabold tracking-tight text-white sm:text-3xl">Featured movies</h1>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-sm font-bold tabular-nums text-white/60 sm:text-base">
                        <span className="text-white">{String(currentIndex + 1).padStart(2, '0')}</span> / {String(safeItems.length).padStart(2, '0')}
                    </span>
                </div>

                <div className="group relative">
                    <Link
                        to={`/detail/${currentItem.id}`}
                        className="relative block aspect-[1.42/1] overflow-hidden rounded-[26px] border border-white/20 bg-[#111] shadow-[0_20px_60px_rgba(0,0,0,.65)] sm:aspect-[16/8] sm:rounded-[30px]"
                        aria-label={`View ${currentItem.title}`}
                    >
                        <img
                            key={currentItem.id}
                            src={currentItem.sliderPoster || currentItem.backdrop || currentItem.poster || ''}
                            alt={`${currentItem.title} featured artwork`}
                            className="absolute inset-0 h-full w-full object-cover animate-[heroFade_.55s_ease-out]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/5" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-8">
                            <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.13em] text-white/80 sm:text-sm">
                                {currentItem.year && <span>{currentItem.year}</span>}
                                {currentItem.language && <><span className="text-[#e50914]">●</span><span>{currentItem.language}</span></>}
                                {currentItem.rating > 0 && <><span className="text-[#e50914]">●</span><span className="text-amber-400">★</span><span>{currentItem.rating}</span></>}
                            </div>
                            <h2 className="line-clamp-2 max-w-3xl text-[25px] font-black leading-[1.12] text-white drop-shadow-lg sm:text-4xl md:text-5xl">{currentItem.title}</h2>
                            <span className="mt-4 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-base font-extrabold text-[#151515] shadow-xl transition-transform group-hover:scale-[1.03] sm:px-8 sm:py-4 sm:text-lg">
                                <i className="fas fa-play text-[#e50914]" aria-hidden="true" /> Watch now
                            </span>
                        </div>
                    </Link>
                    {safeItems.length > 1 && <>
                        <button type="button" onClick={previousSlide} aria-label="Previous featured movie" className="absolute left-3 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/55 text-xl text-white backdrop-blur-md transition hover:bg-black/80 sm:h-16 sm:w-16 sm:text-2xl">
                            <i className="fas fa-chevron-left" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={nextSlide} aria-label="Next featured movie" className="absolute right-3 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/55 text-xl text-white backdrop-blur-md transition hover:bg-black/80 sm:h-16 sm:w-16 sm:text-2xl">
                            <i className="fas fa-chevron-right" aria-hidden="true" />
                        </button>
                    </>}
                </div>
                <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Featured movie slides">
                    {safeItems.map((item, index) => (
                        <button key={item.id} type="button" role="tab" aria-selected={currentIndex === index} aria-label={`Show slide ${index + 1}`} onClick={() => setCurrentIndex(index)} className={`h-1.5 rounded-full transition-all ${currentIndex === index ? 'w-16 bg-[#e50914]' : 'w-5 bg-white/25 hover:bg-white/50'}`} />
                    ))}
                </div>
            </div>
            <style>{`@keyframes heroFade_ { from { opacity:.5; transform:scale(1.02) } to { opacity:1; transform:scale(1) } } @media (prefers-reduced-motion: reduce) { * { scroll-behavior:auto !important; } }`}</style>
        </section>
    );
};

const parseDate = (date: string | number | undefined): number => {
    if (!date) return 0;
    if (typeof date === 'number') return date;
    const parsed = Date.parse(date);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDate = (value: string | number | undefined): string => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
        <div className="min-h-[calc(100vh-4rem)] overflow-hidden bg-black text-white">
            {loading ? (
                <div className="flex min-h-[65vh] items-center justify-center">
                    <i className="fas fa-spinner fa-spin text-3xl text-[#e50914]" aria-label="Loading movies" />
                </div>
            ) : latestItems.length ? (
                <>
                    <HeroSlider items={featuredItems} />
                    <main className="mx-auto max-w-6xl px-3 pb-32 sm:px-5">
                        <div className="mb-4 flex items-end justify-between px-1">
                            <div>
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-[.24em] text-[#e50914]">Fresh from the screen</p>
                                <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Latest movies & series</h2>
                            </div>
                            <Link to="/movies" className="pb-1 text-sm font-bold text-white/60 transition hover:text-white">See all <i className="fas fa-arrow-right ml-1 text-xs" /></Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                            {latestItems.map(item => (
                                <Link key={item.id} to={`/detail/${item.id}`} className="group relative isolate aspect-[.52/1] overflow-hidden rounded-[22px] bg-[#141414] shadow-[0_12px_30px_rgba(0,0,0,.5)] ring-1 ring-white/[.04] sm:aspect-[.68/1] sm:rounded-[26px]">
                                    <img src={item.poster || item.backdrop || ''} alt={`${item.title} poster`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.045]" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/95" />
                                    {item.language && <span className="absolute right-2 top-2 max-w-[80%] truncate rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur-md sm:text-[10px]">{item.language}</span>}
                                    <div className="absolute inset-x-0 bottom-0 px-2.5 pb-4 pt-12 text-center sm:px-4 sm:pb-5">
                                        {formatDate(item.createdAt) && <div className="mb-2 flex items-center justify-center gap-2 text-[11px] font-medium text-white/85 sm:text-sm"><i className="far fa-calendar-alt" aria-hidden="true" /><span>{formatDate(item.createdAt)}</span></div>}
                                        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-white sm:text-lg">{item.title}{item.year ? ` ${item.year}` : ''}</h3>
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
