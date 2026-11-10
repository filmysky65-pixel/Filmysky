import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const Header: React.FC = () => {
    const { appSettings, user, triggerInstallPrompt } = useAppContext();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const logoText = appSettings?.logoText || 'FilmySky';

    const socialLink = (platform: 'whatsapp' | 'telegram') => {
        if (platform === 'whatsapp') {
            return appSettings?.socials?.whatsapp || appSettings?.socials?.WhatsApp || appSettings?.whatsapp || appSettings?.WhatsApp || '#';
        }
        return appSettings?.socials?.telegram || appSettings?.socials?.Telegram || appSettings?.telegram || appSettings?.Telegram || '#';
    };

    const navItems = [
        { to: '/', label: 'Home' },
        { to: '/movies', label: 'Movies' },
        { to: '/series', label: 'Series' },
        { to: '/youtube', label: 'YouTube' },
    ];
    const apkLink = appSettings?.apkUrl || appSettings?.appDownload?.apkUrl || '#';

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-white/15 bg-[#090909]/95 backdrop-blur-xl">
                <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-7">
                    <Link to="/" className="flex items-center gap-2.5 text-white" aria-label={`${logoText} home`}>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f20d20] text-[19px] shadow-[0_0_16px_rgba(242,13,32,.35)]">
                            <i className="fas fa-play ml-0.5"></i>
                        </span>
                        <span className="text-[27px] font-black uppercase leading-none tracking-[-1.3px] sm:text-[32px]">{logoText}</span>
                    </Link>

                    <nav className="hidden items-center gap-7 md:flex">
                        {navItems.map(item => (
                            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `font-semibold transition-colors ${isActive ? 'text-[#f20d20]' : 'text-white/70 hover:text-white'}`}>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center gap-5 text-[25px] text-[#c2c3cf]">
                        <button onClick={() => navigate('/search')} aria-label="Search" className="transition-colors hover:text-white">
                            <i className="fas fa-search"></i>
                        </button>
                        <button onClick={() => setIsMenuOpen(true)} aria-label="Open menu" className="transition-colors hover:text-white">
                            <i className="fas fa-bars"></i>
                        </button>
                        <Link to="/profile" aria-label="Profile" className="hidden md:block">
                            <i className={`fas fa-user-circle ${user?.isAnonymous ? 'text-white/60' : 'text-[#f20d20]'}`}></i>
                        </Link>
                    </div>
                </div>
            </header>

            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <button aria-label="Close menu" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                    <aside className="relative flex h-full w-72 flex-col bg-[#111118] p-6 text-white shadow-2xl">
                        <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="absolute right-5 top-5 text-xl text-white/60"><i className="fas fa-times"></i></button>
                        <h2 className="mb-1 mt-6 text-2xl font-black">Explore {logoText}</h2>
                        <div className="mt-6 space-y-2">
                            {navItems.map(item => <Link key={item.to} to={item.to} onClick={() => setIsMenuOpen(false)} className="block rounded-xl bg-white/[0.05] p-3 font-semibold hover:bg-white/10">{item.label}</Link>)}
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block rounded-xl bg-white/[0.05] p-3 font-semibold hover:bg-white/10">My Profile</Link>
                            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block rounded-xl bg-white/[0.05] p-3 font-semibold hover:bg-white/10">Contact Us</Link>
                        </div>
                        {apkLink !== '#' && <a href={apkLink} target="_blank" rel="noopener noreferrer" onClick={() => triggerInstallPrompt()} className="mt-5 flex items-center gap-3 rounded-xl bg-green-600 p-4 font-bold"><i className="fab fa-android text-2xl"></i>Download App</a>}
                        <div className="mt-4 flex gap-3">
                            {socialLink('telegram') !== '#' && <a href={socialLink('telegram')} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-[#229ED9]/15 p-3 text-center text-sm font-semibold text-[#45b9f4]">Telegram</a>}
                            {socialLink('whatsapp') !== '#' && <a href={socialLink('whatsapp')} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-[#25D366]/15 p-3 text-center text-sm font-semibold text-[#25D366]">WhatsApp</a>}
                        </div>
                        <div className="mt-auto border-t border-white/10 pt-5 text-center text-xs text-white/40">&copy; {new Date().getFullYear()} {logoText}</div>
                    </aside>
                </div>
            )}
        </>
    );
};

export default Header;
