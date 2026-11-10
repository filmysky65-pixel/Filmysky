
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LiveTvStream } from '../types';
import { getLiveTvStream } from '../services/firebaseService';
import PlayerHeader from '../components/PlayerHeader';
import CommentsSection from '../components/CommentsSection';
import BottomNav from '../components/BottomNav';

const LiveTvPlayerPage: React.FC = () => {
    const { networkId, streamId } = useParams<{ networkId: string, streamId: string }>();
    const navigate = useNavigate();
    const [stream, setStream] = useState<LiveTvStream | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!networkId || !streamId) {
            navigate('/livetv');
            return;
        }

        const fetchStream = async () => {
            setLoading(true);
            const streamData = await getLiveTvStream(networkId, streamId);
            if (streamData) {
                setStream(streamData);
            } else {
                // Handle case where stream is not found
                navigate(`/livetv/${networkId}`);
            }
            setLoading(false);
        };

        fetchStream();
    }, [networkId, streamId, navigate]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex justify-center items-center">
                <i className="fas fa-spinner fa-spin text-4xl text-white"></i>
            </div>
        );
    }
    
    if (!stream) return null;

    const getEmbedUrl = (url: string): string => {
        if (!url) return '';
        
        try {
            const urlObj = new URL(url);
            let videoId: string | null = null;
            
            // Handle various YouTube URL formats
            const hostname = urlObj.hostname;
            if (hostname.endsWith('youtube.com') || hostname.endsWith('youtu.be')) {
                if (hostname.endsWith('youtu.be')) {
                    videoId = urlObj.pathname.substring(1);
                } else if (urlObj.pathname === '/watch') {
                    videoId = urlObj.searchParams.get('v');
                } else if (urlObj.pathname.startsWith('/embed/')) {
                    videoId = urlObj.pathname.split('/')[2];
                } else if (urlObj.pathname.startsWith('/live/')) {
                    videoId = urlObj.pathname.split('/')[2];
                }
            }
    
            if (videoId) {
                const params = new URLSearchParams();
                params.set('autoplay', '1');
                params.set('mute', '1'); // Mute is often required for autoplay
                params.set('modestbranding', '1');
                params.set('iv_load_policy', '3'); // Disable annotations
                params.set('rel', '0'); // Do not show related videos
                params.set('playsinline', '1'); // Important for iOS
                return `https://www.youtube.com/embed/${videoId.split('?')[0]}?${params.toString()}`;
            }
            
            // For other generic URLs, try to add autoplay parameters if they don't exist
            if (url.startsWith('http')) {
                if (!urlObj.searchParams.has('autoplay')) {
                    urlObj.searchParams.set('autoplay', '1');
                }
                // Some players use 'autostart'
                if (!urlObj.searchParams.has('autostart')) {
                     urlObj.searchParams.set('autostart', 'true');
                }
                return urlObj.toString();
            }

            return url;
    
        } catch (e) {
            console.warn("Could not parse stream URL, using it as is:", url, e);
            return url; // Return original url if parsing fails
        }
    };
    
    const embedUrl = getEmbedUrl(stream.streamUrl);
    // Create a unique ID for comments related to this live stream
    const commentContentId = `livetv-${stream.id}`;

    return (
        <div className="bg-black text-white h-screen flex flex-col">
            <PlayerHeader 
                title={stream.title} 
                subtitle="Live Stream" 
                onBack={() => navigate(`/livetv/${networkId}`)}
            />
            <main className="flex-grow pt-16 flex flex-col md:grid md:grid-cols-[1fr_auto] overflow-hidden">
                <div className="w-full bg-black flex-shrink-0 flex justify-center items-center">
                    <div className="w-full aspect-video relative bg-black">
                        <iframe
                            src={embedUrl}
                            title={stream.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full absolute inset-0"
                        ></iframe>
                    </div>
                </div>
                <aside className="w-full md:w-96 bg-[var(--card-bg)] flex flex-col overflow-y-auto p-4 flex-grow min-h-0 md:h-full pb-20 md:pb-4">
                    <div className="flex-grow min-h-0">
                        <CommentsSection contentId={commentContentId} />
                    </div>
                </aside>
            </main>
            <BottomNav />
        </div>
    );
};

export default LiveTvPlayerPage;
