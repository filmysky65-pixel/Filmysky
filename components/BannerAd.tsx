
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import AdContainer from './AdContainer';

const BannerAd: React.FC = () => {
    const { appSettings, permissions } = useAppContext();
    const adCode = appSettings?.adyestraAdCode?.trim();

    if (!adCode || !permissions.shouldShowAds) return null;

    return (
        <aside className="mx-auto w-full max-w-5xl px-4 pb-5 pt-2" aria-label="Advertisement">
            <div className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] px-2 py-1 shadow-lg">
                <span className="block py-1 text-center text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--secondary-text-color)]">
                    Advertisement
                </span>
                <AdContainer code={adCode} />
            </div>
        </aside>
    );
};

export default BannerAd;
