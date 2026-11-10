import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const TelegramFab: React.FC = () => {
    const location = useLocation();
    const { appSettings } = useAppContext();
    const configuredLink =
        appSettings?.socials?.telegram ||
        appSettings?.socials?.Telegram ||
        (appSettings as any)?.telegram ||
        (appSettings as any)?.Telegram ||
        '';
    const rawLink = typeof configuredLink === 'string' ? configuredLink.trim() : '';

    if (!rawLink) return null;

    const telegramLink = /^https?:\/\//i.test(rawLink)
        ? rawLink
        : `https://t.me/${rawLink.replace(/^@/, '').replace(/^t\.me\//i, '').replace(/^\/+/, '')}`;
    const path = location.pathname;
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
            className="group fixed bottom-[10.5rem] right-4 z-[60] flex flex-col items-center gap-1 text-white transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#229ED9] md:bottom-28 md:right-8"
            title="Join us on Telegram"
            aria-label="Join us on Telegram"
        >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-xl shadow-[#229ED9]/40 transition-colors group-hover:bg-[#1c8ec4] group-hover:shadow-[#229ED9]/60">
                <i className="fab fa-telegram-plane text-3xl" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">Telegram</span>
        </a>
    );
};

export default TelegramFab;
