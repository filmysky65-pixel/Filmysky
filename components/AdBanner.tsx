

import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const AdBanner: React.FC = () => {
    const { appSettings } = useAppContext();
    const adConfig = appSettings?.adBanner;

    if (!adConfig || !adConfig.imageUrl) {
        return null;
    }

    const handleClick = () => {
        if (adConfig.linkUrl) {
            window.open(adConfig.linkUrl, '_blank');
        }
    };

    return (
        <div className="px-4 mb-8">
            <div 
                className="rounded-lg overflow-hidden cursor-pointer shadow-lg"
                onClick={handleClick}
            >
                <img src={adConfig.imageUrl} alt="Advertisement" className="w-full object-contain" />
            </div>
        </div>
    );
};

export default AdBanner;