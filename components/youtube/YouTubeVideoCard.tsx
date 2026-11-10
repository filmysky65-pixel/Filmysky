import React from 'react';
import { Link } from 'react-router-dom';
import { YouTubeVideoItem } from '../../types';
import { youtubeService } from '../../services/youtubeService';

interface YouTubeVideoCardProps {
  video: YouTubeVideoItem;
}

export const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({ video }) => {
  const relativeTime = youtubeService.formatRelativeTime(video.publishedAt);

  return (
    <article className="flex flex-col group cursor-pointer transition-all">
      <Link to={`/youtube/watch/${video.id}`} className="block relative aspect-video w-full overflow-hidden rounded-xl bg-[#1f1f1f]">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
          }}
        />
        {video.duration && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[11px] font-semibold bg-black/80 text-white rounded">
            {video.duration}
          </span>
        )}
      </Link>

      <div className="flex gap-3 mt-3 px-1">
        {/* Channel Avatar */}
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#272727] border border-white/10 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
            {video.channelThumbnail ? (
              <img src={video.channelThumbnail} alt={video.channelTitle} className="w-full h-full object-cover" />
            ) : (
              <span>{video.channelTitle ? video.channelTitle.charAt(0).toUpperCase() : 'Y'}</span>
            )}
          </div>
        </div>

        {/* Video Info */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/youtube/watch/${video.id}`}
            className="text-white text-sm font-semibold leading-snug line-clamp-2 hover:text-gray-200"
            title={video.title}
          >
            {video.title}
          </Link>

          <div className="text-[#aaaaaa] text-xs mt-1 space-y-0.5">
            <p className="hover:text-white truncate flex items-center gap-1">
              <span>{video.channelTitle}</span>
              <i className="fas fa-check-circle text-[10px] text-gray-400"></i>
            </p>
            <p className="flex items-center gap-1.5 text-[11px]">
              <span>{video.viewCount} views</span>
              <span className="text-[6px]">•</span>
              <span>{relativeTime}</span>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default YouTubeVideoCard;
