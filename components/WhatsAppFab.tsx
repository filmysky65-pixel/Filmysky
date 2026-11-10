import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const DEFAULT_WHATSAPP_LINK = 'https://whatsapp.com/channel/0029VbC9I3dF1YlU9IrTS01h';

const WhatsAppFab: React.FC = () => {
    const location = useLocation();
    const { appSettings } = useAppContext();
    const [whatsappLink, setWhatsappLink] = useState<string>(() => {
        return (
            appSettings?.socials?.whatsapp || 
            appSettings?.socials?.WhatsApp || 
            appSettings?.whatsapp || 
            appSettings?.WhatsApp ||
            DEFAULT_WHATSAPP_LINK
        );
    });

    useEffect(() => {
        if (appSettings) {
            const link = 
                appSettings.socials?.whatsapp || 
                appSettings.socials?.WhatsApp || 
                appSettings.whatsapp || 
                appSettings.WhatsApp;
            if (link) {
                setWhatsappLink(link);
                return;
            }
        }

        const db = firebase.database();
        const settingsRef = db.ref('filmysky/appSettings');

        const listener = settingsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            const link = 
                data.socials?.whatsapp || 
                data.socials?.WhatsApp || 
                data.whatsapp || 
                data.WhatsApp;

            if (link) {
                setWhatsappLink(link);
            }
        });

        return () => settingsRef.off('value', listener);
    }, [appSettings]);

    const path = location.pathname;
    
    // Hidden on specific pages (player, auth, admin, etc.)
    const isHidden = 
        path.startsWith('/player/') || 
        (path.startsWith('/livetv/') && path.split('/').length > 3) || 
        path === '/ad' || 
        path === '/auth' ||
        path.startsWith('/admin');

    if (isHidden) return null;

    return (
        <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-[6.5rem] right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-center justify-center group select-none transition-transform duration-300 hover:scale-105"
            title="Join us on WhatsApp"
            aria-label="Join us on WhatsApp"
        >
            <div className="w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/40 transition-all duration-300 group-hover:shadow-[#25D366]/60">
                <svg 
                    className="w-8 h-8 fill-white" 
                    viewBox="0 0 24 24" 
                    aria-hidden="true"
                >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
            </div>
            <span className="mt-1 text-xs font-semibold text-white tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                WhatsApp
            </span>
        </a>
    );
};

export default WhatsAppFab;
