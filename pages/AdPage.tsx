

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { serveAd, recordAdView } from '../services/firebaseService';
import { AdCampaign } from '../types';

const AdPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [ad, setAd] = useState<AdCampaign | null>(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [canClose, setCanClose] = useState(false);
    const [loading, setLoading] = useState(true);
    const viewRecorded = useRef(false);

    const destinationPath = location.state?.destinationPath || '/';
    const destinationState = location.state?.destinationState || {};

    const handleClose = () => {
        navigate(destinationPath, { state: destinationState, replace: true });
    };

    useEffect(() => {
        const fetchAd = async () => {
            // serveAd now checks master switch internally
            const fetchedAd = await serveAd('interstitial');
            if (fetchedAd) {
                setAd(fetchedAd);
                setTimeLeft(fetchedAd.duration);
            } else {
                handleClose();
                return;
            }
            setLoading(false);
        };
        fetchAd();
    }, []);

    useEffect(() => {
        if (!ad) return;

        if (timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        } else {
            setCanClose(true);
            if (!viewRecorded.current) {
                recordAdView(ad);
                viewRecorded.current = true;
            }
        }
    }, [timeLeft, ad]);

    if (loading && !ad) return <div className="fixed inset-0 bg-black flex justify-center items-center text-white"><i className="fas fa-spinner fa-spin text-2xl"></i></div>;
    if (!ad) return null; 

    return (
        <div className="fixed inset-0 bg-black flex flex-col z-[5000] overflow-hidden w-full h-full">
            <header className="h-16 bg-gray-900 border-b border-gray-700 flex justify-between items-center px-4 flex-shrink-0 w-full z-10">
                <div className="font-bold text-white text-lg flex items-center">
                    <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded mr-2 uppercase font-bold">Ad</span>
                    Advertisement
                </div>
                <div>
                    {canClose ? (
                        <button 
                            onClick={handleClose}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 animate-pulse"
                        >
                            <span>Close & Play</span>
                            <i className="fas fa-play text-xs"></i>
                        </button>
                    ) : (
                        <div className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg font-mono">
                            Wait <span className="text-white font-bold">{timeLeft}s</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-grow w-full h-full relative bg-white overflow-hidden">
                <iframe
                    src={ad.contentUrl}
                    title="Advertisement"
                    width="100%"
                    height="100%"
                    className="w-full h-full border-0 absolute inset-0"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                />
                
                {ad.subType === 'website' && ad.targetUrl && (
                    <a 
                        href={ad.targetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-x-0 bottom-0 h-16 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold cursor-pointer transition-colors z-20"
                        onClick={() => { /* Track click if needed */ }}
                    >
                        Visit Website <i className="fas fa-external-link-alt ml-2"></i>
                    </a>
                )}
            </div>
        </div>
    );
};

export default AdPage;