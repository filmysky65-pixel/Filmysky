import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const InstallPwaFab: React.FC = () => {
    const { deferredPrompt, triggerInstallPrompt } = useAppContext();
    const location = useLocation();

    if (!deferredPrompt) {
        return null;
    }

    // Hide on specific pages if needed, similar to other FABs
    const path = location.pathname;
    const isHidden = 
        path.startsWith('/player/') || 
        (path.startsWith('/livetv/') && path.split('/').length > 3) || 
        path === '/ad' || 
        path === '/auth' || 
        path.startsWith('/admin');

    if (isHidden) return null;

    return (
        <button 
            onClick={triggerInstallPrompt}
            className="fixed bottom-[12.5rem] right-4 md:bottom-28 md:right-8 z-[9999] w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 transition-all duration-300 hover:scale-110 group animate-pulse"
            title="Install App"
        >
            <i className="fas fa-download text-2xl"></i>
        </button>
    );
};

export default InstallPwaFab;
