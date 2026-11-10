import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const InstallPwaFab: React.FC = () => {
    const { deferredPrompt, triggerInstallPrompt, appSettings } = useAppContext();
    const location = useLocation();
    
    // Check if the app has already been downloaded or installed
    const [isDownloaded, setIsDownloaded] = useState<boolean>(() => {
        try {
            return (
                localStorage.getItem('filmysky_app_downloaded') === 'true' ||
                (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches)
            );
        } catch {
            return false;
        }
    });

    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Listen for app installed event to auto-remove
        const handleAppInstalled = () => {
            try {
                localStorage.setItem('filmysky_app_downloaded', 'true');
            } catch {}
            setIsDownloaded(true);
        };

        window.addEventListener('appinstalled', handleAppInstalled);
        return () => window.removeEventListener('appinstalled', handleAppInstalled);
    }, []);

    // If already downloaded or dismissed, remove floating widget completely
    if (isDownloaded || isDismissed) {
        return null;
    }

    const apkUrl = appSettings?.apkUrl?.trim() || appSettings?.appDownload?.apkUrl?.trim() || '';
    const hasDownloadOption = Boolean(deferredPrompt || apkUrl);

    if (!hasDownloadOption) {
        return null;
    }

    // Hide on specific pages if needed
    const path = location.pathname;
    const isHidden = 
        path.startsWith('/player/') || 
        (path.startsWith('/livetv/') && path.split('/').length > 3) || 
        path === '/ad' || 
        path === '/auth' || 
        path.startsWith('/admin');

    if (isHidden) return null;

    const handleDownloadApp = async () => {
        try {
            if (deferredPrompt) {
                await triggerInstallPrompt();
            } else if (apkUrl) {
                // Download the APK
                const link = document.createElement('a');
                link.href = apkUrl;
                link.download = 'FilmySky.apk';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Immediately mark as downloaded and remove from screen
            localStorage.setItem('filmysky_app_downloaded', 'true');
            setIsDownloaded(true);
        } catch (err) {
            console.error('App download error:', err);
            // Even if error, mark downloaded to satisfy user request
            localStorage.setItem('filmysky_app_downloaded', 'true');
            setIsDownloaded(true);
        }
    };

    return (
        <aside 
            className="fixed bottom-20 left-3 md:bottom-8 md:left-8 z-50 flex items-center bg-gradient-to-r from-[#11111d] to-[#1e1b4b] border border-white/15 text-white pl-3.5 pr-2 py-2 rounded-2xl shadow-2xl shadow-indigo-950/60 backdrop-blur-xl animate-fade-in group"
            aria-label="Download App"
        >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mr-3 flex-shrink-0">
                <i className="fas fa-mobile-alt text-lg text-white"></i>
            </div>
            
            <div className="mr-3 text-left">
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    <span>Download App</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase">FREE</span>
                </div>
                <div className="text-[10px] text-gray-300">Fast & smooth streaming</div>
            </div>

            <button 
                onClick={handleDownloadApp}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md transition-all duration-200 active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                title="Download and install app"
            >
                <i className="fas fa-download text-[11px]"></i>
                <span>Get App</span>
            </button>

            <button 
                onClick={() => setIsDismissed(true)} 
                className="ml-2 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs"
                title="Dismiss"
                aria-label="Close"
            >
                ✕
            </button>
        </aside>
    );
};

export default InstallPwaFab;
