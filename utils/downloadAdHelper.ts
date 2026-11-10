import { AppSettings } from '../types';

let isAdTriggering = false;

/**
 * Resolves a download URL, applying URL shortener template if configured.
 */
export const resolveDownloadUrl = (
    originalUrl: string, 
    shortenerConfig?: AppSettings['urlShortener']
): string => {
    if (!originalUrl) return '';
    const trimmed = originalUrl.trim();

    // If autoShorten is enabled and a template is configured
    if (
        shortenerConfig?.enabled && 
        shortenerConfig.autoShorten && 
        shortenerConfig.apiTemplate
    ) {
        // If it's already a short link or contains the shortener provider domain, don't double shorten
        const providerLower = (shortenerConfig.providerName || '').toLowerCase();
        if (providerLower && trimmed.toLowerCase().includes(providerLower)) {
            return trimmed;
        }

        const apiKey = shortenerConfig.apiKey || '';
        let template = shortenerConfig.apiTemplate;
        
        template = template.replace('{API_KEY}', encodeURIComponent(apiKey));
        template = template.replace('{URL}', encodeURIComponent(trimmed));
        return template;
    }

    return trimmed;
};

/**
 * Handles download button click:
 * - Triggers EXACTLY 1 AD if configured in admin settings
 * - Seamlessly directs to the download / URL shortener link
 * - Prevents multiple ad loops / spam
 */
export const executeDownloadWithAd = (
    downloadUrl: string,
    appSettings: AppSettings | null,
    shouldShowAds: boolean = true
): void => {
    if (!downloadUrl) return;

    const finalDownloadUrl = resolveDownloadUrl(downloadUrl, appSettings?.urlShortener);
    const adConfig = appSettings?.downloadAd;
    const isAdEnabled = Boolean(adConfig?.enabled && adConfig?.adUrl?.trim() && shouldShowAds);

    if (isAdEnabled && !isAdTriggering) {
        isAdTriggering = true;
        const adUrl = adConfig!.adUrl!.trim();

        try {
            // Trigger EXACTLY 1 Ad in a separate tab
            window.open(adUrl, '_blank', 'noopener,noreferrer');
            
            // Navigate to or open the download/shortener link
            setTimeout(() => {
                window.open(finalDownloadUrl, '_blank', 'noopener,noreferrer');
                isAdTriggering = false;
            }, 300);
        } catch (e) {
            // Fallback in case popup blocker interferes
            window.location.href = finalDownloadUrl;
            isAdTriggering = false;
        }
    } else {
        // Direct open without ad
        window.open(finalDownloadUrl, '_blank', 'noopener,noreferrer');
    }
};
