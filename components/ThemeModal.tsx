
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Theme } from '../types';

const themes: { id: Theme; name: string }[] = [
    { id: 'FilmySky-dark', name: 'FilmySky Dark' },
    { id: 'classic-dark', name: 'Night Mode' },
    { id: 'gradient-luxe', name: 'Gradient Luxe' },
    { id: 'minimal-light', name: 'Minimal Light' },
];

const ThemePreview: React.FC<{ themeId: Theme }> = ({ themeId }) => {
    const getThemeClasses = () => {
        switch(themeId) {
            case 'FilmySky-dark': return 'bg-[#10141f]';
            case 'classic-dark': return 'bg-[#000000]';
            case 'gradient-luxe': return 'bg-gradient-to-br from-[#480ca8] to-[#0077b6]';
            case 'minimal-light': return 'bg-[#f4f4f4]';
        }
    }
    const getHeaderClasses = () => {
         switch(themeId) {
            case 'FilmySky-dark': return 'bg-[#00aaff]';
            case 'classic-dark': return 'bg-[#e50914]';
            case 'gradient-luxe': return 'bg-white';
            case 'minimal-light': return 'bg-[#e50914]';
        }
    }
     const getCardClasses = () => {
         switch(themeId) {
            case 'FilmySky-dark': return 'bg-[#1a2035]';
            case 'classic-dark': return 'bg-[#181818]';
            case 'gradient-luxe': return 'bg-white/20';
            case 'minimal-light': return 'bg-white border border-[#e0e0e0]';
        }
    }
    return (
        <div className={`h-24 rounded-md p-2 flex flex-col ${getThemeClasses()}`}>
            <div className={`h-3 rounded-sm mb-2 opacity-80 ${getHeaderClasses()}`}></div>
            <div className="flex-grow flex gap-1.5">
                <div className={`w-1/3 rounded-sm ${getCardClasses()}`}></div>
                <div className={`w-1/3 rounded-sm ${getCardClasses()}`}></div>
                <div className={`w-1/3 rounded-sm ${getCardClasses()}`}></div>
            </div>
        </div>
    );
};


const ThemeModal: React.FC = () => {
    const { isThemeModalOpen, closeThemeModal, theme, setTheme } = useAppContext();

    if (!isThemeModalOpen) return null;

    const handleThemeSelect = (selectedTheme: Theme) => {
        setTheme(selectedTheme);
        closeThemeModal();
    };

    return (
        <div 
            onClick={closeThemeModal}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl w-full max-w-md shadow-2xl"
            >
                <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                    <h2 className="text-lg font-bold">Select a Theme</h2>
                     <button onClick={closeThemeModal} className="text-[var(--secondary-text-color)] hover:text-[var(--text-color)]">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                    {themes.map(t => (
                        <div key={t.id} onClick={() => handleThemeSelect(t.id)} className="cursor-pointer">
                            <div className={`rounded-lg p-1 transition-all duration-300 ${theme === t.id ? 'bg-[var(--primary-color)]' : 'bg-transparent'}`}>
                               <ThemePreview themeId={t.id} />
                            </div>
                            <p className={`text-center text-sm font-semibold mt-2 ${theme === t.id ? 'text-[var(--primary-color)]' : 'text-[var(--text-color)]'}`}>
                                {t.name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThemeModal;
