import React, { useState, useEffect } from 'react';
import { YouTubeVideoItem } from '../../types';
import { youtubeService } from '../../services/youtubeService';
import YouTubeHeader from '../../components/youtube/YouTubeHeader';
import YouTubeVideoCard from '../../components/youtube/YouTubeVideoCard';

export const YouTubeLibraryPage: React.FC = () => {
  const [history, setHistory] = useState<YouTubeVideoItem[]>([]);
  const [liked, setLiked] = useState<YouTubeVideoItem[]>([]);
  const [saved, setSaved] = useState<YouTubeVideoItem[]>([]);

  useEffect(() => {
    setHistory(youtubeService.getWatchHistory());
    setLiked(youtubeService.getLikedVideos());
    setSaved(youtubeService.getSavedVideos());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Clear all watch history?')) {
      youtubeService.clearWatchHistory();
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb-20">
      <YouTubeHeader />

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-8">
        <h1 className="text-xl font-bold">Library</h1>

        {/* History Section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <i className="fas fa-history text-red-500"></i> History
            </h2>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">No recently watched videos.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {history.map((v) => (
                <div key={'hist-' + v.id} className="w-56 flex-shrink-0">
                  <YouTubeVideoCard video={v} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Liked Videos */}
        <section>
          <h2 className="text-base font-bold flex items-center gap-2 mb-3">
            <i className="fas fa-thumbs-up text-red-500"></i> Liked Videos ({liked.length})
          </h2>

          {liked.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">No liked videos yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {liked.map((v) => (
                <YouTubeVideoCard key={'like-' + v.id} video={v} />
              ))}
            </div>
          )}
        </section>

        {/* Saved / Watch Later */}
        <section>
          <h2 className="text-base font-bold flex items-center gap-2 mb-3">
            <i className="fas fa-bookmark text-red-500"></i> Saved / Watch Later ({saved.length})
          </h2>

          {saved.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">No saved videos.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {saved.map((v) => (
                <YouTubeVideoCard key={'save-' + v.id} video={v} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default YouTubeLibraryPage;
