
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { getAllContent } from '../services/firebaseService';
import { Content } from '../types';
import ContentCard from '../components/ContentCard';
import { useNavigate } from 'react-router-dom';

const WatchlistPage: React.FC = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const [allContent, setAllContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = getAllContent(fetchedContent => {
            setAllContent(fetchedContent);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const watchlistContent = useMemo(() => {
        const watchlistIds = user?.watchlist ? Object.keys(user.watchlist) : [];
        if (watchlistIds.length === 0 || allContent.length === 0) {
            return [];
        }
        return allContent.filter(item => item.id && watchlistIds.includes(item.id));
    }, [user, allContent]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">My Watchlist</h1>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i>
                </div>
            ) : watchlistContent.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {watchlistContent.map(item => (
                        <ContentCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-[var(--secondary-text-color)] mb-4">Your watchlist is empty.</p>
                    <button onClick={() => navigate('/')} className="bg-[var(--primary-color)] text-white font-bold py-2 px-6 rounded-lg">
                        Browse Content
                    </button>
                </div>
            )}
        </div>
    );
};

export default WatchlistPage;
