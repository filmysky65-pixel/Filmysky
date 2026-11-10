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
        const timer = window.setTimeout(() => setMinDelayPassed(true), 1000);
        return () => window.clearTimeout(timer);
    }, []);

    const { heroItems, latestContent } = useMemo(() => {
        const featuredItems = content
            .filter(item => item.isFeatured === true)
            .sort((a, b) => parseDate(b.updatedAt) - parseDate(a.updatedAt));
        const remainingItems = content
            .filter(item => item.isFeatured !== true)
            .sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));
        const latest = [...featuredItems, ...remainingItems];
        return {
            heroItems: latest.slice(0, 5),
            latestContent: [...content].sort((a, b) => {
                const dateDiff = parseDate(b.createdAt) - parseDate(a.createdAt);
                return dateDiff || b.id.localeCompare(a.id);
            }),
        };
    }, [content]);

    if (!dataLoaded || !minDelayPassed) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading movies">
                <i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-4">
            {heroItems.length > 0 && <HeroSlider items={heroItems} />}

            {latestContent.length > 0 && (
                <section aria-label="Latest movies and shows" className="px-3 md:px-6">
                    <h2 className="mb-4 px-1 text-xl font-bold text-[var(--text-color)]">Latest Movies &amp; Shows</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                        {latestContent.map(item => {
                            const releaseDate = formatDate(item.createdAt);
                            return (
                                <Link
                                    key={item.id}
                                    to={`/detail/${item.id}`}
                                    className="group relative isolate aspect-[2/3] overflow-hidden rounded-[1.35rem] bg-[var(--card-bg)] shadow-lg ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-color)]"
                                    aria-label={`${item.title}${item.year ? ` ${item.year}` : ''}`}
                                >
                                    <img
                                        src={item.poster}
                                        alt={`${item.title} poster`}
                                        loading="lazy"
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
                                    <div className="absolute inset-x-2 bottom-3 flex flex-col items-center text-center text-white sm:bottom-4 sm:px-2">
                                        {releaseDate && (
                                            <span className="mb-2 flex items-center justify-center gap-2 text-xs font-medium drop-shadow-md sm:text-sm">
                                                <i className="far fa-calendar-alt" aria-hidden="true" />
                                                {releaseDate}
                                            </span>
                                        )}
                                        <h3 className="line-clamp-2 text-sm font-bold leading-snug drop-shadow-lg sm:text-base md:text-lg">
                                            {item.title}{item.year ? ` ${item.year}` : ''}{item.language ? ` ${item.language}` : ''}
                                        </h3>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
};

export default HomePage;
