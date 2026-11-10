
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Content } from '../types';
import { getAllContent } from '../services/firebaseService';
import ContentCard from '../components/ContentCard';

// Helper to safely parse date for sorting
const parseDate = (date: string | number | undefined): number => {
    if (!date) return 0;
    if (typeof date === 'number') return date;
    const parsed = Date.parse(date);
    return isNaN(parsed) ? 0 : parsed;
};

const SeriesPage: React.FC = () => {
    const [allSeries, setAllSeries] = useState<Content[]>([]);
    const [visibleSeries, setVisibleSeries] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(10);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = getAllContent(fetchedContent => {
            // Filter: Must be 'webseries' type AND NOT in '18+' category
            const series = fetchedContent.filter(c => c.type === 'webseries' && c.category !== '18+');
            
            // Sort Logic: Newest Upload (createdAt) always first
            series.sort((a, b) => {
                const timeA = parseDate(a.createdAt);
                const timeB = parseDate(b.createdAt);
                
                if (timeA !== timeB) return timeB - timeA;
                
                if (b.year !== a.year) return b.year - a.year;
                
                return a.title.localeCompare(b.title);
            });

            setAllSeries(series);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setVisibleSeries(allSeries.slice(0, displayCount));
    }, [allSeries, displayCount]);

    const loadMore = useCallback(() => {
        setDisplayCount(prev => prev + 10);
    }, []);

    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && visibleSeries.length < allSeries.length) {
                loadMore();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, visibleSeries.length, allSeries.length, loadMore]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Web Series</h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {visibleSeries.map((item, index) => {
                    if (index === visibleSeries.length - 1) {
                        return <ContentCard ref={lastElementRef} key={item.id} item={item} />
                    } else {
                        return <ContentCard key={item.id} item={item} />
                    }
                })}
            </div>

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i>
                </div>
            )}

            {!loading && visibleSeries.length < allSeries.length && (
                 <div className="flex justify-center items-center py-8">
                    <i className="fas fa-spinner fa-spin text-2xl text-[var(--primary-color)]"></i>
                </div>
            )}
            
            {!loading && visibleSeries.length === allSeries.length && allSeries.length > 0 && (
                <p className="text-center text-[var(--secondary-text-color)] mt-8 pb-4">You've reached the end.</p>
            )}
             {!loading && allSeries.length === 0 && (
                <p className="text-center text-[var(--secondary-text-color)] mt-8">No series found.</p>
            )}
        </div>
    );
};

export default SeriesPage;
