
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PlayerHeaderProps {
  title: string;
  subtitle?: string;
  onOpenDownloadModal?: () => void;
  onBack?: () => void;
}

const PlayerHeader: React.FC<PlayerHeaderProps> = ({ title, subtitle, onOpenDownloadModal, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--card-bg)]/80 backdrop-blur-lg border-b border-[var(--border-color)] flex items-center justify-between p-4 z-50">
      <div className="flex items-center gap-4 overflow-hidden">
        <button onClick={handleBack} className="text-white text-xl flex-shrink-0">
            <i className="fas fa-arrow-left"></i>
        </button>
        <div className="flex-grow overflow-hidden">
            <h1 className="text-white text-lg font-bold truncate">{title}</h1>
            {subtitle && (
                <p className="text-gray-300 text-sm truncate">{subtitle}</p>
            )}
        </div>
      </div>
      
      {onOpenDownloadModal && (
        <button 
            onClick={onOpenDownloadModal} 
            className="w-10 h-10 bg-[var(--primary-color)]/20 hover:bg-[var(--primary-color)] text-[var(--primary-color)] hover:text-white rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-2"
            title="Download"
        >
            <i className="fas fa-download"></i>
        </button>
      )}
    </header>
  );
};

export default PlayerHeader;
