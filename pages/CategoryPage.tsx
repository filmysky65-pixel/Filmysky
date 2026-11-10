
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Content } from '../types';
import { getAllContent } from '../services/firebaseService';
import ContentCard from '../components/ContentCard';

// Helper to reliably parse date for sorting
const parseDate = (date: string | number | undefined): number => {
    if (!date) return 0;
    if (typeof date === 'number') return date;
    const parsed = Date.parse(date);
    return isNaN(parsed) ? 0 : parsed;
};

const CategoryPage: React.FC = () => {
    const { categoryName } = useParams<{ categoryName: string }>();
    const [content, setContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);

    // Reset state when category changes
    useEffect(() => {
        if (!categoryName) return;
        setContent([]);
        setLoading(true);
        const unsubscribe = getAllContent(fetchedContent => {
            const filtered = fetchedContent.filter(item => item.category === categoryName);
            filtered.sort((a, b) => {
                const timeA = parseDate(a.createdAt);
                const timeB = parseDate(b.createdAt);
                if (timeA !== timeB) return timeB - timeA;
                return b.id.localeCompare(a.id);
            });
            setContent(filtered);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [categoryName]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{categoryName}</h1>
            
            {loading ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-4">
                    <i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i>
                    <p className="text-[var(--secondary-text-color)] animate-pulse">Loading latest {categoryName} content...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.isArray(content) && content.map(item => (
                            <ContentCard key={item.id} item={item} />
                        ))}
                    </div>

                    {content.length === 0 && (
                        <p className="text-center text-[var(--secondary-text-color)] mt-8">No content found in this category.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default CategoryPage;
