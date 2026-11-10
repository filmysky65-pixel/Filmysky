

import React from 'react';
import { Season } from '../types';

interface SeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  seasons: Season[];
  title: string;
  onSeasonSelect: (season: Season) => void;
}

const SeasonModal: React.FC<SeasonModalProps> = ({ isOpen, onClose, seasons, title, onSeasonSelect }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-end z-50 p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--card-bg)] border-t-2 border-[var(--primary-color)] rounded-t-2xl w-full max-w-lg shadow-2xl max-h-[70vh] flex flex-col"
      >
        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold truncate">{title} - Seasons</h2>
          <button onClick={onClose} className="text-[var(--secondary-text-color)] hover:text-[var(--text-color)]">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {seasons
              .sort((a, b) => a.number - b.number)
              .map((season) => (
                <button
                  key={season.number}
                  onClick={() => onSeasonSelect(season)}
                  className="bg-black/20 border border-[var(--border-color)] rounded-md aspect-square flex items-center justify-center font-bold text-lg hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                >
                  {season.number}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonModal;