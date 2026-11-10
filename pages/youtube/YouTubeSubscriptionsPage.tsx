import React, { useState, useEffect } from 'react';
import { YouTubeVideoItem } from '../../types';
import { youtubeService } from '../../services/youtubeService';
import YouTubeHeader from '../../components/youtube/YouTubeHeader';
import YouTubeVideoCard from '../../components/youtube/YouTubeVideoCard';

export const YouTubeSubscriptionsPage: React.FC = () => {
  const [channels, setChannels] = useState<{ id: string; title: string; avatar: string }[]>([]);
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subs = youtubeService.getSubscribedChannels();
    setChannels(subs);

    const loadSubVideos = async () => {
      setLoading(true);
      try {
        const query = subs.length > 0 ? subs.map((c) => c.title).join(' OR ') : 'trending official channel';
        const res = await youtubeService.searchVideos(query);
        setVideos(res.items);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    loadSubVideos();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb-20">
      <YouTubeHeader />

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        <div>
          <h1 className="text-xl font-bold mb-3">Subscriptions</h1>

          {/* Subscribed Channels Avatar Row */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group w-18 text-center"
              >
                <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-red-600 to-red-400 group-hover:scale-105 transition-transform">
                  <img
                    src={ch.avatar}
                    alt={ch.title}
                    className="w-full h-full rounded-full object-cover border-2 border-[#0f0f0f]"
                  />
                </div>
                <span className="text-[11px] text-gray-300 mt-1 truncate w-full font-medium">
                  {ch.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Videos feed */}
        <div>
          <h2 className="text-base font-bold text-gray-300 mb-4">Latest from your channels</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="aspect-video bg-[#222222] rounded-xl w-full"></div>
                  <div className="h-4 bg-[#222222] rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>No subscription videos found yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map((v) => (
                <YouTubeVideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default YouTubeSubscriptionsPage;
