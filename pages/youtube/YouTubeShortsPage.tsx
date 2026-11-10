import React, { useState, useEffect } from 'react';
import { YouTubeVideoItem, YouTubeConfig } from '../../types';
import { youtubeService } from '../../services/youtubeService';
import YouTubeHeader from '../../components/youtube/YouTubeHeader';
import YouTubeShortsAdCard from '../../components/youtube/YouTubeShortsAdCard';

export const YouTubeShortsPage: React.FC = () => {
  const [shorts, setShorts] = useState<YouTubeVideoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<YouTubeConfig>(youtubeService.getConfig());
  const [likedShorts, setLikedShorts] = useState<Record<string, boolean>>({});
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const unsub = youtubeService.subscribeConfig((newCfg) => {
      setConfig(newCfg);
    });
    return unsub;
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadShorts = async () => {
      setLoading(true);
      try {
        const list = await youtubeService.getShorts();
        if (isMounted) {
          setShorts(list);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    };
    loadShorts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNext = () => {
    if (currentIndex < totalSlots - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const shortsAd = config.ads?.shortsAd;
  const adFrequency = shortsAd?.frequency || 3;

  // Build unified feed including Shorts Ads
  type FeedItem =
    | { type: 'short'; item: YouTubeVideoItem; index: number }
    | { type: 'ad'; id: string };

  const feedItems: FeedItem[] = [];
  let shortCounter = 0;

  shorts.forEach((short, idx) => {
    feedItems.push({ type: 'short', item: short, index: idx });
    shortCounter++;
    if (shortsAd?.enabled && shortCounter % adFrequency === 0) {
      feedItems.push({ type: 'ad', id: `ad-${shortCounter}` });
    }
  });

  const totalSlots = feedItems.length;
  const currentSlot = feedItems[currentIndex];

  const handleToggleLike = (id: string, item: YouTubeVideoItem) => {
    const isNowLiked = youtubeService.toggleLikeVideo(item);
    setLikedShorts((prev) => ({ ...prev, [id]: isNowLiked }));
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col pb-16">
      <YouTubeHeader />

      <main className="flex-1 flex items-center justify-center relative p-2 md:p-4 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <i className="fas fa-spinner fa-spin text-4xl text-red-600"></i>
            <p className="text-gray-400 text-sm">Loading Shorts...</p>
          </div>
        ) : !currentSlot ? (
          <div className="text-center text-gray-400">
            <p>No Shorts available.</p>
          </div>
        ) : (
          <div className="relative w-full max-w-[380px] h-[calc(100vh-140px)] max-h-[700px] bg-[#121212] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
            {currentSlot.type === 'ad' ? (
              <YouTubeShortsAdCard ad={shortsAd!} onNext={handleNext} />
            ) : (
              <>
                {/* Embedded Shorts Player */}
                <div className="relative w-full h-full bg-black overflow-hidden">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${currentSlot.item.id}?autoplay=1&loop=1&playlist=${currentSlot.item.id}&modestbranding=1&controls=0&playsinline=1`}
                    title={currentSlot.item.title}
                    className="w-full h-full border-0 pointer-events-auto"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />

                  {/* Top Overlay Indicator */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <i className="fas fa-bolt text-[9px]"></i> Shorts
                    </span>
                  </div>

                  {/* Right Floating Actions */}
                  <div className="absolute bottom-16 right-2 z-20 flex flex-col items-center gap-4 text-white">
                    {/* Like */}
                    <button
                      onClick={() => handleToggleLike(currentSlot.item.id, currentSlot.item)}
                      className="flex flex-col items-center group"
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-75 ${
                        likedShorts[currentSlot.item.id] ? 'bg-red-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                      }`}>
                        <i className="fas fa-thumbs-up text-lg"></i>
                      </div>
                      <span className="text-[11px] font-semibold mt-1 drop-shadow">
                        {currentSlot.item.likeCount || 'Like'}
                      </span>
                    </button>

                    {/* Comments */}
                    <button
                      onClick={() => setShowComments(!showComments)}
                      className="flex flex-col items-center group"
                    >
                      <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center backdrop-blur-md transition-transform active:scale-75">
                        <i className="fas fa-comment-dots text-lg"></i>
                      </div>
                      <span className="text-[11px] font-semibold mt-1 drop-shadow">
                        {currentSlot.item.commentCount || 'Chat'}
                      </span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => {
                        const url = `https://youtube.com/shorts/${currentSlot.item.id}`;
                        if (navigator.share) {
                          navigator.share({ title: currentSlot.item.title, url }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(url);
                          alert('Short link copied to clipboard!');
                        }
                      }}
                      className="flex flex-col items-center group"
                    >
                      <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center backdrop-blur-md transition-transform active:scale-75">
                        <i className="fas fa-share text-lg"></i>
                      </div>
                      <span className="text-[11px] font-semibold mt-1 drop-shadow">Share</span>
                    </button>

                    {/* Vinyl spinning sound icon */}
                    <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden animate-spin-slow bg-black/80 flex items-center justify-center">
                      <i className="fas fa-music text-xs text-red-500"></i>
                    </div>
                  </div>

                  {/* Bottom Video Metadata */}
                  <div className="absolute bottom-3 left-3 right-16 z-20 space-y-2 pointer-events-none drop-shadow-md">
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs text-white border border-white/20">
                        {currentSlot.item.channelTitle.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold truncate">{currentSlot.item.channelTitle}</span>
                      <button
                        onClick={() => youtubeService.toggleSubscribe({ title: currentSlot.item.channelTitle })}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-[10px] font-bold"
                      >
                        Subscribe
                      </button>
                    </div>

                    <p className="text-xs font-medium text-white line-clamp-2 leading-tight">
                      {currentSlot.item.title}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Next / Previous Floating Arrow Controls */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-2 z-30 flex items-center gap-6">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center disabled:opacity-30 border border-white/10"
                title="Previous Short"
              >
                <i className="fas fa-chevron-up text-xs"></i>
              </button>
              <button
                disabled={currentIndex >= totalSlots - 1}
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center disabled:opacity-30 border border-white/10"
                title="Next Short"
              >
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default YouTubeShortsPage;
