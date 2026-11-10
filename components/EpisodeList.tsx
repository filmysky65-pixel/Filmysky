
import React from 'react';
import { Season } from '../types';

interface SeasonListProps {
    seasons: Season[];
    currentSeasonNumber: number;
    onSeasonSelect: (season: Season) => void;
}

const SeasonList: React.FC<SeasonListProps> = ({ seasons, currentSeasonNumber, onSeasonSelect }) => {
    // Fix: Ensure seasons is an array and safe to sort
    const safeSeasons = Array.isArray(seasons) ? seasons : (seasons ? Object.values(seasons) : []);

    if (safeSeasons.length === 0) return null;

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Seasons</h3>
            <div className="flex overflow-x-auto gap-3 pb-3 content-slider">
                {[...safeSeasons]
                    .sort((a, b) => (a.number || 0) - (b.number || 0))
                    .map((season) => (
                        <button
                            key={season.number}
                            onClick={() => onSeasonSelect(season)}
                            className={`flex-shrink-0 w-24 h-12 flex items-center justify-center font-bold text-lg rounded-md transition-colors ${
                                season.number === currentSeasonNumber 
                                    ? 'bg-[var(--primary-color)] text-white'
                                    : 'bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--primary-color)]'
                            }`}
                        >
                           S{season.number}
                        </button>
                    ))}
            </div>
        </div>
    );
};

export default SeasonList;
