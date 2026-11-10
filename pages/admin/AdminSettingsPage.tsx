import React, { useState, useEffect } from 'react';
import { getAppSettings, updateAppSettings } from '../../services/firebaseService';
import { AppSettings } from '../../types';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
    </label>
);

const AdminSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings>({ 
        logoText: 'FilmySky',
        maintenance: { status: 'INACTIVE' },
        subscriptionStatus: 'ACTIVE',
        playerConfig: { enableInternalPlayer: true, defaultServerBaseUrl: 'https://slast430did.com/play/' },
        adConfig: {
            masterSwitch: { video: true, interstitial: true },
            panelStatus: true,
            minBudgets: { youtube: 50, website: 100, video: 200 },
            rates: {
                youtube: { cpm: { '15': 50, '30': 70, '45': 90, '59': 110 }, cpc: 10 },
                website: { cpm: { '15': 100, '30': 130, '45': 160, '59': 190 }, cpc: 20 },
                video: { cpm: { '15': 150, '30': 200, '45': 250, '59': 300 }, cpc: 30 }
            }
        },
        adBanner: { imageUrl: '' },
        customAdCode: '',
        apkUrl: '',
        minAddMoney: 50,
        upiIds: [], 
        socials: { telegram: '', whatsapp: '', instagram: '', website: '' },
        adyestraAdCode: '',
        posterBorderColor: '#e50914',
        downloadAd: {
            enabled: true,
            adUrl: '',
            adType: 'direct_link',
            timerSeconds: 0
        },
        urlShortener: {
            enabled: false,
            providerName: 'GPLinks',
            apiKey: '',
            apiTemplate: 'https://gplinks.com/api?api={API_KEY}&url={URL}',
            autoShorten: false
        },
        paymentConfig: {
            autoVerifyEnabled: true,
            enableInternational: true,
            paypalEmail: '',
            cryptoUsdtAddress: '',
            cryptoNetwork: 'USDT (TRC-20 / BEP-20)',
            exchangeRateUsdToInr: 85
        }
    });
    const [loading, setLoading] = useState(true);
    const [newUpiId, setNewUpiId] = useState('');
    
    useEffect(() => {
        const unsubscribe = getAppSettings(rawFetchedSettings => {
            const data = (rawFetchedSettings || {}) as any;
            const adConfig = data.adConfig || {};
            const masterSwitch = adConfig.masterSwitch || { video: true, interstitial: true };
            
            const defaultRates = {
                youtube: { cpm: { '15': 50, '30': 70, '45': 90, '59': 110 }, cpc: 10 },
                website: { cpm: { '15': 100, '30': 130, '45': 160, '59': 190 }, cpc: 20 },
                video: { cpm: { '15': 150, '30': 200, '45': 250, '59': 300 }, cpc: 30 }
            };

            const newSettings: AppSettings = {
                logoText: data.logoText || 'FilmySky',
                maintenance: data.maintenance || { status: 'INACTIVE' },
                subscriptionStatus: data.subscriptionStatus || 'ACTIVE',
                playerConfig: {
                    enableInternalPlayer: data.playerConfig?.enableInternalPlayer ?? true,
                    defaultServerBaseUrl: data.playerConfig?.defaultServerBaseUrl || 'https://slast430did.com/play/'
                },
                adConfig: {
                    masterSwitch: typeof masterSwitch === 'boolean' ? { video: masterSwitch, interstitial: masterSwitch } : masterSwitch,
                    panelStatus: adConfig.panelStatus !== undefined ? adConfig.panelStatus : true,
                    minBudgets: adConfig.minBudgets || { youtube: 50, website: 100, video: 200 },
                    rates: {
                        youtube: {
                            cpm: (adConfig.rates?.youtube?.cpm && typeof adConfig.rates.youtube.cpm === 'object') ? adConfig.rates.youtube.cpm : defaultRates.youtube.cpm,
                            cpc: adConfig.rates?.youtube?.cpc ?? defaultRates.youtube.cpc,
                        },
                        website: {
                            cpm: (adConfig.rates?.website?.cpm && typeof adConfig.rates.website.cpm === 'object') ? adConfig.rates.website.cpm : defaultRates.website.cpm,
                            cpc: adConfig.rates?.website?.cpc ?? defaultRates.website.cpc,
                        },
                        video: {
                            cpm: (adConfig.rates?.video?.cpm && typeof adConfig.rates.video.cpm === 'object') ? adConfig.rates.video.cpm : defaultRates.video.cpm,
                            cpc: adConfig.rates?.video?.cpc ?? defaultRates.video.cpc,
                        },
                    }
                },
                adBanner: data.adBanner || { imageUrl: '' },
                customAdCode: data.customAdCode || '',
                popupAdCode: data.popupAdCode || '',
                adyestraAdCode: data.adyestraAdCode || '',
                apkUrl: data.apkUrl || '',
                minAddMoney: data.minAddMoney || 50,
                upiIds: Array.isArray(data.upiIds) ? data.upiIds : (typeof data.upiIds === 'string' ? data.upiIds.split(',').map((s:string) => s.trim()) : []),
                socials: {
                    telegram: data.socials?.telegram || '',
                    whatsapp: data.socials?.whatsapp || '',
                    instagram: data.socials?.instagram || '',
                    website: data.socials?.website || ''
                },
                posterBorderColor: data.posterBorderColor || '#e50914',
                downloadAd: {
                    enabled: data.downloadAd?.enabled ?? true,
                    adUrl: data.downloadAd?.adUrl || data.popupAdCode || '',
                    adType: data.downloadAd?.adType || 'direct_link',
                    timerSeconds: data.downloadAd?.timerSeconds || 0
                },
                urlShortener: {
                    enabled: data.urlShortener?.enabled ?? false,
                    providerName: data.urlShortener?.providerName || 'GPLinks',
                    apiKey: data.urlShortener?.apiKey || '',
                    apiTemplate: data.urlShortener?.apiTemplate || 'https://gplinks.com/api?api={API_KEY}&url={URL}',
                    autoShorten: data.urlShortener?.autoShorten ?? false
                },
                paymentConfig: {
                    autoVerifyEnabled: data.paymentConfig?.autoVerifyEnabled ?? true,
                    enableInternational: data.paymentConfig?.enableInternational ?? true,
                    paypalEmail: data.paymentConfig?.paypalEmail || '',
                    cryptoUsdtAddress: data.paymentConfig?.cryptoUsdtAddress || '',
                    cryptoNetwork: data.paymentConfig?.cryptoNetwork || 'USDT (TRC-20 / BEP-20)',
                    exchangeRateUsdToInr: data.paymentConfig?.exchangeRateUsdToInr || 85
                }
            };
            setSettings(newSettings);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const handleChange = (path: string, value: any) => {
        const pathParts = path.split('.');
        const newSettings = JSON.parse(JSON.stringify(settings));
        let current: any = newSettings;
        for (let i = 0; i < pathParts.length - 1; i++) {
            current[pathParts[i]] = current[pathParts[i]] || {};
            current = current[pathParts[i]];
        }
        current[pathParts[pathParts.length - 1]] = value;
        setSettings(newSettings);
    };

    const handleAddUpiId = () => {
      if (newUpiId.trim() && !settings.upiIds?.includes(newUpiId.trim())) {
        const updatedUpiIds = [...(settings.upiIds || []), newUpiId.trim()];
        setSettings((prev: any) => ({ ...prev, upiIds: updatedUpiIds }));
        setNewUpiId('');
      }
    };

    const handleRemoveUpiId = (idToRemove: string) => {
      const updatedUpiIds = settings.upiIds?.filter((id: string) => id !== idToRemove);
      setSettings((prev: any) => ({ ...prev, upiIds: updatedUpiIds }));
    };

    const handleSave = async () => {
        await updateAppSettings(settings);
        alert("Settings saved successfully!");
    };
    
    if (loading) return <div className="flex justify-center items-center h-64"><i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i></div>;

    const durations = ['15', '30', '45', '59'];
    const presetBorderColors = ['#e50914', '#00f0ff', '#ffc107', '#a855f7', '#10b981', '#ffffff'];

    return (
        <div className="pb-16">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">App Settings</h1>
                    <p className="text-xs text-[var(--secondary-text-color)]">Configure Floating Buttons, Poster Borders, 1-Time Download Ads, URL Shortener & Global Payments</p>
                </div>
                <button onClick={handleSave} className="bg-[var(--primary-color)] hover:opacity-90 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all">
                    <i className="fas fa-save mr-2"></i> Save Settings
                </button>
            </div>

            <div className="space-y-6 bg-[var(--card-bg)] p-6 rounded-2xl max-w-4xl border border-[var(--border-color)]">

                {/* POSTER HORIZONTAL BORDER COLOR */}
                <div className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-bold text-base flex items-center gap-2">
                                <i className="fas fa-palette text-[var(--primary-color)]"></i>
                                Poster Horizontal Border Color
                            </h3>
                            <p className="text-xs text-[var(--secondary-text-color)]">Colours the top and bottom horizontal border of all content posters across the platform.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <input 
                            type="color" 
                            value={settings.posterBorderColor || '#e50914'} 
                            onChange={(e) => handleChange('posterBorderColor', e.target.value)}
                            className="w-12 h-10 rounded cursor-pointer bg-transparent border-0"
                        />
                        <input 
                            type="text" 
                            value={settings.posterBorderColor || '#e50914'} 
                            onChange={(e) => handleChange('posterBorderColor', e.target.value)}
                            className="p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-sm font-mono w-28"
                            placeholder="#e50914"
                        />
                        <div className="flex items-center gap-1.5 ml-2">
                            <span className="text-xs text-[var(--secondary-text-color)] mr-1">Presets:</span>
                            {presetBorderColors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleChange('posterBorderColor', color)}
                                    className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* FLOATING WHATSAPP & TELEGRAM */}
                <div className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                    <div className="mb-3">
                        <h3 className="font-bold text-base flex items-center gap-2">
                            <i className="fas fa-comment-dots text-green-400"></i>
                            WhatsApp & Telegram Floating Buttons
                        </h3>
                        <p className="text-xs text-[var(--secondary-text-color)] mt-0.5">
                            <strong className="text-yellow-400">Auto-Visibility:</strong> Floating buttons will ONLY appear when a link is entered here. If you leave a link empty, that button will stay completely hidden from users!
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-green-400">
                                <i className="fab fa-whatsapp mr-1"></i> WhatsApp Floating Button Link (Leave empty to hide)
                            </label>
                            <input 
                                value={settings.socials?.whatsapp || ''} 
                                onChange={(e) => handleChange('socials.whatsapp', e.target.value)} 
                                placeholder="https://whatsapp.com/channel/..." 
                                className="w-full p-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-cyan-400">
                                <i className="fab fa-telegram-plane mr-1"></i> Telegram Floating Button Link (Leave empty to hide)
                            </label>
                            <input 
                                value={settings.socials?.telegram || ''} 
                                onChange={(e) => handleChange('socials.telegram', e.target.value)} 
                                placeholder="https://t.me/yourchannel" 
                                className="w-full p-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-sm" 
                            />
                        </div>
                    </div>
                </div>

                {/* DOWNLOAD FLOATING BAR SETTINGS */}
                <div className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                    <div className="mb-3">
                        <h3 className="font-bold text-base flex items-center gap-2">
                            <i className="fas fa-mobile-alt text-blue-400"></i>
                            App Download Floating Widget
                        </h3>
                        <p className="text-xs text-[var(--secondary-text-color)]">
                            Shows a floating "Download App" bar to users. When the user taps Download/Install, the bar is permanently removed from their screen!
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1">Direct APK Download Link</label>
                        <input 
                            value={settings.apkUrl || ''} 
                            onChange={(e) => handleChange('apkUrl', e.target.value)} 
                            className="w-full p-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-sm"
                            placeholder="https://.../FilmySky.apk"
                        />
                    </div>
                </div>

                {/* DOWNLOAD BUTTON: 1-TIME AD & URL SHORTENER */}
                <div className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)] space-y-4">
                    <div>
                        <h3 className="font-bold text-base flex items-center gap-2 text-amber-400">
                            <i className="fas fa-ad"></i>
                            Download Button: 1-Time Ad & URL Shortener
                        </h3>
                        <p className="text-xs text-[var(--secondary-text-color)] mt-0.5">
                            Controls ad monetization on download clicks (strictly 1 ad per click) and integrates URL shortener links.
                        </p>
                    </div>

                    {/* 1-Time Ad on Download Button */}
                    <div className="bg-[var(--card-bg)] p-3.5 rounded-xl border border-[var(--border-color)] space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-sm">1-Time Ad on Download Button</p>
                                <p className="text-xs text-[var(--secondary-text-color)]">Trigger exactly 1 ad per download button click (No double or spam ads).</p>
                            </div>
                            <ToggleSwitch 
                                checked={settings.downloadAd?.enabled ?? true}
                                onChange={(val) => handleChange('downloadAd.enabled', val)}
                            />
                        </div>

                        {settings.downloadAd?.enabled && (
                            <div>
                                <label className="block text-xs font-semibold mb-1">Direct Ad Link / Popunder URL</label>
                                <input 
                                    value={settings.downloadAd?.adUrl || ''} 
                                    onChange={(e) => handleChange('downloadAd.adUrl', e.target.value)}
                                    placeholder="https://example.com/ad-direct-link"
                                    className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg text-sm font-mono"
                                />
                                <p className="text-[11px] text-[var(--secondary-text-color)] mt-1">Paste your Adsterra, Monetag, or PropellerAds Direct Link here.</p>
                            </div>
                        )}
                    </div>

                    {/* URL Shortener Integration */}
                    <div className="bg-[var(--card-bg)] p-3.5 rounded-xl border border-[var(--border-color)] space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-sm">URL Shortener Integration</p>
                                <p className="text-xs text-[var(--secondary-text-color)]">Allow pasting shortened links or auto-shortening download links.</p>
                            </div>
                            <ToggleSwitch 
                                checked={settings.urlShortener?.enabled ?? false}
                                onChange={(val) => handleChange('urlShortener.enabled', val)}
                            />
                        </div>

                        {settings.urlShortener?.enabled && (
                            <div className="space-y-3 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Provider Name</label>
                                        <input 
                                            value={settings.urlShortener?.providerName || 'GPLinks'} 
                                            onChange={(e) => handleChange('urlShortener.providerName', e.target.value)}
                                            placeholder="GPLinks / ShrinkMe / Droplink"
                                            className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">API Key / Token</label>
                                        <input 
                                            value={settings.urlShortener?.apiKey || ''} 
                                            onChange={(e) => handleChange('urlShortener.apiKey', e.target.value)}
                                            placeholder="Your Shortener API Token"
                                            className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg text-sm font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1">Shortener API URL Template</label>
                                    <input 
                                        value={settings.urlShortener?.apiTemplate || 'https://gplinks.com/api?api={API_KEY}&url={URL}'} 
                                        onChange={(e) => handleChange('urlShortener.apiTemplate', e.target.value)}
                                        placeholder="https://gplinks.com/api?api={API_KEY}&url={URL}"
                                        className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg text-sm font-mono text-xs"
                                    />
                                    <p className="text-[11px] text-[var(--secondary-text-color)] mt-1">Use <code className="text-yellow-400">&#123;API_KEY&#125;</code> and <code className="text-yellow-400">&#123;URL&#125;</code> as placeholders.</p>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div>
                                        <p className="font-semibold text-xs">Auto-Shorten Direct Download Links</p>
                                        <p className="text-[11px] text-[var(--secondary-text-color)]">If enabled, direct download links are routed through your shortener automatically.</p>
                                    </div>
                                    <ToggleSwitch 
                                        checked={settings.urlShortener?.autoShorten ?? false}
                                        onChange={(val) => handleChange('urlShortener.autoShorten', val)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* GLOBAL PAYMENT GATEWAYS & AUTO-VERIFICATION */}
                <div className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)] space-y-4">
                    <div>
                        <h3 className="font-bold text-base flex items-center gap-2 text-emerald-400">
                            <i className="fas fa-globe"></i>
                            Global Payments & Automatic Verification
                        </h3>
                        <p className="text-xs text-[var(--secondary-text-color)] mt-0.5">
                            Receive payments from all countries globally (UPI, Cards, PayPal, Crypto USDT) with instant automated verification.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-color)]">
                            <div>
                                <p className="font-semibold text-sm">Automatic Payment Verification</p>
                                <p className="text-xs text-[var(--secondary-text-color)]">Instantly verify & activate subscription</p>
                            </div>
                            <ToggleSwitch 
                                checked={settings.paymentConfig?.autoVerifyEnabled ?? true}
                                onChange={(val) => handleChange('paymentConfig.autoVerifyEnabled', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-color)]">
                            <div>
                                <p className="font-semibold text-sm">Accept International Payments</p>
                                <p className="text-xs text-[var(--secondary-text-color)]">Enable Cards, PayPal, Crypto USDT</p>
                            </div>
                            <ToggleSwitch 
                                checked={settings.paymentConfig?.enableInternational ?? true}
                                onChange={(val) => handleChange('paymentConfig.enableInternational', val)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-blue-400">PayPal Merchant Email (All Countries)</label>
                            <input 
                                value={settings.paymentConfig?.paypalEmail || ''} 
                                onChange={(e) => handleChange('paymentConfig.paypalEmail', e.target.value)}
                                placeholder="paypal@filmysky.com"
                                className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-yellow-400">USD to INR Exchange Rate</label>
                            <input 
                                type="number"
                                value={settings.paymentConfig?.exchangeRateUsdToInr || 85} 
                                onChange={(e) => handleChange('paymentConfig.exchangeRateUsdToInr', Number(e.target.value))}
                                className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1 text-amber-400">USDT / Crypto Deposit Address (Universal Global Acceptance)</label>
                        <input 
                            value={settings.paymentConfig?.cryptoUsdtAddress || ''} 
                            onChange={(e) => handleChange('paymentConfig.cryptoUsdtAddress', e.target.value)}
                            placeholder="0x... or T... (USDT TRC20 / BEP20)"
                            className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-sm font-mono text-xs"
                        />
                    </div>

                    {/* Domestic UPI IDs */}
                    <div>
                        <label className="block text-xs font-semibold mb-1 text-emerald-400">Domestic India UPI IDs</label>
                        <div className="space-y-2 mb-2">
                            {settings.upiIds?.map((id: string) => (
                                <div key={id} className="flex items-center justify-between bg-[var(--card-bg)] p-2 rounded-lg border border-[var(--border-color)]">
                                    <span className="font-mono text-xs text-yellow-400">{id}</span>
                                    <button onClick={() => handleRemoveUpiId(id)} className="text-red-400 hover:text-red-500 text-xs px-2"><i className="fas fa-trash"></i></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input 
                                value={newUpiId} 
                                onChange={(e) => setNewUpiId(e.target.value)} 
                                placeholder="Add new UPI ID (e.g. yourname@paytm)" 
                                className="flex-grow p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-xs"
                            />
                            <button onClick={handleAddUpiId} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs">Add UPI</button>
                        </div>
                    </div>
                </div>

                {/* GENERAL MODULES */}
                <div className="border-t border-[var(--border-color)] pt-4">
                    <h3 className="font-bold text-lg mb-4">General Modules</h3>
                    <div className="flex items-center justify-between bg-[var(--bg-color)] p-3 rounded-lg mb-3">
                        <div>
                            <p className="font-semibold">Subscription Model</p>
                            <p className="text-xs text-[var(--secondary-text-color)]">Enable/Disable subscriptions.</p>
                        </div>
                        <ToggleSwitch 
                            checked={settings.subscriptionStatus === 'ACTIVE'}
                            onChange={(isChecked) => handleChange('subscriptionStatus', isChecked ? 'ACTIVE' : 'INACTIVE')}
                        />
                    </div>
                    <div className="flex items-center justify-between bg-[var(--bg-color)] p-3 rounded-lg mb-3">
                        <div>
                            <p className="font-semibold">App Name / Logo Text</p>
                            <p className="text-xs text-[var(--secondary-text-color)]">Text displayed in header.</p>
                        </div>
                        <input 
                            value={settings.logoText || 'FilmySky'} 
                            onChange={(e) => handleChange('logoText', e.target.value)} 
                            className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded p-2 text-sm w-40"
                        />
                    </div>
                    <div className="flex items-center justify-between bg-[var(--bg-color)] p-3 rounded-lg mb-3">
                        <div>
                            <p className="font-semibold">Internal Video Player</p>
                            <p className="text-xs text-[var(--secondary-text-color)]">OFF: Opens server links in a dialog (External).</p>
                        </div>
                        <ToggleSwitch 
                            checked={settings.playerConfig?.enableInternalPlayer ?? true}
                            onChange={(isChecked) => handleChange('playerConfig.enableInternalPlayer', isChecked)}
                        />
                    </div>
                    <div className="flex items-center justify-between bg-[var(--bg-color)] p-3 rounded-lg mb-3 flex-wrap gap-2">
                        <div>
                            <p className="font-semibold">Stream Server Base URL</p>
                            <p className="text-xs text-[var(--secondary-text-color)]">Third-party player endpoint used for IMDb & TMDB IDs.</p>
                        </div>
                        <input 
                            value={settings.playerConfig?.defaultServerBaseUrl ?? 'https://slast430did.com/play/'} 
                            onChange={(e) => handleChange('playerConfig.defaultServerBaseUrl', e.target.value)} 
                            className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded p-2 text-sm w-72 font-mono"
                            placeholder="https://slast430did.com/play/"
                        />
                    </div>
                </div>

                {/* ADVERTISER CONFIGURATION */}
                <div className="border-t border-[var(--border-color)] pt-4">
                    <h3 className="font-bold text-lg mb-4">Advertiser Configuration</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center justify-between bg-[var(--bg-color)] p-3 rounded-lg">
                            <div>
                                <p className="font-semibold text-red-400"><i className="fas fa-play-circle mr-1"></i> Master Video Ads</p>
                                <p className="text-xs text-[var(--secondary-text-color)]">Toggle OFF all video pre-roll ads.</p>
                            </div>
                            <ToggleSwitch 
                                checked={settings.adConfig?.masterSwitch.video ?? true}
                                onChange={(val) => handleChange('adConfig.masterSwitch.video', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between bg-[var(--bg-color)] p-3 rounded-lg">
                            <div>
                                <p className="font-semibold text-blue-400"><i className="fas fa-ad mr-1"></i> Master Interstitial Ads</p>
                                <p className="text-xs text-[var(--secondary-text-color)]">Toggle OFF all full-screen ads.</p>
                            </div>
                            <ToggleSwitch 
                                checked={settings.adConfig?.masterSwitch.interstitial ?? true}
                                onChange={(val) => handleChange('adConfig.masterSwitch.interstitial', val)}
                            />
                        </div>
                    </div>
                </div>

                {/* BOTTOM BANNER AD CODE */}
                <div className="border-t border-[var(--border-color)] pt-4">
                    <h3 className="font-bold text-lg mb-4">Adsterra Bottom Banner</h3>
                    <div className="bg-[var(--bg-color)] p-3 rounded-lg">
                        <label className="block text-sm font-semibold mb-1">Banner script link or HTML/JS code</label>
                        <textarea 
                            value={settings.adyestraAdCode || ''} 
                            onChange={(e) => handleChange('adyestraAdCode', e.target.value)}
                            placeholder="https://.../banner.js or <script>...</script>"
                            className="w-full h-28 p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg font-mono text-xs"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button onClick={handleSave} className="bg-[var(--primary-color)] hover:opacity-90 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all w-full md:w-auto">
                        <i className="fas fa-save mr-2"></i> Save All Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
