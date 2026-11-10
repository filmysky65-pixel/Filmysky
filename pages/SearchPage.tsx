
import React, { useState, useEffect, useMemo } from 'react';
import { Content } from '../types';
import { getAllContent } from '../services/firebaseService';
import ContentCard from '../components/ContentCard';

const SearchPage: React.FC = () => {
    const [allContent, setAllContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const unsubscribe = getAllContent(fetchedContent => {
            setAllContent(fetchedContent);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredContent = useMemo(() => {
        if (!searchTerm) return [];
        return allContent.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allContent, searchTerm]);

    return (
        <div className="p-4">
            <div className="relative mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for movies, series..."
                    className="w-full p-4 pl-12 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[var(--secondary-text-color)]"></i>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i>
                </div>
            ) : searchTerm && filteredContent.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredContent.map(item => (
                        <ContentCard key={item.id} item={item} />
                    ))}
                </div>
            ) : searchTerm && filteredContent.length === 0 ? (
                <p className="text-center text-[var(--secondary-text-color)] mt-8">No results found for "{searchTerm}".</p>
            ) : (
                 <p className="text-center text-[var(--secondary-text-color)] mt-8">Start typing to search.</p>
            )}
        </div>
    );
};

export default SearchPage;
