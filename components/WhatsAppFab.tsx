import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const WhatsAppFab: React.FC = () => {
    const location = useLocation();
    const { appSettings } = useAppContext();
    const configuredLink =
        appSettings?.socials?.whatsapp ||
        appSettings?.socials?.WhatsApp ||
        (appSettings as any)?.whatsapp ||
        (appSettings as any)?.WhatsApp ||
        '';
    const whatsappLink = typeof configuredLink === 'string' ? configuredLink.trim() : '';

    if (!whatsappLink) return null;

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
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group fixed bottom-[7rem] right-4 z-[45] flex flex-col items-center gap-1 text-white transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] md:bottom-8 md:right-8"
            title="Join us on WhatsApp"
            aria-label="Join us on WhatsApp"
        >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#05d465] text-white shadow-xl shadow-[#05d465]/40 transition-colors group-hover:bg-[#04bb59]">
                <svg className="h-9 w-9 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.891-11.893 11.891-1.99-.001-3.951-.5-5.688-1.448L0 24zm6.597-3.807c1.676.995 3.276 1.591 5.395 1.592 5.448 0 9.886-4.434 9.889-9.883.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.89 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.74-.983zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.471-.149-.669.149-.198.297-.768.967-.942 1.166-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.298.297-.496.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.917-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.793.372s-1.041 1.017-1.041 2.479 1.066 2.876 1.215 3.074c.149.198 2.097 3.202 5.078 4.488.709.306 1.263.489 1.695.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.174-1.413z" />
                </svg>
            </span>
            <span className="text-sm font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">WhatsApp</span>
        </a>
    );
};

export default WhatsAppFab;
