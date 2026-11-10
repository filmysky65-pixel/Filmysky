import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Content } from '../types';

interface HeroSliderProps { items: Content[]; }

const HeroSlider: React.FC<HeroSliderProps> = ({ items }) => {
    const safeItems = Array.isArray(items) ? items : (items ? Object.values(items) : []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const nextSlide = useCallback(() => {
        if (safeItems.length) setCurrentIndex(index => (index + 1) % safeItems.length);
    }, [safeItems.length]);
    const previousSlide = useCallback(() => {
        if (safeItems.length) setCurrentIndex(index => (index - 1 + safeItems.length) % safeItems.length);
    }, [safeItems.length]);

    useEffect(() => {
        if (safeItems.length <= 1) return;
        const intervalId = window.setInterval(nextSlide, 5000);
        return () => window.clearInterval(intervalId);
    }, [nextSlide, safeItems.length]);
    useEffect(() => {
        if (currentIndex >= safeItems.length) setCurrentIndex(0);
    }, [currentIndex, safeItems.length]);

    const currentItem = safeItems[currentIndex];
    if (!currentItem) return null;

    return (
        <section className="relative mb-6 overflow-hidden px-3 pt-3 md:px-8 md:pt-5" aria-label="Featured movies">
            <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-44 max-w-5xl bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--primary-color)_18%,transparent),transparent_70%)]" />
            <div className="relative mx-auto max-w-6xl">
                <div className="mb-2.5 flex items-end justify-between px-1">
                    <div>
                        <h2 className="text-base font-black text-[var(--text-color)] md:text-xl">Featured movies</h2>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black tabular-nums text-[var(--secondary-text-color)] backdrop-blur-md"><span className="text-[var(--text-color)]">{String(currentIndex + 1).padStart(2, '0')}</span> / {String(safeItems.length).padStart(2, '0')}</span>
                </div>

                <div className="group relative">
                    <Link to={`/detail/${currentItem.id}`} className="relative block aspect-[16/10] max-h-[420px] overflow-hidden rounded-2xl border border-white/15 bg-[var(--card-bg)] shadow-[0_22px_65px_-30px_rgba(0,0,0,0.9)] sm:aspect-[16/8] md:aspect-[16/6] md:rounded-[1.6rem]">
                        <div key={currentItem.id} className="animate-slider-art absolute inset-0">
                            <img src={currentItem.sliderPoster || currentItem.poster} alt={`${currentItem.title} featured artwork`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#09090c]/85 via-[#09090c]/25 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#09090c]/85 via-[#09090c]/15 to-transparent" />
                        </div>
                        <div className="pointer-events-none absolute inset-[1px] rounded-[inherit] ring-1 ring-inset ring-white/10" />
                        <div className="absolute left-5 top-5 z-10 hidden items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.24em] text-white/85 backdrop-blur-xl sm:flex">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)] shadow-[0_0_10px_var(--primary-color)]" /> Exclusive
                        </div>
                        <div key={`${currentItem.id}-copy`} className="animate-slider-copy absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5 md:max-w-xl md:p-7">
                            <div className="mb-1.5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white/70 md:text-[10px]">
                                {currentItem.year && <span>{currentItem.year}</span>}
                                {currentItem.language && <><span className="h-1 w-1 rounded-full bg-[var(--primary-color)]" /><span>{currentItem.language}</span></>}
                                {currentItem.rating && <><span className="h-1 w-1 rounded-full bg-[var(--primary-color)]" /><span><i className="fas fa-star mr-1 text-amber-400" />{currentItem.rating}</span></>}
                            </div>
                            <h1 className="line-clamp-2 text-xl font-black leading-tight text-white drop-shadow-lg sm:text-2xl md:text-4xl">{currentItem.title}</h1>
                            <p className="mt-1.5 hidden line-clamp-1 text-xs leading-5 text-white/70 md:block">{currentItem.storyline}</p>
                            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black text-[#111116] shadow-[0_8px_25px_-10px_rgba(255,255,255,0.8)] transition-transform group-hover:translate-x-0.5 md:px-5 md:text-xs"><i className="fas fa-play text-[9px] text-[var(--primary-color)]" /> Watch now</span>
                        </div>
                    </Link>

                    {safeItems.length > 1 && <>
                        <button type="button" onClick={previousSlide} aria-label="Previous movie" className="absolute left-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xl transition hover:scale-105 hover:bg-white hover:text-black md:left-4 md:h-10 md:w-10"><i className="fas fa-chevron-left text-[10px]" /></button>
                        <button type="button" onClick={nextSlide} aria-label="Next movie" className="absolute right-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xl transition hover:scale-105 hover:bg-white hover:text-black md:right-4 md:h-10 md:w-10"><i className="fas fa-chevron-right text-[10px]" /></button>
                    </>}
                </div>

                <div className="mt-3 flex justify-center gap-1.5">
                    {safeItems.map((item, index) => <button key={item.id} type="button" aria-label={`Go to slide ${index + 1}`} onClick={() => setCurrentIndex(index)} className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-7 bg-[var(--primary-color)]' : 'w-1 bg-[var(--secondary-text-color)]/35 hover:bg-[var(--secondary-text-color)]'}`} />)}
                </div>
            </div>

            <style>{`
                @keyframes slider-art-in { from { opacity: .45; transform: scale(1.035); } to { opacity: 1; transform: scale(1); } }
                @keyframes slider-copy-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slider-art { animation: slider-art-in .6s ease-out both; }
                .animate-slider-copy { animation: slider-copy-in .48s ease-out .08s both; }
                @media (prefers-reduced-motion: reduce) { .animate-slider-art, .animate-slider-copy { animation: none; } }
            `}</style>
        </section>
    );
};

export default HeroSlider;
