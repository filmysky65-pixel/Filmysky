
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import IdCard from '../components/IdCard';

const ProfilePage: React.FC = () => {
    const { user, logout, openThemeModal, isAdmin, appSettings } = useAppContext();
    const navigate = useNavigate();

    // Allow guest access - treat !user as guest
    const isGuest = !user || user?.isAnonymous;
    const hasEmail = user ? !!user.email : false;
    const isSubscriptionEnabled = appSettings?.subscriptionStatus !== 'INACTIVE';
    // Default to true if undefined, unless explicitly false
    const isAdPanelEnabled = appSettings?.adConfig?.panelStatus !== false;

    // Helper to get social links safely
    const getSocialLink = (platform: 'whatsapp' | 'telegram') => {
        if (!appSettings) return null;
        if (platform === 'whatsapp') {
            return appSettings.socials?.whatsapp || appSettings.socials?.WhatsApp || appSettings.whatsapp || appSettings.WhatsApp || null;
        }
        if (platform === 'telegram') {
            return appSettings.socials?.telegram || appSettings.socials?.Telegram || appSettings.telegram || appSettings.Telegram || null;
        }
        return null;
    };

    const whatsappLink = getSocialLink('whatsapp');
    const telegramLink = getSocialLink('telegram');

    const menuItems = [
        ...(isAdmin && !isGuest ? [{ icon: 'fa-user-shield', label: 'Admin Panel', action: () => navigate('/admin') }] : []),
        { icon: 'fa-bookmark', label: 'My Watchlist', action: () => navigate('/watchlist') },
        ...(!isGuest && isSubscriptionEnabled ? [{ icon: 'fa-crown', label: 'Subscription', action: () => navigate('/subscription') }] : []),
        ...(!isGuest ? [{ icon: 'fa-paper-plane', label: 'Request Content', action: () => navigate('/request') }] : []),
        ...(!isGuest && hasEmail && isAdPanelEnabled ? [{ icon: 'fa-ad', label: 'Advertise With Us', action: () => navigate('/advertiser-panel') }] : []),
        { icon: 'fa-palette', label: 'Change Theme', action: openThemeModal },
        
        { icon: 'fa-info-circle', label: 'About Us', action: () => navigate('/about') },
        { icon: 'fa-shield-alt', label: 'Privacy Policy', action: () => navigate('/privacy') },
        { icon: 'fa-gavel', label: 'DMCA', action: () => navigate('/dmca') },
        { icon: 'fa-envelope', label: 'Contact Us', action: () => navigate('/contact') },
        ...(!isGuest ? [{ icon: 'fa-sign-out-alt', label: 'Logout', action: logout }] : []),
    ];

    return (
        <div className="p-4 md:max-w-5xl md:mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                    <IdCard />
                </div>
                <div className="space-y-4">
                    {isGuest && (
                        <div className="p-4 bg-[var(--card-bg)] border border-[var(--primary-color)]/50 rounded-lg text-center shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                            <h3 className="font-bold text-lg text-[var(--gold-color)]"><i className="fas fa-crown mr-2"></i>Welcome, VIP Guest</h3>
                            <p className="text-sm text-[var(--secondary-text-color)] mt-1 mb-4">You have access to browse and download movies.</p>
                            <button onClick={() => navigate('/auth')} className="w-full bg-[var(--primary-color)] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                                <i className="fas fa-sign-in-alt"></i>
                                <span>Login to Sync Watchlist</span>
                            </button>
                        </div>
                    )}

                    {/* Social Links Bar */}
                    {(whatsappLink || telegramLink) && (
                        <div className="grid grid-cols-2 gap-4">
                            {whatsappLink && (
                                <button onClick={() => window.open(whatsappLink, '_blank')} className="flex items-center justify-center gap-2 p-3 bg-[#25D366]/10 border border-[#25D366]/50 rounded-lg text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
                                    <i className="fab fa-whatsapp text-xl"></i>
                                    <span className="font-bold">WhatsApp</span>
                                </button>
                            )}
                            {telegramLink && (
                                <button onClick={() => window.open(telegramLink, '_blank')} className="flex items-center justify-center gap-2 p-3 bg-[#229ED9]/10 border border-[#229ED9]/50 rounded-lg text-[#229ED9] hover:bg-[#229ED9]/20 transition-colors">
                                    <i className="fab fa-telegram-plane text-xl"></i>
                                    <span className="font-bold">Telegram</span>
                                </button>
                            )}
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        {menuItems.map(item => (
                            <button 
                                key={item.label}
                                onClick={item.action}
                                className="w-full flex items-center gap-4 p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-left transition-colors hover:border-[var(--primary-color)]"
                            >
                                <i className={`fas ${item.icon} w-6 text-center text-lg text-[var(--primary-color)]`}></i>
                                <span className="font-semibold flex-grow">{item.label}</span>
                                <i className="fas fa-chevron-right ml-auto text-[var(--secondary-text-color)]"></i>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
