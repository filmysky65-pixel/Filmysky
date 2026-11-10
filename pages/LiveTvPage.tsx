
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LiveTvNetwork } from '../types';
import { getLiveTvNetworks } from '../services/firebaseService';
import { useAppContext } from '../hooks/useAppContext';

const LiveTvPage: React.FC = () => {
    const [networks, setNetworks] = useState<LiveTvNetwork[]>([]);
    const [loading, setLoading] = useState(true);
    const { permissions } = useAppContext();

    useEffect(() => {
        const unsubscribe = getLiveTvNetworks(fetchedNetworks => {
            setNetworks(fetchedNetworks);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Live TV Networks</h1>
            {!permissions.hasLiveTvAccess && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-3 rounded-lg mb-4 text-sm">
                    <i className="fas fa-crown mr-2"></i>
                    Live TV is a premium feature. Please subscribe for full access.
                </div>
            )}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {networks.map(network => (
                        <Link 
                            key={network.id} 
                            to={`/livetv/${network.id}`}
                            className="group bg-[var(--card-bg)] rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105"
                        >
                            <div className="relative aspect-square">
                                <img src={network.poster} alt={network.name} className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                                    <h2 className="text-white text-base font-bold drop-shadow-md">{network.name}</h2>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LiveTvPage;
