
import React from 'react';
import { QualityLink } from '../types';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: QualityLink[];
  title: string;
  actionType?: 'download' | 'stream'; // Default is 'download'
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, links, title, actionType = 'download' }) => {
  if (!isOpen) return null;

  const handleAction = (url: string, quality: string) => {
    // Open in new tab - most reliable for both streams and downloads across devices
    window.open(url, '_blank');
    onClose();
  };

  const isStream = actionType === 'stream';
  const modalTitle = isStream ? 'Select Server' : 'Download Video';
  const iconClass = isStream ? 'fas fa-play' : 'fas fa-download';

  return (
    <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-end z-[2000] p-4 animate-fade-in"
    >
        <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--card-bg)] border-t border-[var(--border-color)] w-full max-w-lg rounded-t-2xl p-6 shadow-2xl transform transition-transform animate-slide-up"
        >
            <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[var(--text-color)]">{modalTitle}</h2>
                    <p className="text-sm text-[var(--secondary-text-color)] truncate max-w-[250px]">{title}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-color)] text-[var(--text-color)]">
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {links.length > 0 ? (
                    links.map((link, index) => (
                        <button
                            key={index}
                            onClick={() => handleAction(link.url, link.quality)}
                            className="w-full flex items-center justify-between p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl hover:border-[var(--primary-color)] transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center group-hover:bg-[var(--primary-color)] group-hover:text-white transition-colors">
                                    <i className={isStream ? "fas fa-play" : "fas fa-file-video"}></i>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-[var(--text-color)]">{isStream ? link.quality : `${link.quality} Quality`}</p>
                                    <p className="text-xs text-[var(--secondary-text-color)]">{isStream ? 'Server / Mirror' : 'MP4 / MKV'}</p>
                                </div>
                            </div>
                            <i className={`${iconClass} text-[var(--secondary-text-color)] group-hover:text-[var(--primary-color)]`}></i>
                        </button>
                    ))
                ) : (
                    <div className="text-center py-8 text-[var(--secondary-text-color)]">
                        <i className="fas fa-exclamation-circle text-4xl mb-3 opacity-50"></i>
                        <p>No links available.</p>
                    </div>
                )}
            </div>
        </div>
        <style>{`
            @keyframes slide-up {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            .animate-slide-up {
                animation: slide-up 0.3s ease-out forwards;
            }
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default DownloadModal;
