

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { getUserWallet, getAdvertiserCampaigns, createAdCampaign, toggleAdStatus } from '../services/firebaseService';
import { AdCampaign, WalletTransaction } from '../types';

const AdvertiserPanelPage: React.FC = () => {
    const { user, appSettings } = useAppContext();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'ads' | 'wallet'>('dashboard');
    
    // Data States
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Form State
    const [newAd, setNewAd] = useState<Partial<AdCampaign>>({
        adType: 'interstitial',
        subType: 'website',
        duration: 15,
        targetCategory: 'All',
        budget: 0
    });
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [walletAmountInput, setWalletAmountInput] = useState<string>('');

    useEffect(() => {
        if (!user || user.isAnonymous) {
            navigate('/auth');
            return;
        }

        let isMounted = true;
        let unsubscribe: (() => void) | undefined;

        const fetchData = async () => {
            try {
                const walletData = await getUserWallet(user.id);
                if (isMounted) {
                    setBalance(walletData.balance);
                    setTransactions(walletData.transactions);
                    
                    unsubscribe = getAdvertiserCampaigns(user.id, (ads) => {
                        if (isMounted) {
                            setCampaigns(ads);
                            setLoading(false);
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to fetch advertiser data", error);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            if (unsubscribe) unsubscribe();
        };
    }, [user, navigate]);

    // Helpers
    const getSelectedConfig = () => {
        const config = appSettings?.adConfig;
        if (!config) return { cpm: 0, cpc: 0, minBudget: 50 };

        let typeKey: 'youtube' | 'website' | 'video' = 'website';
        if (newAd.adType === 'video') typeKey = 'video';
        else if (newAd.subType === 'youtube') typeKey = 'youtube';

        const durationKey = (newAd.duration || 15).toString() as '15'|'30'|'45'|'59';
        // Backward compatibility safe access
        const typeRates = config.rates[typeKey];
        let cpmRate = 0;
        
        if (typeRates && typeRates.cpm) {
             // Check if cpm is object (new structure) or number (old structure)
             if (typeof typeRates.cpm === 'number') {
                 cpmRate = typeRates.cpm;
             } else {
                 cpmRate = typeRates.cpm[durationKey] || 50;
             }
        }

        return {
            cpm: cpmRate,
            cpc: config.rates[typeKey].cpc,
            minBudget: config.minBudgets[typeKey]
        };
    };

    const { cpm, cpc, minBudget } = getSelectedConfig();
    // Per unit cost
    const costPerView = cpm / 1000; 
    // const costPerClick = cpc / 1000;

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const isYoutubeInterstitial = newAd.adType === 'interstitial' && newAd.subType === 'youtube';

        // Validation logic
        if (!newAd.name || !newAd.budget) {
            alert("Please fill name and budget fields.");
            return;
        }

        // Specific validation based on type
        if (isYoutubeInterstitial) {
            if (!youtubeUrl) {
                alert("Please enter a YouTube URL");
                return;
            }
        } else {
            if (!newAd.contentUrl) {
                alert("Please enter the Content URL");
                return;
            }
        }
        
        if (!user.role && (newAd.budget || 0) < minBudget) { 
            alert(`Minimum budget for this ad type is ₹${minBudget}.`);
            return;
        }

        let finalContentUrl = newAd.contentUrl;

        if (isYoutubeInterstitial) {
             // Convert youtube URL
             const videoIdMatch = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
             if (!videoIdMatch) {
                 alert("Invalid YouTube URL");
                 return;
             }
             // Embed URL with Autoplay, Mute (required for autoplay). Simplified as requested.
             finalContentUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&mute=1`;
        }

        const res = await createAdCampaign({
            ...newAd as any,
            contentUrl: finalContentUrl,
            userId: user.id,
            userName: user.name,
            costPerView: costPerView,
            costPerClick: cpc / 1000
        });

        if (res.success) {
            alert(res.message);
            setActiveTab('ads');
            setNewAd({ adType: 'interstitial', subType: 'website', duration: 15, targetCategory: 'All', budget: 0 });
            setYoutubeUrl('');
        } else {
            alert(res.message);
        }
    };

    const handleAddMoney = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(walletAmountInput);
        const minAmount = appSettings?.minAddMoney || 50;
        if (!amount || amount < minAmount) {
            alert(`Minimum amount is ₹${minAmount}`);
            return;
        }
        navigate('/payment', { state: { mode: 'wallet', amount: amount } });
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i></div>;

    const stats = {
        active: campaigns.filter(c => c.status === 'active').length,
        totalViews: campaigns.reduce((acc, c) => acc + (c.stats.views || 0), 0),
        totalClicks: campaigns.reduce((acc, c) => acc + (c.stats.clicks || 0), 0),
        totalSpent: campaigns.reduce((acc, c) => acc + (c.spent || 0), 0)
    };

    const minAdd = appSettings?.minAddMoney || 50;

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg-color)]">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-[var(--card-bg)] border-r border-[var(--border-color)] p-4 flex-col flex-shrink-0">
                <div className="mb-8 flex items-center gap-2 font-bold text-xl">
                    <i className="fas fa-bullhorn text-[var(--primary-color)]"></i> 
                    <span>Ad Manager</span>
                </div>
                <nav className="space-y-2">
                    <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'dashboard' ? 'bg-[var(--primary-color)] text-white' : 'hover:bg-white/5'}`}>
                        <i className="fas fa-tachometer-alt w-5 text-center"></i> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('create')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'create' ? 'bg-[var(--primary-color)] text-white' : 'hover:bg-white/5'}`}>
                        <i className="fas fa-plus-circle w-5 text-center"></i> Create Ad
                    </button>
                    <button onClick={() => setActiveTab('ads')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'ads' ? 'bg-[var(--primary-color)] text-white' : 'hover:bg-white/5'}`}>
                        <i className="fas fa-list w-5 text-center"></i> My Ads
                    </button>
                    <button onClick={() => setActiveTab('wallet')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'wallet' ? 'bg-[var(--primary-color)] text-white' : 'hover:bg-white/5'}`}>
                        <i className="fas fa-wallet w-5 text-center"></i> Wallet
                    </button>
                </nav>
                <button onClick={() => navigate('/profile')} className="mt-auto w-full text-left p-3 rounded-lg flex items-center gap-3 hover:bg-white/5 text-[var(--secondary-text-color)]">
                    <i className="fas fa-arrow-left w-5 text-center"></i> Back to App
                </button>
            </aside>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--card-bg)] border-t border-[var(--border-color)] flex justify-around items-center h-16 z-50 px-2 pb-safe">
                <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'dashboard' ? 'text-[var(--primary-color)]' : 'text-gray-400'}`}>
                    <i className="fas fa-tachometer-alt text-lg mb-1"></i> <span className="text-[10px]">Home</span>
                </button>
                <button onClick={() => setActiveTab('create')} className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'create' ? 'text-[var(--primary-color)]' : 'text-gray-400'}`}>
                    <i className="fas fa-plus-circle text-lg mb-1"></i> <span className="text-[10px]">Create</span>
                </button>
                <button onClick={() => setActiveTab('ads')} className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'ads' ? 'text-[var(--primary-color)]' : 'text-gray-400'}`}>
                    <i className="fas fa-list text-lg mb-1"></i> <span className="text-[10px]">Ads</span>
                </button>
                <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'wallet' ? 'text-[var(--primary-color)]' : 'text-gray-400'}`}>
                    <i className="fas fa-wallet text-lg mb-1"></i> <span className="text-[10px]">Wallet</span>
                </button>
                 <button onClick={() => navigate('/profile')} className={`flex flex-col items-center justify-center w-full h-full text-gray-400`}>
                    <i className="fas fa-sign-out-alt text-lg mb-1"></i> <span className="text-[10px]">Exit</span>
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-8 overflow-y-auto h-screen pb-20 md:pb-8 no-scrollbar">
                
                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
                        <h2 className="text-2xl font-bold">Advertiser Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Wallet */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-transform">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-blue-100 text-sm mb-1 uppercase tracking-wider">Wallet Balance</p>
                                        <h3 className="text-3xl font-bold">{user?.role ? '∞ Admin' : `₹${balance.toFixed(2)}`}</h3>
                                    </div>
                                    <i className="fas fa-wallet text-3xl opacity-50"></i>
                                </div>
                                {!user?.role && (
                                    <button onClick={() => setActiveTab('wallet')} className="mt-4 text-xs bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 font-semibold backdrop-blur-md">
                                        + Add Money
                                    </button>
                                )}
                            </div>
                            
                            {/* Active Campaigns */}
                            <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[var(--secondary-text-color)] text-sm mb-1 uppercase tracking-wider">Active Ads</p>
                                        <h3 className="text-3xl font-bold text-[var(--primary-color)]">{stats.active}</h3>
                                    </div>
                                    <i className="fas fa-bullhorn text-3xl text-[var(--primary-color)] opacity-20"></i>
                                </div>
                            </div>

                            {/* Total Views */}
                            <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[var(--secondary-text-color)] text-sm mb-1 uppercase tracking-wider">Total Views</p>
                                        <h3 className="text-3xl font-bold text-blue-400">{stats.totalViews}</h3>
                                    </div>
                                    <i className="fas fa-eye text-3xl text-blue-400 opacity-20"></i>
                                </div>
                            </div>

                            {/* Total Clicks */}
                            <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[var(--secondary-text-color)] text-sm mb-1 uppercase tracking-wider">Total Clicks</p>
                                        <h3 className="text-3xl font-bold text-green-400">{stats.totalClicks}</h3>
                                    </div>
                                    <i className="fas fa-mouse-pointer text-3xl text-green-400 opacity-20"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CREATE AD TAB */}
                {activeTab === 'create' && (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6">Create Campaign</h2>
                        <form onSubmit={handleCreateSubmit} className="space-y-6 bg-[var(--card-bg)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-xl">
                            <div>
                                <label className="block mb-2 font-semibold text-sm uppercase text-[var(--secondary-text-color)]">Campaign Name</label>
                                <input className="w-full p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)] focus:border-[var(--primary-color)] outline-none transition-colors" value={newAd.name || ''} onChange={e => setNewAd({...newAd, name: e.target.value})} placeholder="e.g. Winter Sale Promo" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block mb-2 font-semibold text-sm uppercase text-[var(--secondary-text-color)]">Ad Type</label>
                                    <select className="w-full p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)] focus:border-[var(--primary-color)] outline-none" value={newAd.adType} onChange={e => setNewAd({...newAd, adType: e.target.value as any, subType: 'website'})}>
                                        <option value="interstitial">Interstitial (Full Screen)</option>
                                        <option value="video">Video (Pre-roll)</option>
                                    </select>
                                </div>
                                {newAd.adType === 'interstitial' && (
                                     <div>
                                        <label className="block mb-2 font-semibold text-sm uppercase text-[var(--secondary-text-color)]">Content Source</label>
                                        <select className="w-full p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)] focus:border-[var(--primary-color)] outline-none" value={newAd.subType} onChange={e => setNewAd({...newAd, subType: e.target.value as any})}>
                                            <option value="website">Website URL</option>
                                            <option value="youtube">YouTube Video</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block mb-2 font-semibold text-sm uppercase text-[var(--secondary-text-color)]">Duration (Sec)</label>
                                    <select className="w-full p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)] focus:border-[var(--primary-color)] outline-none" value={newAd.duration} onChange={e => setNewAd({...newAd, duration: Number(e.target.value) as any})}>
                                        <option value="15">15 Seconds</option>
                                        <option value="30">30 Seconds</option>
                                        <option value="45">45 Seconds</option>
                                        <option value="59">59 Seconds</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold text-sm uppercase text-[var(--secondary-text-color)]">Target Category</label>
                                    <select className="w-full p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)] focus:border-[var(--primary-color)] outline-none" value={newAd.targetCategory} onChange={e => setNewAd({...newAd, targetCategory: e.target.value})}>
                                        <option value="All">All Categories</option>
                                        <option value="Bollywood">Bollywood</option>
                                        <option value="Hollywood">Hollywood</option>
                                        <option value="Web Series">Web Series</option>
                                        <option value="South Indian">South Indian</option>
                                    </select>
                                </div>
                            </div>

                            {newAd.subType === 'youtube' && newAd.adType === 'interstitial' ? (
                                <div>
                                    <label className="block mb-2 font-semibold text-sm uppercase text-[var(--secondary-text-color)]">YouTube Video URL</label>
                                    <input className="w-full p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                                </div>
                            ) : (
                                <div>
                                    <label className="block mb-2 font-semibold text-sm uppercase text-[var(--secondary-text-color)]">{newAd.adType === 'interstitial' ? 'Website URL' : 'Video Source URL (MP4/MKV)'}</label>
                                    <input className="w-full p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]" value={newAd.contentUrl || ''} onChange={e => setNewAd({...newAd, contentUrl: e.target.value})} placeholder="https://..." required={newAd.subType !== 'youtube'} />
                                </div>
                            )}

                             {((newAd.adType === 'interstitial' && newAd.subType === 'website') || newAd.adType === 'video') && (
                                <div>
                                    <label className="block mb-2 font-semibold text-sm uppercase text-[var(--secondary-text-color)]">Target Link (On Click)</label>
                                    <input className="w-full p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]" value={newAd.targetUrl || ''} onChange={e => setNewAd({...newAd, targetUrl: e.target.value})} placeholder="https://..." />
                                </div>
                            )}

                            <div>
                                <label className="block mb-2 font-semibold text-sm uppercase text-[var(--secondary-text-color)]">Total Budget (₹)</label>
                                <input type="number" min={user?.role ? 0 : minBudget} className="w-full p-4 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]" value={newAd.budget || ''} onChange={e => setNewAd({...newAd, budget: Number(e.target.value)})} placeholder={user?.role ? "Set budget" : `Min ₹${minBudget} (Deducted from wallet)`} required />
                                {!user?.role && <p className="text-xs text-[var(--secondary-text-color)] mt-1">Budget will be deducted immediately.</p>}
                            </div>

                            {/* COST CALCULATOR */}
                            <div className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                                <h4 className="font-bold mb-2 flex items-center gap-2"><i className="fas fa-calculator text-[var(--primary-color)]"></i> Estimated Rates</h4>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Rate (CPM for {newAd.duration}s):</span>
                                    <span className="font-mono">₹{cpm} <span className="text-xs text-gray-500">/ 1000 views</span></span>
                                </div>
                                <div className="flex justify-between text-sm mb-1 border-b border-[var(--border-color)] pb-1">
                                    <span>Per Single View Cost:</span>
                                    <span className="font-mono">₹{costPerView.toFixed(3)}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span>Est. Views (Budget/Cost):</span>
                                    <span className="font-mono text-[var(--primary-color)]">~{Math.floor((newAd.budget || 0) / costPerView)}</span>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-[var(--primary-color)] text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                                {user?.role ? 'Create Admin Campaign' : 'Submit for Approval'}
                            </button>
                        </form>
                    </div>
                )}

                {/* MY ADS TAB */}
                {activeTab === 'ads' && (
                    <div className="space-y-4 max-w-4xl mx-auto animate-fade-in">
                        <h2 className="text-2xl font-bold mb-4">My Campaigns</h2>
                        {campaigns.length === 0 ? <p className="text-[var(--secondary-text-color)]">No campaigns yet.</p> : campaigns.map(ad => (
                            <div key={ad.id} className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center gap-6 shadow-md">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center justify-between md:justify-start gap-3 mb-2">
                                        <h3 className="font-bold text-lg">{ad.name}</h3>
                                        <span className={`px-2 py-0.5 text-xs rounded-full uppercase font-bold ${
                                            ad.status === 'active' ? 'bg-green-500/20 text-green-500' : 
                                            ad.status === 'pending' ? 'bg-orange-500/20 text-orange-500' :
                                            ad.status === 'paused' ? 'bg-yellow-500/20 text-yellow-500' : 
                                            ad.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 
                                            'bg-gray-500/20 text-gray-400'}`
                                        }>
                                            {ad.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--secondary-text-color)] capitalize flex gap-4">
                                        <span><i className="fas fa-video mr-1"></i> {ad.adType}</span>
                                        <span><i className="fas fa-clock mr-1"></i> {ad.duration}s</span>
                                        <span><i className="fas fa-tag mr-1"></i> {ad.targetCategory}</span>
                                    </p>
                                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm bg-[var(--bg-color)] p-3 rounded-lg">
                                        <div>
                                            <p className="text-[var(--secondary-text-color)] text-xs">Views / Clicks</p>
                                            <p className="font-bold">{ad.stats.views} / {ad.stats.clicks || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[var(--secondary-text-color)] text-xs">Spent / Budget</p>
                                            <p className="font-bold font-mono">₹{ad.spent.toFixed(2)} / ₹{ad.budget}</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-[var(--bg-color)] rounded-full mt-3 overflow-hidden">
                                        <div style={{width: `${Math.min(100, (ad.spent/ad.budget)*100)}%`}} className="h-full bg-[var(--primary-color)] transition-all duration-500"></div>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    {ad.status !== 'completed' && ad.status !== 'rejected' && ad.status !== 'pending' && (
                                        <button onClick={() => toggleAdStatus(ad.id, ad.status)} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-colors ${ad.status === 'active' ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}>
                                            {ad.status === 'active' ? 'Pause' : 'Resume'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* WALLET TAB */}
                {activeTab === 'wallet' && (
                    <div className="max-w-xl mx-auto animate-fade-in">
                        <div className="bg-[var(--card-bg)] p-8 rounded-2xl border border-[var(--border-color)] text-center mb-8 shadow-xl">
                            <p className="text-[var(--secondary-text-color)] uppercase tracking-widest text-xs font-bold mb-3">Current Balance</p>
                            <h2 className="text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{user?.role ? '∞ Admin' : `₹${balance.toFixed(2)}`}</h2>
                            
                            {!user?.role && (
                                <>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {[500, 1000, 2000, 5000].map(amt => (
                                        <button key={amt} onClick={() => setWalletAmountInput(amt.toString())} className="px-4 py-3 border border-[var(--border-color)] rounded-xl hover:border-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-all font-semibold">
                                            +₹{amt}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                                    <p className="text-sm text-[var(--secondary-text-color)] mb-3">Enter Amount (Min ₹{minAdd}):</p>
                                    <form onSubmit={handleAddMoney} className="flex gap-2 justify-center">
                                        <input 
                                            name="amt" 
                                            type="number" 
                                            min={minAdd} 
                                            placeholder="Amount" 
                                            value={walletAmountInput}
                                            onChange={(e) => setWalletAmountInput(e.target.value)}
                                            className="p-3 w-32 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)] outline-none focus:border-[var(--primary-color)]" 
                                            required 
                                        />
                                        <button type="submit" className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20">Add</button>
                                    </form>
                                </div>
                                </>
                            )}
                        </div>
                        
                        <h3 className="font-bold text-lg mb-4">Transaction History</h3>
                        <div className="space-y-3">
                            {transactions.length === 0 ? <p className="text-[var(--secondary-text-color)] text-center py-4">No transactions yet.</p> : transactions.map(txn => (
                                <div key={txn.id} className="flex justify-between items-center p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] hover:border-[var(--primary-color)] transition-colors">
                                    <div>
                                        <p className="font-semibold text-sm">{txn.description}</p>
                                        <p className="text-xs text-[var(--secondary-text-color)] mt-0.5">{new Date(txn.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className={`font-bold font-mono text-lg ${txn.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AdvertiserPanelPage;