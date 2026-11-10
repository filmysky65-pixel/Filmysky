import React from 'react';
import { YouTubeShortsAd } from '../../types';

interface YouTubeShortsAdCardProps {
  ad: YouTubeShortsAd;
  onNext?: () => void;
}

export const YouTubeShortsAdCard: React.FC<YouTubeShortsAdCardProps> = ({ ad, onNext }) => {
  return (
    <div className="relative w-full h-full max-w-md mx-auto bg-[#141414] rounded-2xl overflow-hidden flex flex-col justify-between border border-white/10 shadow-2xl">
      {/* Top Bar with Sponsored tag */}
      <div className="relative z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <span className="bg-[#ff0000] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
            Ad
          </span>
          <span className="text-xs text-gray-300 font-semibold">Sponsored</span>
        </div>
        {onNext && (
          <button
            onClick={onNext}
            className="text-xs text-gray-400 hover:text-white bg-black/50 px-2.5 py-1 rounded-full border border-white/10"
          >
            Skip <i className="fas fa-chevron-down ml-1 text-[10px]"></i>
          </button>
        )}
      </div>

      {/* Main Visual Image / Media */}
      <div className="absolute inset-0">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      </div>

      {/* Bottom Ad Content & CTA */}
      <div className="relative z-10 p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md">
            {ad.title}
          </h3>
          <p className="text-sm text-gray-200 mt-1 line-clamp-3 drop-shadow">
            {ad.description}
          </p>
        </div>

        <a
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-[#ff0000] hover:bg-[#cc0000] text-white font-bold rounded-xl text-sm shadow-lg shadow-red-900/40 transition-transform active:scale-95"
        >
          <span>{ad.ctaText || 'Learn More'}</span>
          <i className="fas fa-arrow-right text-xs"></i>
        </a>
      </div>
    </div>
  );
};

export default YouTubeShortsAdCard;
