import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Content } from '../types';
import { getAllContent } from '../services/firebaseService';
import HeroSlider from '../components/HeroSlider';

const parseDate = (date: string | number | undefined): number => {
    if (!date) return 0;
    if (typeof date === 'number') return date;
    const parsed = Date.parse(date);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDate = (date: string | number | undefined): string | null => {
    const timestamp = parseDate(date);
    if (!timestamp) return null;
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(timestamp));
};

const HomePage: React.FC = () => {
    const [content, setContent] = useState<Content[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [minDelayPassed, setMinDelayPassed] = useState(false);

    useEffect(() => {
        const unsubscribeContent = getAllContent(fetchedContent => {
            setContent(fetchedContent);
            setDataLoaded(true);
        });
        return unsubscribeContent;
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => setMinDelayPassed(true), 600);
        return () => window.clearTimeout(timer);
    }, []);

    const { heroItems, sectionItems } = useMemo(() => {
        const featuredItems = content
            .filter(item => item.isFeatured === true)
            .sort((a, b) => parseDate(b.updatedAt) - parseDate(a.updatedAt));
        const remainingItems = content
            .filter(item => item.isFeatured !== true)
            .sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));

        const allItems = [...featuredItems, ...remainingItems];
        const section = allItems.filter(item => {
            const category = (item.category || '').toLowerCase();
            return category.includes('south') || category.includes('tamil') || category.includes('telugu') || category.includes('kannada') || category.includes('malayalam');
        });

        return {
            heroItems: allItems.slice(0, 5),
            sectionItems: (section.length ? section : allItems).slice(0, 6),
        };
    }, [content]);

    if (!dataLoaded || !minDelayPassed) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]" />
            </div>
        );
    }

    return (
        <div className="pb-24">
            {heroItems.length > 0 && <HeroSlider items={heroItems} />}

            <section className="px-3 pb-2 md:px-6">
                <div className="mb-4 flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        <span className="h-7 w-1.5 rounded-full bg-[var(--primary-color)]" />
                        <h2 className="text-3xl font-black text-white md:text-4xl">South Indian</h2>
                    </div>
                    <button type="button" className="text-lg font-semibold text-white/90">See All &gt;</button>
                </div>

                <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {sectionItems.map((item, index) => {
                        const dateText = formatDate(item.createdAt);
                        const title = item.title;
                        return (
                            <Link
                                key={`${item.id}-${index}`}
                                to={`/detail/${item.id}`}
                                className="group relative overflow-hidden rounded-[1.2rem] border border-[var(--primary-color)] bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-transform duration-300 hover:-translate-y-1"
                                aria-label={title}
                            >
                                <div className="relative aspect-[2/3] overflow-hidden">
                                    <img
                                        src={item.poster}
                                        alt={`${title} poster`}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                                    <div className="mb-1 flex items-center gap-1 text-[10px] text-white/80">
                                        <i className="far fa-calendar-alt" />
                                        <span>{dateText || 'Just now'}</span>
                                    </div>
                                    <h3 className="line-clamp-2 text-[15px] font-bold leading-tight text-white md:text-[18px]">
                                        {title}
                                    </h3>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
