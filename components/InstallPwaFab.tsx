import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const InstallPwaFab: React.FC = () => {
    const { deferredPrompt, triggerInstallPrompt, appSettings } = useAppContext();
    const location = useLocation();
    const [isDownloaded, setIsDownloaded] = useState<boolean>(() => {
        try {
            return localStorage.getItem('filmysky_app_downloaded') === 'true' ||
                (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches);
        } catch {
            return false;
        }
    });
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const handleAppInstalled = () => {
            try { localStorage.setItem('filmysky_app_downloaded', 'true'); } catch {}
            setIsDownloaded(true);
        };
        window.addEventListener('appinstalled', handleAppInstalled);
        return () => window.removeEventListener('appinstalled', handleAppInstalled);
    }, []);

    if (isDownloaded || isDismissed) return null;
    const apkUrl = appSettings?.apkUrl?.trim() || appSettings?.appDownload?.apkUrl?.trim() || '';
    if (!deferredPrompt && !apkUrl) return null;

    const path = location.pathname;
    const isHidden = path.startsWith('/player/') ||
        (path.startsWith('/livetv/') && path.split('/').length > 3) ||
        path === '/ad' || path === '/auth' || path.startsWith('/admin');
    if (isHidden) return null;

    const handleDownloadApp = async () => {
        try {
            if (deferredPrompt) {
                await triggerInstallPrompt();
            } else if (apkUrl) {
                const link = document.createElement('a');
                link.href = apkUrl;
                link.download = 'FilmySky.apk';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('App download error:', error);
        }
    };

    return (
        <div className="fixed bottom-[21rem] right-4 z-[45] flex flex-col items-center gap-2 md:bottom-[19rem] md:right-8">
            <button
                type="button"
                onClick={handleDownloadApp}
                className="group flex flex-col items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink-500"
                title="Download and install FilmySky"
                aria-label="Download and install FilmySky"
            >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff0752] text-white shadow-xl shadow-[#ff0752]/40 transition-transform group-hover:scale-105">
                    <i className="fas fa-download text-3xl" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">App Download</span>
            </button>
            <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="absolute -right-2 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 transition-opacity hover:opacity-100 focus:opacity-100"
                title="Dismiss app download"
                aria-label="Dismiss app download"
            >
                ×
            </button>
        </div>
    );
};

export default InstallPwaFab;
