
import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Content } from '../types';

interface ContentCardProps {
    item: Content;
}

const ContentCard = forwardRef<HTMLDivElement, ContentCardProps>(({ item }, ref) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/detail/${item.id}`);
    };

    return (
        <div 
            ref={ref}
            className="flex-shrink-0 w-full relative rounded-lg overflow-hidden shadow-lg bg-[var(--card-bg)] cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
            onClick={handleClick}
        >
            <img src={item.poster} alt={`${item.title} Poster Filmysky`} className="w-full aspect-[2/3] object-cover" />
            {item.language && (
                <span className="absolute top-2 right-2 bg-[var(--primary-color)]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {item.language}
                </span>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                <h3 className="text-white text-sm font-semibold truncate">{item.title}</h3>
            </div>
        </div>
    );
});

export default ContentCard;
