
import React from 'react';
import { Link } from 'react-router-dom';
import { Content } from '../types';
import ContentCard from './ContentCard';

interface CategorySliderProps {
    title: string;
    items: Content[];
    categoryLink?: string;
}

const CategorySlider: React.FC<CategorySliderProps> = ({ title, items, categoryLink }) => {
    // Fix: Ensure items is an array before checking length
    const safeItems = Array.isArray(items) ? items : (items ? Object.values(items) : []);

    if (safeItems.length === 0) {
        return null;
    }

    return (
        <section className="mb-8">
            <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-xl font-bold text-[var(--text-color)] relative pl-4">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[var(--primary-color)] rounded-full"></span>
                    {title}
                </h2>
                {categoryLink && (
                    <Link to={`/category/${categoryLink}`} className="text-sm font-semibold text-[var(--primary-color)] hover:underline">
                        See All <i className="fas fa-chevron-right text-xs"></i>
                    </Link>
                )}
            </div>
            <div className="content-slider flex overflow-x-auto gap-4 px-4 pb-4">
                {safeItems.map(item => (
                    <div key={item.id} className="w-32 md:w-48 flex-shrink-0">
                        <ContentCard item={item} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategorySlider;
