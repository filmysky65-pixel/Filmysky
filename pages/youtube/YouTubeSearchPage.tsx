import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { YouTubeVideoItem } from '../../types';
import { youtubeService } from '../../services/youtubeService';
import YouTubeHeader from '../../components/youtube/YouTubeHeader';
import YouTubeVideoCard from '../../components/youtube/YouTubeVideoCard';

export const YouTubeSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;

    let isMounted = true;
    setLoading(true);

    const performSearch = async () => {
      try {
        const res = await youtubeService.searchVideos(query);
        if (isMounted) {
          setVideos(res.items);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    performSearch();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const handleSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb-20">
      <YouTubeHeader initialSearchQuery={query} onSearch={handleSearch} />

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <p className="text-sm text-gray-400">
            Results for <span className="text-white font-bold">"{query}"</span>
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="aspect-video bg-[#222222] rounded-xl w-full"></div>
                <div className="h-4 bg-[#222222] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <i className="fas fa-search text-4xl mb-3 text-gray-500"></i>
            <h3 className="text-lg font-bold text-white">No results found for "{query}"</h3>
            <p className="text-xs text-gray-400 mt-1">Try different keywords or check spelling.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((v) => (
              <YouTubeVideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default YouTubeSearchPage;
