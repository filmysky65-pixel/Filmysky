import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const Header: React.FC = () => {
    const { appSettings, user, triggerInstallPrompt } = useAppContext();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const logoText = appSettings?.logoText || 'FilmySky';

    const getSocialLink = (platform: 'whatsapp' | 'telegram') => {
        if (!appSettings) return '#';
        if (platform === 'whatsapp') {
            return appSettings.socials?.whatsapp || appSettings.socials?.WhatsApp || appSettings.whatsapp || appSettings.WhatsApp || '#';
        }
        return appSettings.socials?.telegram || appSettings.socials?.Telegram || appSettings.telegram || appSettings.Telegram || '#';
    };

    const whatsappLink = getSocialLink('whatsapp');
    const telegramLink = getSocialLink('telegram');
    const apkLink = appSettings?.apkUrl || 'https://api.telegram.org/file/bot8462496536:AAGfBFDP25OV2uP9lcUJ0PsR4XUWhP02hIU/documents/file_11.apk';

    const navItems = [
        { to: '/', label: 'Home' },
        { to: '/movies', label: 'Movies' },
        { to: '/series', label: 'Series' },
        { to: '/youtube', label: 'YouTube' },
    ];

    return (
        <>
            <header className="fixed left-0 right-0 top-0 z-50 flex h-20 items-center justify-between border-b border-white/10 bg-black px-4 shadow-[0_8px_18px_rgba(0,0,0,0.25)] md:px-6">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-color)] text-lg font-black text-white">▶</span>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">{logoText}</h1>
                </div>

                <div className="flex items-center gap-4 text-white">
                    <button type="button" onClick={() => navigate('/search')} className="text-2xl" aria-label="Search">
                        <i className="fas fa-search" />
                    </button>
                    <button type="button" onClick={() => setIsMenuOpen(true)} className="text-2xl" aria-label="Menu">
                        <i className="fas fa-bars" />
                    </button>
                </div>
            </header>

            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} aria-label="Close menu" />
                    <div className="relative flex h-full w-72 flex-col bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 text-white shadow-2xl">
                        <button type="button" onClick={() => setIsMenuOpen(false)} className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-white" aria-label="Close menu"><i className="fas fa-times" /></button>
                        <div className="mb-8 mt-4"><h2 className="text-3xl font-bold text-white">Menu</h2><p className="mt-1 text-sm text-gray-400">Explore FilmySky</p></div>
                        <div className="flex-grow space-y-3 overflow-y-auto">
                            <div className="space-y-2 border-b border-white/10 pb-4 md:hidden">
                                {navItems.map(item => <Link key={item.to} to={item.to} onClick={() => setIsMenuOpen(false)} className="block rounded-lg bg-white/5 p-3 font-semibold hover:bg-white/10">{item.label}</Link>)}
                            </div>
                            <a href={apkLink} target="_blank" rel="noopener noreferrer" onClick={() => triggerInstallPrompt()} className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-green-600 to-green-500 p-4 shadow-lg">
                                <i className="fab fa-android text-2xl" /><div><h3 className="font-bold">Download App</h3><p className="text-xs text-green-100">Get the best experience</p></div>
                            </a>
                            <div className="grid grid-cols-2 gap-4">
                                {whatsappLink !== '#' && <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center rounded-xl border border-[#25D366]/30 bg-[#25D366]/20 p-4"><i className="fab fa-whatsapp mb-2 text-3xl text-[#25D366]" /><span className="text-sm font-semibold">WhatsApp</span></a>}
                                {telegramLink !== '#' && <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center rounded-xl border border-[#229ED9]/30 bg-[#229ED9]/20 p-4"><i className="fab fa-telegram-plane mb-2 text-3xl text-[#229ED9]" /><span className="text-sm font-semibold">Telegram</span></a>}
                            </div>
                            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 rounded-lg p-3 hover:bg-white/5"><i className="fas fa-envelope w-6 text-center text-gray-400" />Contact Us</Link>
                            <Link to="/privacy" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 rounded-lg p-3 hover:bg-white/5"><i className="fas fa-shield-alt w-6 text-center text-gray-400" />Privacy Policy</Link>
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 rounded-lg p-3 hover:bg-white/5"><i className="fas fa-user w-6 text-center text-gray-400" />My Profile</Link>
                        </div>
                        <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-500">&copy; {new Date().getFullYear()} {logoText}. All rights reserved.</div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
