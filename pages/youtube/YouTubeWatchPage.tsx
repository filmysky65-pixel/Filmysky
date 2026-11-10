import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { YouTubeVideoItem, YouTubeCommentItem } from '../../types';
import { youtubeService } from '../../services/youtubeService';
import YouTubeHeader from '../../components/youtube/YouTubeHeader';

export const YouTubeWatchPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<YouTubeVideoItem | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<YouTubeVideoItem[]>([]);
  const [comments, setComments] = useState<YouTubeCommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    setLoading(true);
    window.scrollTo(0, 0);

    let isMounted = true;

    const loadData = async () => {
      try {
        const details = await youtubeService.getVideoDetails(videoId);
        const related = await youtubeService.getRelatedVideos(videoId);
        const fetchedComments = await youtubeService.getVideoComments(videoId);

        if (isMounted) {
          if (details) {
            setVideo(details);
            youtubeService.addToWatchHistory(details);
            setIsLiked(youtubeService.isLiked(details.id));
            setIsSaved(youtubeService.isSaved(details.id));
            setIsSubscribed(youtubeService.isSubscribed(details.channelTitle));
          }
          setRelatedVideos(related);
          setComments(fetchedComments);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load video details:', err);
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const handleToggleLike = () => {
    if (!video) return;
    const nowLiked = youtubeService.toggleLikeVideo(video);
    setIsLiked(nowLiked);
  };

  const handleToggleSave = () => {
    if (!video) return;
    const nowSaved = youtubeService.toggleSaveVideo(video);
    setIsSaved(nowSaved);
  };

  const handleToggleSubscribe = () => {
    if (!video) return;
    const nowSubbed = youtubeService.toggleSubscribe({
      title: video.channelTitle,
      avatar: video.channelThumbnail
    });
    setIsSubscribed(nowSubbed);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video?.title || 'YouTube Video on FilmySky',
          url
        });
        return;
      } catch (e) {}
    }
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment: YouTubeCommentItem = {
      id: 'local_' + Date.now(),
      authorName: 'You',
      textDisplay: newCommentText.trim(),
      likeCount: 0,
      publishedAt: 'Just now'
    };
    setComments([newComment, ...comments]);
    setNewCommentText('');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb-24">
      <YouTubeHeader />

      <main className="max-w-7xl mx-auto px-0 sm:px-4 lg:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video & Details Column */}
          <div className="lg:col-span-2">
            {/* Ad-Free Video Player Container */}
            <div className="relative aspect-video w-full bg-black sm:rounded-2xl overflow-hidden shadow-2xl border border-white/5">
              {videoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  title={video?.title || 'YouTube Video Player'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Video not available
                </div>
              )}
            </div>

            {/* Video Metadata & Actions */}
            <div className="p-4 space-y-4">
              <h1 className="text-lg md:text-xl font-bold leading-snug">
                {video?.title || 'Loading video title...'}
              </h1>

              {/* Channel Info & Subscribe Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-1 border-b border-[#272727] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#272727] flex items-center justify-center text-white font-bold text-sm overflow-hidden border border-white/10">
                    {video?.channelThumbnail ? (
                      <img src={video.channelThumbnail} alt={video.channelTitle} className="w-full h-full object-cover" />
                    ) : (
                      <span>{video?.channelTitle ? video.channelTitle.charAt(0).toUpperCase() : 'Y'}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-1">
                      <span>{video?.channelTitle || 'Channel'}</span>
                      <i className="fas fa-check-circle text-[10px] text-gray-400"></i>
                    </h3>
                    <p className="text-xs text-[#aaaaaa]">1.28M subscribers</p>
                  </div>

                  <button
                    onClick={handleToggleSubscribe}
                    className={`ml-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      isSubscribed
                        ? 'bg-[#272727] text-white hover:bg-[#383838]'
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </div>

                {/* Interaction Action Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {/* Like */}
                  <button
                    onClick={handleToggleLike}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${
                      isLiked ? 'bg-white text-black' : 'bg-[#272727] hover:bg-[#383838] text-white'
                    }`}
                  >
                    <i className={`${isLiked ? 'fas' : 'far'} fa-thumbs-up`}></i>
                    <span>{video?.likeCount || 'Like'}</span>
                  </button>

                  {/* Share */}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#272727] hover:bg-[#383838] text-white transition-colors"
                  >
                    <i className="fas fa-share"></i>
                    <span>{copied ? 'Copied!' : 'Share'}</span>
                  </button>

                  {/* Save to Library */}
                  <button
                    onClick={handleToggleSave}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${
                      isSaved ? 'bg-red-600 text-white' : 'bg-[#272727] hover:bg-[#383838] text-white'
                    }`}
                    title="Save to Library"
                  >
                    <i className={`${isSaved ? 'fas fa-bookmark' : 'far fa-bookmark'}`}></i>
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* Description Box */}
              <div
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="bg-[#222222] hover:bg-[#282828] p-3.5 rounded-xl cursor-pointer transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center gap-3 font-semibold text-gray-300">
                  <span>{video?.viewCount} views</span>
                  <span>{youtubeService.formatRelativeTime(video?.publishedAt)}</span>
                  <span className="text-red-500 font-bold">#FilmySky #AdFree</span>
                </div>
                <p className={`text-gray-300 whitespace-pre-line leading-relaxed ${descriptionExpanded ? '' : 'line-clamp-2'}`}>
                  {video?.description || 'Enjoy uninterrupted streaming of this video on FilmySky.'}
                </p>
                <button className="font-bold text-white text-[11px] mt-1">
                  {descriptionExpanded ? 'Show less' : '...more'}
                </button>
              </div>

              {/* Comments Section */}
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="font-bold text-base">
                    Comments <span className="text-gray-400 text-sm font-normal">({comments.length})</span>
                  </h3>
                </div>

                {/* Add comment */}
                <form onSubmit={handleAddComment} className="flex gap-3 items-start mb-6">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    U
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-transparent border-b border-[#383838] focus:border-white py-1 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                    />
                    {newCommentText.trim() && (
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setNewCommentText('')}
                          className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold"
                        >
                          Comment
                        </button>
                      </div>
                    )}
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 text-xs">
                      <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center font-bold text-xs flex-shrink-0 text-gray-300">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-200">@{comment.authorName}</span>
                          <span className="text-gray-500 text-[11px]">{comment.publishedAt}</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{comment.textDisplay}</p>
                        <div className="flex items-center gap-3 text-gray-400 pt-0.5">
                          <button className="hover:text-white flex items-center gap-1 text-[11px]">
                            <i className="far fa-thumbs-up"></i>
                            <span>{comment.likeCount > 0 ? comment.likeCount : ''}</span>
                          </button>
                          <button className="hover:text-white text-[11px]">
                            <i className="far fa-thumbs-down"></i>
                          </button>
                          <span className="hover:text-white font-medium text-[11px] cursor-pointer">Reply</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Videos Column */}
          <div className="px-4 lg:px-0">
            <h2 className="text-base font-bold mb-3">Up Next</h2>
            <div className="space-y-3">
              {relatedVideos.map((item) => (
                <Link
                  key={item.id}
                  to={`/youtube/watch/${item.id}`}
                  className="flex gap-3 group cursor-pointer"
                >
                  <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-[#222222] flex-shrink-0">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.duration && (
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 text-[10px] bg-black/80 text-white rounded">
                        {item.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-gray-200">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#aaaaaa] mt-1 truncate">{item.channelTitle}</p>
                    <p className="text-[10px] text-[#888888]">
                      {item.viewCount} views • {youtubeService.formatRelativeTime(item.publishedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default YouTubeWatchPage;
