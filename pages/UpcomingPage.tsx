import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Content } from '../types';
import { getPaginatedContent } from '../services/firebaseService';
import ContentCard from '../components/ContentCard';

// Helper to reliably parse date for sorting
const parseDate = (date: string | number | undefined): number => {
    if (!date) return 0;
    if (typeof date === 'number') return date;
    const parsed = Date.parse(date);
    return isNaN(parsed) ? 0 : parsed;
};

const UpcomingPage: React.FC = () => {
    const categoryName = 'Upcoming';
    const [content, setContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastKey, setLastKey] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    const loadContent = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        const limit = isInitial ? 10 : 10;
        const currentLastKey = isInitial ? undefined : lastKey;

        const result = await getPaginatedContent('category', categoryName, limit, currentLastKey || undefined);
        const data = (result && Array.isArray(result.data)) ? result.data : [];

        if (data.length < limit) {
            setHasMore(false);
        }

        setContent(prev => {
            const safePrev = Array.isArray(prev) ? prev : [];
            const existingIds = new Set(safePrev.map(m => m.id));
            const newItems = data.filter(m => !existingIds.has(m.id));
            const combined = [...safePrev, ...newItems];
            
            // STRICT SORTING: Latest First based on createdAt and Push ID
            combined.sort((a, b) => {
                const timeA = parseDate(a.createdAt);
                const timeB = parseDate(b.createdAt);
                
                if (timeA !== timeB) return timeB - timeA;
                return b.id.localeCompare(a.id);
            });
            
            return combined;
        });

        setLastKey(result?.lastKey || null);
        setLoading(false);
        setLoadingMore(false);
    }, [categoryName, lastKey]);

    // Initial Load
    useEffect(() => {
        setContent([]);
        setLastKey(null);
        setHasMore(true);
        setLoading(true);
        loadContent(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadContent(false);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore, loadContent]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Upcoming Movies & Shows</h1>
            
            {loading ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-4">
                    <i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i>
                    <p className="text-[var(--secondary-text-color)] animate-pulse">Loading upcoming content...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.isArray(content) && content.map((item, index) => {
                            if (content.length === index + 1) {
                                return <ContentCard ref={lastElementRef} key={item.id} item={item} />
                            } else {
                                return <ContentCard key={item.id} item={item} />
                            }
                        })}
                    </div>

                    {loadingMore && (
                        <div className="flex justify-center items-center py-8">
                            <i className="fas fa-spinner fa-spin text-2xl text-[var(--primary-color)]"></i>
                        </div>
                    )}
                    
                    {!hasMore && content.length > 0 && (
                        <p className="text-center text-[var(--secondary-text-color)] mt-8 pb-4">No more upcoming titles.</p>
                    )}
                    
                    {content.length === 0 && (
                        <p className="text-center text-[var(--secondary-text-color)] mt-8">No upcoming titles announced yet.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default UpcomingPage;
