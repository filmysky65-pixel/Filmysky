
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const TelegramFab: React.FC = () => {
    const location = useLocation();
    const [telegramLink, setTelegramLink] = useState<string | null>(null);

    // Direct listener to Firebase to ensure we find the link no matter what
    useEffect(() => {
        const db = firebase.database();
        const settingsRef = db.ref('filmysky/appSettings');

        const listener = settingsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                setTelegramLink(null);
                return;
            }

            // Aggressively search for the link in known paths
            const link = 
                data.socials?.telegram || 
                data.socials?.Telegram || 
                data.telegram || 
                data.Telegram ||
                null;

            setTelegramLink(link);
        });

        return () => settingsRef.off('value', listener);
    }, []);

    // If no link is found in the DB, do not render
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
            className="fixed bottom-32 right-4 md:bottom-8 md:right-8 z-[9999] w-14 h-14 bg-[#229ED9] hover:bg-[#1f8ubc] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#229ED9]/40 transition-all duration-300 hover:scale-110 hover:-rotate-12 group"
            title="Join us on Telegram"
        >
            <i className="fab fa-telegram-plane text-3xl group-hover:animate-pulse"></i>
        </a>
    );
};

export default TelegramFab;
