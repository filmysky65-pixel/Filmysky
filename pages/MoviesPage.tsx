
import React, { useState, useEffect } from 'react';
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

const MoviesPage: React.FC = () => {
    const [allMovies, setAllMovies] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = getAllContent(fetchedContent => {
            // Filter: Must be 'movie' type AND NOT in '18+' or 'Upcoming' categories
            const movies = fetchedContent.filter(c => {
                if (c.type !== 'movie') return false;
                const category = (c.category || '').trim().toLowerCase();
                return category !== '18+' && category !== 'upcoming';
            });
            
            // Sort Logic: Newest Upload (createdAt) always first
            movies.sort((a, b) => {
                const timeA = parseDate(a.createdAt);
                const timeB = parseDate(b.createdAt);
                
                if (timeA !== timeB) return timeB - timeA;
                
                // Secondary sort: Year (if same upload time)
                if (b.year !== a.year) return b.year - a.year;
                
                // Final fallback: Alphabetical
                return a.title.localeCompare(b.title);
            });

            setAllMovies(movies);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Movies</h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {allMovies.map(item => (
                    <ContentCard key={item.id} item={item} />
                ))}
            </div>

            {!loading && allMovies.length > 0 && (
                <p className="text-center text-[var(--secondary-text-color)] mt-8 pb-4">You've reached the end.</p>
            )}
             {!loading && allMovies.length === 0 && (
                <p className="text-center text-[var(--secondary-text-color)] mt-8">No movies found.</p>
            )}
        </div>
    );
};

export default MoviesPage;
