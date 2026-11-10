

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LiveTvStream, LiveTvNetwork } from '../types';
import { getLiveTvStreams, getLiveTvNetworkById } from '../services/firebaseService';
import { useAppContext } from '../hooks/useAppContext';

const LiveTvNetworkDetailPage: React.FC = () => {
    const { networkId } = useParams<{ networkId: string }>();
    const navigate = useNavigate();
    const { permissions } = useAppContext();
    const [network, setNetwork] = useState<LiveTvNetwork | null>(null);
    const [streams, setStreams] = useState<LiveTvStream[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!networkId) {
            navigate('/livetv');
            return;
        }

        const fetchNetworkDetails = async () => {
            const networkDetails = await getLiveTvNetworkById(networkId);
            setNetwork(networkDetails);
        };
        
        fetchNetworkDetails();

        const unsubscribe = getLiveTvStreams(networkId, fetchedStreams => {
            setStreams(fetchedStreams);
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, [networkId, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-6">
                 <button onClick={() => navigate('/livetv')} className="text-sm text-[var(--secondary-text-color)] hover:text-[var(--text-color)] mb-4">
                    <i className="fas fa-arrow-left mr-2"></i> Back to Networks
                </button>
                <h1 className="text-3xl font-bold">{network?.name || 'Live Streams'}</h1>
            </div>

            {!permissions.hasLiveTvAccess && (
                 <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-3 rounded-lg mb-4 text-sm">
                    <i className="fas fa-crown mr-2"></i>
                    Live TV is a premium feature. Subscribe to watch these streams.
                </div>
            )}
           
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {streams.map(stream => {
                    const streamCardContent = (
                        <>
                            <img src={stream.poster} alt={stream.title} className="w-full aspect-video object-cover" />
                            {!permissions.hasLiveTvAccess && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><i className="fas fa-lock text-3xl text-white/50"></i></div>}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                <h3 className="text-white text-sm font-semibold truncate">{stream.title}</h3>
                            </div>
                        </>
                    );

                    const commonProps = {
                        key: stream.id,
                        className: `relative rounded-lg overflow-hidden shadow-lg bg-[var(--card-bg)] transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl ${permissions.hasLiveTvAccess ? 'cursor-pointer' : 'cursor-not-allowed'}`
                    };

                    if (permissions.hasLiveTvAccess) {
                        return (
                            <a href={stream.streamUrl} target="_blank" rel="noopener noreferrer" {...commonProps}>
                                {streamCardContent}
                            </a>
                        );
                    }
                    
                    return (
                        <div {...commonProps}>
                            {streamCardContent}
                        </div>
                    );
                })}
            </div>
             {streams.length === 0 && (
                <p className="text-center text-[var(--secondary-text-color)] mt-8">
                    No live streams available for this network at the moment.
                </p>
            )}
        </div>
    );
};

export default LiveTvNetworkDetailPage;