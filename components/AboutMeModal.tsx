
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';

const AboutMeModal: React.FC = () => {
    const { isAboutMeModalOpen, closeAboutMeModal, appSettings } = useAppContext();
    const [show, setShow] = useState(false);
    
    useEffect(() => {
        if (isAboutMeModalOpen) {
            const timer = setTimeout(() => setShow(true), 10);
            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [isAboutMeModalOpen]);

    if (!isAboutMeModalOpen) return null;

    const handleClose = () => {
        setShow(false);
        setTimeout(closeAboutMeModal, 300); // Allow animation to finish
    };

    const socials = appSettings?.socials;

    return (
        <div 
            onClick={handleClose}
            className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-center items-end transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`bg-[var(--card-bg)] w-full max-w-md rounded-t-2xl p-6 transform transition-transform duration-300 ease-out ${show ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full mx-auto mb-4"></div>
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-[var(--border-color)] rounded-full flex items-center justify-center mb-4">
                        <i className="fas fa-user-astronaut text-4xl text-[var(--primary-color)]"></i>
                    </div>
                    <h2 className="text-xl font-bold mb-2">FilmySky</h2>
                    <p className="text-[var(--secondary-text-color)] text-sm mb-6">
                        Experience the best in entertainment. Join our community!
                    </p>

                    <div className="w-full flex gap-4 mb-6">
                        {socials?.telegram && (
                            <a 
                                href={socials.telegram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                <i className="fab fa-telegram-plane text-2xl"></i>
                                <span>Telegram</span>
                            </a>
                        )}
                        {socials?.instagram && (
                            <a 
                                href={socials.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-opacity"
                            >
                                <i className="fab fa-instagram text-2xl"></i>
                                <span>Instagram</span>
                            </a>
                        )}
                    </div>

                    <button onClick={handleClose} className="bg-[var(--primary-color)] text-white font-bold py-2 px-6 rounded-lg w-full">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutMeModal;
