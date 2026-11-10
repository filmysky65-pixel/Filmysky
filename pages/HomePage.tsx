
import React, { useState, useEffect, useMemo } from 'react';
import { Content } from '../types';
import { getAllContent } from '../services/firebaseService';
import CategorySlider from '../components/CategorySlider';
import HeroSlider from '../components/HeroSlider';

// Helper to reliably parse date for sorting (handles number timestamp and ISO string)
const parseDate = (date: string | number | undefined): number => {
    if (!date) return 0;
    if (typeof date === 'number') return date;
    const parsed = Date.parse(date);
    return isNaN(parsed) ? 0 : parsed;
};

const HomePage: React.FC = () => {
    const [content, setContent] = useState<Content[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [minDelayPassed, setMinDelayPassed] = useState(false);
    useEffect(() => {
        // Load all content so categories and movies are available together.
        const unsubscribeContent = getAllContent(fetchedContent => {
            setContent(fetchedContent);
            setDataLoaded(true);
        });
        
        return () => {
            unsubscribeContent();
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setMinDelayPassed(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    const { categorizedContent, heroItems } = useMemo(() => {
        const categories: { [key: string]: Content[] } = {};
        
        // Group content by category with normalization (trimming extra spaces and case-insensitive check)
        content.forEach(item => {
            let cat = (item.category || 'Others').trim();
            // Case normalization to prevent split rows (e.g. 'Bhojpuri' vs 'bhojpuri')
            const catLower = cat.toLowerCase();
            if (catLower === 'bhojpuri') cat = 'Bhojpuri';
            if (catLower === 'bollywood') cat = 'Bollywood';
            if (catLower === 'hollywood') cat = 'Hollywood';
            if (catLower === 'south indian') cat = 'South Indian';

            if (!categories[cat]) {
                categories[cat] = [];
            }
            categories[cat].push(item);
        });
        
        // Sort each category row by 'createdAt' descending (STRICT NEWEST FIRST)
        Object.keys(categories).forEach(key => {
            categories[key].sort((a, b) => {
                const timeA = parseDate(a.createdAt);
                const timeB = parseDate(b.createdAt);
                if (timeA !== timeB) return timeB - timeA;
                return b.id.localeCompare(a.id);
            });
            // Show up to 15 items per category on home page
            categories[key] = categories[key].slice(0, 15);
        });
        
        // Hero Slider Logic:
        // 1. Prioritize items marked as 'isFeatured' manually by Admin.
        const featuredItems = content.filter(c => c.isFeatured === true);
        featuredItems.sort((a, b) => parseDate(b.updatedAt) - parseDate(a.updatedAt));

        // 2. Combine with latest uploads (sorted by createdAt)
        const remainingItems = content.filter(c => !c.isFeatured);
        remainingItems.sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));

        // Combine and slice top 5
        const heroItems = [...featuredItems, ...remainingItems].slice(0, 5);

        return { categorizedContent: categories, heroItems };
    }, [content]);

    const loading = !dataLoaded || !minDelayPassed;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i>
            </div>
        );
    }
    
    // Custom Sort Order - "Others" is strictly last
    const categoryOrder = [
        'Upcoming',
        'South Indian', 
        'Bollywood', 
        'Hollywood', 
        'Web Series', 
        'Punjabi', 
        'Bhojpuri', 
        '18+', 
        'Others'
    ];
    
    const sortedCategories = Object.keys(categorizedContent).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);

        // If both are in the priority list, sort by defined order
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;

        // "Others" should always be last regardless
        if (a === 'Others') return 1;
        if (b === 'Others') return -1;

        // If a is in list but b isn't, a comes first
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        // If neither are in list, sort alphabetically
        return a.localeCompare(b);
    });

    return (
        <div className="space-y-4">
            {heroItems && heroItems.length > 0 && <HeroSlider items={heroItems} />}
            {sortedCategories.map(category => (
                <CategorySlider 
                    key={category}
                    title={category}
                    items={categorizedContent[category]}
                    categoryLink={category}
                />
            ))}
        </div>
    );
};

export default HomePage;
