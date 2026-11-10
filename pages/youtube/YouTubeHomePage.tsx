import React, { useState, useEffect } from 'react';
import { YouTubeVideoItem, YouTubeConfig } from '../../types';
import { youtubeService } from '../../services/youtubeService';
import YouTubeHeader from '../../components/youtube/YouTubeHeader';
import YouTubeVideoCard from '../../components/youtube/YouTubeVideoCard';
import YouTubeHomeBannerAd from '../../components/youtube/YouTubeHomeBannerAd';

const CATEGORIES = [
  { label: 'All', id: '0' },
  { label: 'Trending', id: 'trending' },
  { label: 'Music', id: '10' },
  { label: 'Bollywood', query: 'bollywood movie trailers songs' },
  { label: 'Hollywood', query: 'hollywood action movies hindi' },
  { label: 'Movies', id: '1' },
  { label: 'Gaming', id: '20' },
  { label: 'Comedy', id: '23' },
  { label: 'News', id: '25' },
  { label: 'Animation', id: '31' }
];

export const YouTubeHomePage: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [config, setConfig] = useState<YouTubeConfig>(youtubeService.getConfig());

  useEffect(() => {
    const unsub = youtubeService.subscribeConfig((newCfg) => {
      setConfig(newCfg);
    });
    return unsub;
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadContent = async () => {
      try {
        let results: YouTubeVideoItem[] = [];
        if (activeCategory.query) {
          const searchRes = await youtubeService.searchVideos(activeCategory.query);
          results = searchRes.items;
        } else if (activeCategory.id === 'trending') {
          results = await youtubeService.getTrendingVideos('IN');
        } else if (activeCategory.id === '0') {
          results = await youtubeService.getTrendingVideos('IN');
        } else {
          results = await youtubeService.getTrendingVideos('IN', activeCategory.id);
        }

        if (isMounted) {
          setVideos(results);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load YouTube videos:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [activeCategory]);

  const bannerAd = config.ads?.homeBanner;
  const adFrequency = bannerAd?.frequency || 6;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb-20">
      <YouTubeHeader />

      {/* Category Pills Bar */}
      <div className="sticky top-14 z-30 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#222222] py-2 px-3 overflow-x-auto no-scrollbar flex items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = cat.label === activeCategory.label;
          return (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors select-none ${
                isActive
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#272727] text-gray-200 hover:bg-[#383838]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
        {/* Top Banner Ad if configured */}
        {bannerAd?.enabled && bannerAd?.showAtTop && (
          <div className="mb-4">
            <YouTubeHomeBannerAd ad={bannerAd} />
          </div>
        )}

        {/* Video Feed */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-video bg-[#222222] rounded-xl w-full"></div>
                <div className="flex gap-3 px-1">
                  <div className="w-9 h-9 rounded-full bg-[#222222] flex-shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-[#222222] rounded w-5/6"></div>
                    <div className="h-3 bg-[#222222] rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <i className="fab fa-youtube text-5xl text-red-600 mb-3 block"></i>
            <h3 className="text-lg font-bold text-white">No videos found</h3>
            <p className="text-sm mt-1">Please try another category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
            {videos.map((video, index) => {
              const shouldShowAd =
                bannerAd?.enabled &&
                index > 0 &&
                index % adFrequency === 0;

              return (
                <React.Fragment key={video.id + '-' + index}>
                  {shouldShowAd && (
                    <div className="col-span-full">
                      <YouTubeHomeBannerAd ad={bannerAd} />
                    </div>
                  )}
                  <YouTubeVideoCard video={video} />
                </React.Fragment>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default YouTubeHomePage;
