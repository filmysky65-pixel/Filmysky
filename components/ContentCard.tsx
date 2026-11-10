import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Content } from '../types';
import { useAppContext } from '../hooks/useAppContext';

interface ContentCardProps {
    item: Content;
}

const ContentCard = forwardRef<HTMLDivElement, ContentCardProps>(({ item }, ref) => {
    const navigate = useNavigate();
    const { appSettings } = useAppContext();

    const handleClick = () => {
        navigate(`/detail/${item.id}`);
    };

    // Horizontal border color from admin settings or defaults to vibrant primary theme color
    const horizontalBorderColor = appSettings?.posterBorderColor || 'var(--primary-color)';

    return (
        <div 
            ref={ref}
            className="flex-shrink-0 w-full relative rounded-xl overflow-hidden shadow-lg bg-[var(--card-bg)] cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-t-[3.5px] border-b-[3.5px]"
            style={{ 
                borderTopColor: horizontalBorderColor, 
                borderBottomColor: horizontalBorderColor,
                boxShadow: `0 4px 16px -2px rgba(0,0,0,0.7)`
            }}
            onClick={handleClick}
        >
            <img src={item.poster} alt={`${item.title} Poster Filmysky`} className="w-full aspect-[2/3] object-cover" />
            {item.language && (
                <span className="absolute top-2 right-2 bg-[var(--primary-color)]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm shadow-md">
                    {item.language}
                </span>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                <h3 className="text-white text-sm font-semibold truncate">{item.title}</h3>
                {item.year && <span className="text-[10px] text-gray-300">{item.year}</span>}
            </div>
        </div>
    );
});

export default ContentCard;
