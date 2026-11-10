import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        if (platform === 'telegram') {
            return appSettings.socials?.telegram || appSettings.socials?.Telegram || appSettings.telegram || appSettings.Telegram || '#';
        }
        return '#';
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
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#090909]/95 backdrop-blur-md border-b border-white/10">
                <div className="mx-auto max-w-[430px] px-3">
                    <div className="flex items-center justify-between px-1 pt-2 text-[10px] font-medium text-white/80">
                        <span>9:43</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[8px]">◔</span>
                            <span>NR</span>
                            <span>5G</span>
                            <span>88%</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1 pb-3 pt-1">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff2a2a] text-[20px] leading-none text-white shadow-[0_0_16px_rgba(255,42,42,0.55)]">
                                <span className="translate-x-[1px]">▶</span>
                            </div>
                            <Link to="/" className="text-[2.05rem] font-black tracking-[-0.08em] text-white uppercase leading-none">
                                FILMYSKY
                            </Link>
                        </div>

                        <div className="flex items-center gap-4 text-2xl text-white/90">
                            <button onClick={() => navigate('/search')} aria-label="Search" className="flex h-8 w-8 items-center justify-center">
                                <span>⌕</span>
                            </button>
                            <button onClick={() => setIsMenuOpen(true)} aria-label="Menu" className="flex h-8 w-8 items-center justify-center text-3xl leading-none">
                                <span>☰</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />

                    <div className="relative h-full w-64 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 text-white shadow-2xl">
                        <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white">
                            <i className="fas fa-times"></i>
                        </button>

                        <div className="mb-8 mt-4">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-purple-500 bg-clip-text text-transparent">Menu</h2>
                            <p className="mt-1 text-sm text-gray-400">Explore FilmySky</p>
                        </div>

                        <div className="flex-grow space-y-4 overflow-y-auto">
                            <div className="space-y-2 border-b border-white/10 pb-4 md:hidden">
                                {navItems.map(item => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
                                    >
                                        <span className="font-semibold">{item.label}</span>
                                    </Link>
                                ))}
                            </div>

                            <a
                                href={apkLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => triggerInstallPrompt()}
                                className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-green-600 to-green-500 p-4 shadow-lg transition-transform hover:scale-[1.02]"
                            >
                                <i className="fab fa-android text-2xl"></i>
                                <div>
                                    <h3 className="font-bold">Download App</h3>
                                    <p className="text-xs text-green-100">Get the best experience</p>
                                </div>
                            </a>

                            <div className="grid grid-cols-2 gap-4">
                                {whatsappLink !== '#' && (
                                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center rounded-xl border border-[#25D366]/30 bg-[#25D366]/20 p-4">
                                        <i className="fab fa-whatsapp mb-2 text-3xl text-[#25D366]"></i>
                                        <span className="text-sm font-semibold">WhatsApp</span>
                                    </a>
                                )}
                                {telegramLink !== '#' && (
                                    <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center rounded-xl border border-[#229ED9]/30 bg-[#229ED9]/20 p-4">
                                        <i className="fab fa-telegram-plane mb-2 text-3xl text-[#229ED9]"></i>
                                        <span className="text-sm font-semibold">Telegram</span>
                                    </a>
                                )}
                            </div>

                            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-white/5">
                                <i className="fas fa-envelope w-6 text-center text-gray-400"></i>
                                <span className="font-medium">Contact Us</span>
                            </Link>

                            <Link to="/privacy" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-white/5">
                                <i className="fas fa-shield-alt w-6 text-center text-gray-400"></i>
                                <span className="font-medium">Privacy Policy</span>
                            </Link>

                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-white/5">
                                <i className="fas fa-user w-6 text-center text-gray-400"></i>
                                <span className="font-medium">My Profile</span>
                            </Link>
                        </div>

                        <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-500">
                            &copy; {new Date().getFullYear()} {logoText}. All rights reserved.
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;

