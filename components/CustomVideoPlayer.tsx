
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { QualityLink, AdCampaign } from '../types';
import { serveAd, recordAdView, recordAdClick } from '../services/firebaseService';
import { useAppContext } from '../hooks/useAppContext';
import { formatStreamUrl } from '../utils/stream';

interface CustomVideoPlayerProps {
  links: QualityLink[];
  poster: string;
  posterAlt?: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ links, poster, posterAlt }) => {
    // --- State ---
    const { permissions, appSettings } = useAppContext();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentQuality, setCurrentQuality] = useState<string>('');
    const [currentSrc, setCurrentSrc] = useState<string>('');
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    
    // --- Ad State ---
    const [adCampaign, setAdCampaign] = useState<AdCampaign | null>(null);
    const [isAdPlaying, setIsAdPlaying] = useState(false);
    const [adTimeLeft, setAdTimeLeft] = useState(0);
    const [canSkip, setCanSkip] = useState(false);
    const adViewRecorded = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const defaultServerBase = appSettings?.playerConfig?.defaultServerBaseUrl;

    const sortedLinks = useMemo(() => {
        return [...links].sort((a, b) => {
            const numA = parseInt(a.quality, 10);
            const numB = parseInt(b.quality, 10);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numB - numA;
            }
            if (!isNaN(numA)) return -1;
            if (!isNaN(numB)) return 1;
            return a.quality.localeCompare(b.quality);
        });
    }, [links]);

    // Initial Setup
    useEffect(() => {
        if (sortedLinks.length === 0) return;
        const defaultQuality = sortedLinks.find(l => l.quality.startsWith('480')) || sortedLinks[0];
        if (defaultQuality) {
            setCurrentQuality(defaultQuality.quality);
            setCurrentSrc(formatStreamUrl(defaultQuality.url, defaultServerBase));
        }
    }, [sortedLinks, defaultServerBase]);

    // Fullscreen & Orientation Logic
    useEffect(() => {
        const handleFullScreenChange = async () => {
            const isFullScreen = document.fullscreenElement || 
                                 (document as any).webkitFullscreenElement || 
                                 (document as any).mozFullScreenElement ||
                                 (document as any).msFullscreenElement;

            if (isFullScreen) {
                // Attempt to lock to landscape
                try {
                    if (screen.orientation && 'lock' in screen.orientation) {
                        await (screen.orientation as any).lock('landscape');
                    } else if ((screen as any).lockOrientation) {
                         (screen as any).lockOrientation('landscape');
                    }
                } catch (error) {
                    // Orientation lock not supported or failed (common on some mobile browsers/iOS)
                    console.log("Orientation lock failed:", error);
                }
            } else {
                // Unlock orientation on exit
                try {
                    if (screen.orientation && 'unlock' in screen.orientation) {
                        (screen.orientation as any).unlock();
                    } else if ((screen as any).unlockOrientation) {
                        (screen as any).unlockOrientation();
                    }
                } catch (error) {
                    console.log("Orientation unlock failed:", error);
                }
            }
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
        document.addEventListener('mozfullscreenchange', handleFullScreenChange);
        document.addEventListener('MSFullscreenChange', handleFullScreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
        };
    }, []);

    // Start Logic (Play button)
    const handleStart = useCallback(async () => {
        setIsPlaying(true);
        // Serve Ad Logic (Pre-roll) - Only if permissions allow
        if (permissions.shouldShowAds) {
            const ad = await serveAd('video');
            if (ad) {
                setAdCampaign(ad);
                setIsAdPlaying(true);
                setAdTimeLeft(ad.duration);
                setCanSkip(false); // Reset skip availability
            }
        }
    }, [permissions.shouldShowAds]);

    // Ad Timer Logic
    useEffect(() => {
        if (isAdPlaying && adTimeLeft > 0) {
            // Check skip condition (after 5 seconds)
            if (adCampaign && (adCampaign.duration - adTimeLeft) >= 5) {
                setCanSkip(true);
            }

            const timer = setInterval(() => {
                setAdTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (isAdPlaying && adTimeLeft === 0) {
            // Ad Finished
            if (!adViewRecorded.current && adCampaign) {
                recordAdView(adCampaign);
                adViewRecorded.current = true;
            }
            skipAd();
        }
    }, [isAdPlaying, adTimeLeft, adCampaign]);

    const skipAd = () => {
        setIsAdPlaying(false);
        setAdCampaign(null);
    };

    const handleAdClick = () => {
        if (!adCampaign) return;
        recordAdClick(adCampaign);
        if (adCampaign.targetUrl) {
            window.open(adCampaign.targetUrl, '_blank');
        }
    };

    const handleQualityChange = (quality: string) => {
        const newLink = sortedLinks.find(l => l.quality === quality);
        if (newLink) {
            setCurrentQuality(quality);
            setCurrentSrc(formatStreamUrl(newLink.url, defaultServerBase));
            setShowQualityMenu(false);
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full absolute inset-0 bg-black group relative">
            
            {/* Initial Poster & Play Button */}
            {!isPlaying && (
                <div className="absolute inset-0 z-50">
                    <img src={poster} alt={posterAlt || 'Video poster'} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 flex justify-center items-center bg-black/40">
                        <button onClick={handleStart} className="p-5 text-6xl text-white hover:bg-white/10 rounded-full transition-colors z-30 [text-shadow:0_2px_8px_rgba(0,0,0,0.7)] transform hover:scale-110 duration-300">
                            <i className="fas fa-play"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Ad Player Iframe */}
            {isPlaying && isAdPlaying && adCampaign && (
                <div className="absolute inset-0 z-40 bg-black flex flex-col justify-center">
                    {/* Click layer for ad tracking if target URL exists */}
                    {adCampaign.targetUrl && (
                         <div 
                            className="absolute inset-0 z-10 cursor-pointer pointer-events-auto"
                            style={{ bottom: '60px' }} // Leave space for controls if needed
                            onClick={handleAdClick} 
                            title="Visit Advertiser"
                        ></div>
                    )}

                    <iframe 
                        src={adCampaign.contentUrl} 
                        className="w-full h-full border-0 pointer-events-none" // Disable interaction with ad iframe itself
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    ></iframe>
                    
                    <div className="absolute top-4 right-4 z-50 bg-black/70 text-white px-4 py-2 rounded-lg font-mono text-sm border border-white/20">
                        Ad: <span className="font-bold text-[var(--primary-color)]">{adTimeLeft}s</span>
                    </div>
                    
                    <div className="absolute bottom-10 left-4 z-20 text-white bg-black/50 px-3 py-1 rounded text-sm pointer-events-none">
                        Advertisement
                    </div>
                    
                    {canSkip && (
                        <div className="absolute bottom-10 right-4 z-20">
                            <button onClick={skipAd} className="bg-white/20 hover:bg-white/40 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 backdrop-blur-sm border border-white/30 transition-all pointer-events-auto">
                                Skip Ad <i className="fas fa-forward"></i>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Content Player Iframe */}
            {isPlaying && !isAdPlaying && (
                <div className="absolute inset-0 z-30">
                    <iframe 
                        src={currentSrc} 
                        className="w-full h-full border-0" 
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                    ></iframe>

                    {/* Quality / Server Switcher Overlay (Hidden by default, shown on hover/interaction) */}
                    {sortedLinks.length > 1 && (
                        <div className="absolute top-4 right-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="relative">
                                <button 
                                    onClick={() => setShowQualityMenu(p => !p)} 
                                    className="bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded flex items-center gap-2 text-sm backdrop-blur-sm border border-white/10"
                                >
                                    <i className="fas fa-server"></i> {currentQuality}
                                </button>
                                
                                {showQualityMenu && (
                                    <div className="absolute top-full right-0 mt-2 bg-black/95 rounded-lg p-1 backdrop-blur-md border border-white/10 min-w-[200px] max-h-60 overflow-y-auto shadow-xl z-50">
                                        <div className="px-2 py-1 text-xs text-gray-400 font-semibold border-b border-white/10 mb-1">
                                            Select Server / Source
                                        </div>
                                        {sortedLinks.map(link => (
                                            <button
                                                key={link.quality}
                                                onClick={() => handleQualityChange(link.quality)}
                                                className={`block w-full text-left px-3 py-2 text-xs rounded transition-colors ${
                                                    currentQuality === link.quality 
                                                        ? 'bg-[var(--primary-color)] text-white font-bold' 
                                                        : 'text-gray-300 hover:bg-white/10'
                                                }`}
                                            >
                                                {link.quality}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomVideoPlayer;
