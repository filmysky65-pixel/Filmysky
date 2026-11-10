

import React, { useState, useEffect } from 'react';
import { AdCampaign } from '../../types';
import { getAllCampaigns, updateAdCampaignStatus } from '../../services/firebaseService';

const AdminAdsPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');

    useEffect(() => {
        const unsubscribe = getAllCampaigns(data => {
            setCampaigns(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (adId: string, status: 'active' | 'rejected') => {
        if (status === 'rejected') {
            if (!window.confirm("Rejecting this ad will refund the budget to the user's wallet. Confirm?")) return;
        }
        await updateAdCampaignStatus(adId, status);
    };

    const filteredCampaigns = filter === 'all' ? campaigns : campaigns.filter(c => c.status === filter);

    if (loading) return <div className="flex justify-center items-center h-64"><i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i></div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Ad Manager</h1>
            
            <div className="flex gap-2 mb-4 border-b border-[var(--border-color)] overflow-x-auto">
                {['all', 'pending', 'active', 'rejected'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f as any)} 
                        className={`py-2 px-4 capitalize whitespace-nowrap ${filter === f ? 'border-b-2 border-[var(--primary-color)] font-bold' : 'text-[var(--secondary-text-color)]'}`}
                    >
                        {f} ({f === 'all' ? campaigns.length : campaigns.filter(c => c.status === f).length})
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredCampaigns.map(ad => (
                    <div key={ad.id} className="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--border-color)]">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg">{ad.name}</h3>
                                    <span className={`px-2 py-0.5 text-xs rounded-full uppercase font-bold ${
                                        ad.status === 'active' ? 'bg-green-500/20 text-green-500' : 
                                        ad.status === 'pending' ? 'bg-orange-500/20 text-orange-500' :
                                        ad.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-400'
                                    }`}>{ad.status}</span>
                                </div>
                                <p className="text-sm text-[var(--secondary-text-color)] mb-2">
                                    User: <span className="text-white">{ad.userName}</span> • Type: <span className="capitalize">{ad.adType}</span>
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-[var(--bg-color)] p-2 rounded">
                                    <div>Budget: <span className="font-bold">₹{ad.budget}</span></div>
                                    <div>Spent: <span className="font-bold">₹{ad.spent.toFixed(2)}</span></div>
                                    <div>Views: <span className="font-bold">{ad.stats.views}</span></div>
                                    <div>Clicks: <span className="font-bold">{ad.stats.clicks}</span></div>
                                </div>
                                <div className="mt-2 text-xs text-[var(--secondary-text-color)] truncate">
                                    URL: <a href={ad.contentUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{ad.contentUrl}</a>
                                </div>
                            </div>
                            
                            {ad.status === 'pending' && (
                                <div className="flex flex-row md:flex-col gap-2 justify-center min-w-[120px]">
                                    <button onClick={() => handleStatusChange(ad.id, 'active')} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-bold text-sm">
                                        Approve
                                    </button>
                                    <button onClick={() => handleStatusChange(ad.id, 'rejected')} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-bold text-sm">
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filteredCampaigns.length === 0 && (
                    <p className="text-center text-[var(--secondary-text-color)] py-8">No campaigns found.</p>
                )}
            </div>
        </div>
    );
};

export default AdminAdsPage;