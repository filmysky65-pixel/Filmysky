import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Content } from '../types';
import { getAllContent } from '../services/firebaseService';

const parseDate = (date: string | number | undefined): number => {
    if (!date) return 0;
    if (typeof date === 'number') return date;
    const parsed = Date.parse(date);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDate = (value: string | number | undefined): string => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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

    const latestItems = useMemo(() => [...content].sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt)), [content]);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-black text-white">
            <main className="mx-auto max-w-[1200px] px-3 pb-32 pt-3 sm:px-5 sm:pt-5">
                {loading ? (
                    <div className="flex min-h-[50vh] items-center justify-center">
                        <i className="fas fa-spinner fa-spin text-3xl text-[#f20d20]" aria-label="Loading movies"></i>
                    </div>
                ) : latestItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-5">
                        {latestItems.map(item => (
                            <Link key={item.id} to={`/detail/${item.id}`} className="group relative isolate aspect-[2/3] overflow-hidden rounded-[22px] bg-[#141414] shadow-[0_12px_30px_rgba(0,0,0,.42)] ring-1 ring-white/[0.06]">
                                <img
                                    src={item.poster || item.backdrop || ''}
                                    alt={`${item.title} poster`}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/95" />
                                {item.language && <span className="absolute right-2 top-2 max-w-[75%] truncate rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">{item.language}</span>}
                                <div className="absolute inset-x-0 bottom-0 px-2.5 pb-3 pt-12 text-center sm:px-4 sm:pb-5">
                                    <div className="mb-1.5 flex items-center justify-center gap-2 text-[11px] font-medium text-white/90 sm:text-sm">
                                        <i className="far fa-calendar-alt" aria-hidden="true"></i>
                                        <span>{formatDate(item.createdAt)}</span>
                                    </div>
                                    <h2 className="line-clamp-2 text-[15px] font-bold leading-snug text-white sm:text-lg">{item.title}</h2>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
                        <i className="fas fa-film mb-4 text-4xl text-white/30"></i>
                        <h1 className="text-xl font-bold">No movies yet</h1>
                        <p className="mt-2 text-sm text-white/55">New movies and series will appear here when available.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HomePage;
