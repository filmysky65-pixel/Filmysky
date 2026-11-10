
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const LoadingScreen: React.FC = () => {
    const { appSettings } = useAppContext();
    const logoText = appSettings?.logoText || 'FilmySky';

    return (
        <div className="fixed inset-0 bg-[var(--bg-color)] flex flex-col justify-center items-center z-[2000]">
            <div className="text-5xl font-bold text-[var(--text-color)] animate-pulse flex items-center">
                <i className="fas fa-play-circle text-[var(--primary-color)] mr-3"></i>
                {logoText}
            </div>
            <div className="mt-4 text-[var(--secondary-text-color)]">Loading...</div>
        </div>
    );
};

export default LoadingScreen;
