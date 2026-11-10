import React from 'react';
import { YouTubeHomeBannerAd as BannerAdType } from '../../types';
import AdContainer from '../AdContainer';

interface YouTubeHomeBannerAdProps {
  ad: BannerAdType;
}

export const YouTubeHomeBannerAd: React.FC<YouTubeHomeBannerAdProps> = ({ ad }) => {
  if (!ad || !ad.enabled) return null;

  if (ad.type === 'code' && ad.code) {
    return (
      <div className="my-4 px-2 col-span-full">
        <div className="bg-[#181818] border border-[#2e2e2e] rounded-xl p-3 text-center overflow-hidden">
          <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">
            Sponsored Ad
          </span>
          <AdContainer code={ad.code} />
        </div>
      </div>
    );
  }

  if (ad.imageUrl) {
    return (
      <div className="my-4 px-1 col-span-full">
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#1e1e24] via-[#24192b] to-[#1e1e24] shadow-xl">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/30">
            <div className="flex items-center gap-2">
              <span className="bg-[#ff0000] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                Ad
              </span>
              <span className="text-xs text-gray-300 font-medium">Sponsored Banner</span>
            </div>
            {ad.targetUrl && (
              <a
                href={ad.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
              >
                Visit <i className="fas fa-external-link-alt text-[10px]"></i>
              </a>
            )}
          </div>

          <a
            href={ad.targetUrl || '#'}
            target={ad.targetUrl ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative aspect-[21/9] sm:aspect-[24/7] max-h-48 w-full overflow-hidden bg-black/40">
              <img
                src={ad.imageUrl}
                alt={ad.title || 'Advertisement'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                {ad.title && (
                  <p className="text-white text-sm md:text-base font-bold drop-shadow-md">
                    {ad.title}
                  </p>
                )}
              </div>
            </div>
          </a>
        </div>
      </div>
    );
  }

  return null;
};

export default YouTubeHomeBannerAd;
