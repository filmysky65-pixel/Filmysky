
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const Header: React.FC = () => {
    const { appSettings, user, triggerInstallPrompt } = useAppContext();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const logoText = appSettings?.logoText || 'FilmySky';

    // Helper to get social links safely
    const getSocialLink = (platform: 'whatsapp' | 'telegram') => {
        if (!appSettings) return '#';
        // Handle various casing/nesting seen in FABs
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
    const apkLink = appSettings?.apkUrl || "https://api.telegram.org/file/bot8462496536:AAGfBFDP25OV2uP9lcUJ0PsR4XUWhP02hIU/documents/file_11.apk";

    const navItems = [
        { to: '/', label: 'Home' },
        { to: '/movies', label: 'Movies' },
        { to: '/series', label: 'Series' },
        { to: '/youtube', label: 'YouTube' },
    ];

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--card-bg)]/80 backdrop-blur-lg border-b border-[var(--border-color)] flex justify-between items-center px-4 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-2xl font-bold text-[var(--text-color)] uppercase flex items-center">
                        <i className="fas fa-play-circle text-[var(--primary-color)] mr-2 text-xl"></i>
                        {logoText}
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `font-semibold transition-colors ${
                                    isActive ? 'text-[var(--primary-color)]' : 'text-[var(--secondary-text-color)] hover:text-[var(--text-color)]'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/search')} className="text-xl text-[var(--secondary-text-color)] hover:text-[var(--text-color)]">
                        <i className="fas fa-search"></i>
                    </button>
                    
                    {/* Desktop Menu Button (Right Side) */}
                    <button onClick={() => setIsMenuOpen(true)} className="text-xl text-[var(--secondary-text-color)] hover:text-[var(--text-color)]">
                         <i className="fas fa-bars"></i>
                    </button>

                    <Link to="/profile" className="hidden md:block">
                        <div className="w-9 h-9 bg-[var(--border-color)] rounded-full flex items-center justify-center">
                            <i className={`fas fa-user ${user?.isAnonymous ? 'text-[var(--secondary-text-color)]' : 'text-[var(--primary-color)]'}`}></i>
                        </div>
                    </Link>
                </div>
            </header>

            {/* Premium Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                    
                    {/* Drawer */}
                    <div className="relative w-64 h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white shadow-2xl p-6 flex flex-col transform transition-transform duration-300 animate-slideInRight border-l border-white/10">
                        <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white">
                            <i className="fas fa-times"></i>
                        </button>

                        <div className="mb-8 mt-4">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-purple-500 bg-clip-text text-transparent">Menu</h2>
                            <p className="text-gray-400 text-sm mt-1">Explore FilmySky</p>
                        </div>

                        <div className="space-y-4 flex-grow overflow-y-auto">
                             {/* Navigation Links for Mobile */}
                             <div className="md:hidden space-y-2 mb-6 border-b border-white/10 pb-4">
                                {navItems.map(item => (
                                    <Link 
                                        key={item.to} 
                                        to={item.to} 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
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
                                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-600 to-green-500 shadow-lg transform hover:scale-[1.02] transition-transform"
                            >
                                <i className="fab fa-android text-2xl"></i>
                                <div>
                                    <h3 className="font-bold">Download App</h3>
                                    <p className="text-xs text-green-100">Get the best experience</p>
                                </div>
                            </a>

                            <div className="grid grid-cols-2 gap-4">
                                {whatsappLink !== '#' && (
                                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 hover:bg-[#25D366]/30 transition-colors">
                                        <i className="fab fa-whatsapp text-3xl text-[#25D366] mb-2"></i>
                                        <span className="font-semibold text-sm">WhatsApp</span>
                                    </a>
                                )}
                                {telegramLink !== '#' && (
                                    <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#229ED9]/20 border border-[#229ED9]/50 hover:bg-[#229ED9]/30 transition-colors">
                                        <i className="fab fa-telegram-plane text-3xl text-[#229ED9] mb-2"></i>
                                        <span className="font-semibold text-sm">Telegram</span>
                                    </a>
                                )}
                            </div>

                            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <i className="fas fa-envelope text-gray-400 w-6 text-center"></i>
                                <span className="font-medium">Contact Us</span>
                            </Link>
                            
                            <Link to="/privacy" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <i className="fas fa-shield-alt text-gray-400 w-6 text-center"></i>
                                <span className="font-medium">Privacy Policy</span>
                            </Link>

                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <i className="fas fa-user text-gray-400 w-6 text-center"></i>
                                <span className="font-medium">My Profile</span>
                            </Link>
                        </div>
                        
                        <div className="pt-6 border-t border-white/10 text-center text-gray-500 text-xs">
                            &copy; {new Date().getFullYear()} {logoText}. All rights reserved.
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
