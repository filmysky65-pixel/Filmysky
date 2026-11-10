
import React, { useState, useEffect } from 'react';

const WelcomeModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('filmysky_welcome_seen');
        if (!hasSeenWelcome) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('filmysky_welcome_seen', 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[1200] p-4">
            <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-sm w-full text-center">
                <h2 className="text-2xl font-bold mb-4">Welcome to FilmySky!</h2>
                <p className="text-[var(--secondary-text-color)] mb-6">Explore a vast library of movies and series. Enjoy your stay!</p>
                <button onClick={handleClose} className="bg-[var(--primary-color)] text-white font-bold py-2 px-6 rounded-lg w-full">
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default WelcomeModal;
