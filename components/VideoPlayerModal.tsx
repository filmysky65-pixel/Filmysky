

import React from 'react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose, videoUrl, title }) => {
  if (!isOpen) {
    return null;
  }

  // Simplified for Live TV. A more robust player might be needed for VOD.
  return (
    <div className="fixed inset-0 bg-black/90 z-[1000] flex justify-center items-center" onClick={onClose}>
      <div className="w-full max-w-4xl aspect-video bg-black flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-2 bg-black/50 text-white flex justify-between items-center flex-shrink-0">
            <h3 className="font-semibold truncate">{title}</h3>
            <button onClick={onClose} className="text-xl w-8 h-8 flex items-center justify-center">
                <i className="fas fa-times"></i>
            </button>
        </div>
        <div className="w-full flex-grow">
          <iframe 
            src={videoUrl} 
            allow="autoplay; encrypted-media" 
            allowFullScreen 
            className="w-full h-full border-0"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;