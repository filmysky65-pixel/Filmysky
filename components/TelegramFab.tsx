import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const TelegramFab: React.FC = () => {
    const location = useLocation();
    const { appSettings } = useAppContext();

    // Only get the link from admin settings - NO hardcoded fallback
    const rawLink = 
        appSettings?.socials?.telegram || 
        appSettings?.socials?.Telegram || 
        (appSettings as any)?.telegram || 
        (appSettings as any)?.Telegram ||
        '';

    const telegramLink = rawLink.trim();

    // If no link is configured by admin, do NOT show the floating button
    if (!telegramLink) return null;

    const path = location.pathname;
    
    // Determine where NOT to show the FAB (Hidden on Player, Auth, Admin)
    const isHidden = 
        path.startsWith('/player/') || 
        (path.startsWith('/livetv/') && path.split('/').length > 3) || 
        path === '/ad' || 
        path === '/auth' ||
        path.startsWith('/admin');

    if (isHidden) return null;

    return (
        <a 
            href={telegramLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-[10.5rem] right-4 md:bottom-28 md:right-8 z-50 flex flex-col items-center justify-center group select-none transition-transform duration-300 hover:scale-105"
            title="Join us on Telegram"
            aria-label="Join us on Telegram"
        >
            <div className="w-13 h-13 md:w-14 md:h-14 bg-[#229ED9] hover:bg-[#1c8ec4] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#229ED9]/40 transition-all duration-300 group-hover:shadow-[#229ED9]/60">
                <i className="fab fa-telegram-plane text-2xl md:text-3xl"></i>
            </div>
            <span className="mt-0.5 text-[11px] font-semibold text-white tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                Telegram
            </span>
        </a>
    );
};

export default TelegramFab;
