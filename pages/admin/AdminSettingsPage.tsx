
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
    });
    const [loading, setLoading] = useState(true);
    const [newUpiId, setNewUpiId] = useState('');
    
    useEffect(() => {
        const unsubscribe = getAppSettings(rawFetchedSettings => {
            const data = (rawFetchedSettings || {}) as any;
            // Default Config
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
                    enableInternalPlayer: data.playerConfig?.enableInternalPlayer ?? true, // Default to true
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
                // Ensure socials object is properly initialized
                socials: {
                    telegram: data.socials?.telegram || '',
                    whatsapp: data.socials?.whatsapp || '',
                    instagram: data.socials?.instagram || '',
                    website: data.socials?.website || ''
                },
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
        alert("Settings saved!");
    };
    
    if (loading) return <div className="flex justify-center items-center h-64"><i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i></div>;

    const durations = ['15', '30', '45', '59'];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">App Settings</h1>
            <div className="space-y-6 bg-[var(--card-bg)] p-6 rounded-lg max-w-4xl">

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
                            <p className="font-semibold">APK Download Link</p>
                            <p className="text-xs text-[var(--secondary-text-color)]">Update the download button link.</p>
                        </div>
                        <input 
                            value={settings.apkUrl || ''} 
                            onChange={(e) => handleChange('apkUrl', e.target.value)} 
                            className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded p-2 text-sm w-64"
                            placeholder="https://..."
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
                        <div className="flex items-center justify-between bg-[var(--bg-color)] p-3 rounded-lg col-span-1 md:col-span-2">
                            <div>
                                <p className="font-semibold">Advertiser Panel Link</p>
                                <p className="text-xs text-[var(--secondary-text-color)]">Show 'Advertise With Us' in User Profile.</p>
                            </div>
                            <ToggleSwitch 
                                checked={settings.adConfig?.panelStatus ?? true}
                                onChange={(val) => handleChange('adConfig.panelStatus', val)}
                            />
                        </div>
                    </div>

                    <p className="text-xs font-bold uppercase text-[var(--secondary-text-color)] mb-4">Pricing & Limits (CPM Per 1000 Views)</p>
                    <div className="grid grid-cols-1 gap-6">
                        
                        {/* YouTube Settings */}
                        <div className="bg-[var(--bg-color)] p-4 rounded-lg border border-[var(--border-color)]">
                            <h4 className="font-bold mb-3 text-red-400 flex items-center justify-between">
                                <span><i className="fab fa-youtube mr-2"></i> YouTube Ads</span>
                                <div className="flex items-center gap-2 text-sm font-normal text-white">
                                    <span>Min Budget: ₹</span>
                                    <input type="number" value={settings.adConfig?.minBudgets.youtube} onChange={e => handleChange('adConfig.minBudgets.youtube', Number(e.target.value))} className="w-20 p-1 rounded bg-[var(--card-bg)] border border-[var(--border-color)]"/>
                                </div>
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                {durations.map(d => (
                                    <div key={`yt-${d}`}>
                                        <label className="block text-[10px] opacity-70 mb-1">{d}s CPM</label>
                                        <input type="number" value={settings.adConfig?.rates.youtube.cpm[d as any]} onChange={e => handleChange(`adConfig.rates.youtube.cpm.${d}`, Number(e.target.value))} className="w-full p-2 rounded bg-[var(--card-bg)] border border-[var(--border-color)]"/>
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-[10px] opacity-70 mb-1">CPC (1k Click)</label>
                                    <input type="number" value={settings.adConfig?.rates.youtube.cpc} onChange={e => handleChange('adConfig.rates.youtube.cpc', Number(e.target.value))} className="w-full p-2 rounded bg-[var(--card-bg)] border border-[var(--border-color)]"/>
                                </div>
                            </div>
                        </div>

                        {/* Website Settings */}
                        <div className="bg-[var(--bg-color)] p-4 rounded-lg border border-[var(--border-color)]">
                            <h4 className="font-bold mb-3 text-blue-400 flex items-center justify-between">
                                <span><i className="fas fa-globe mr-2"></i> Website Ads</span>
                                <div className="flex items-center gap-2 text-sm font-normal text-white">
                                    <span>Min Budget: ₹</span>
                                    <input type="number" value={settings.adConfig?.minBudgets.website} onChange={e => handleChange('adConfig.minBudgets.website', Number(e.target.value))} className="w-20 p-1 rounded bg-[var(--card-bg)] border border-[var(--border-color)]"/>
                                </div>
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                {durations.map(d => (
                                    <div key={`wb-${d}`}>
                                        <label className="block text-[10px] opacity-70 mb-1">{d}s CPM</label>
                                        <input type="number" value={settings.adConfig?.rates.website.cpm[d as any]} onChange={e => handleChange(`adConfig.rates.website.cpm.${d}`, Number(e.target.value))} className="w-full p-2 rounded bg-[var(--card-bg)] border border-[var(--border-color)]"/>
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-[10px] opacity-70 mb-1">CPC (1k Click)</label>
                                    <input type="number" value={settings.adConfig?.rates.website.cpc} onChange={e => handleChange('adConfig.rates.website.cpc', Number(e.target.value))} className="w-full p-2 rounded bg-[var(--card-bg)] border border-[var(--border-color)]"/>
                                </div>
                            </div>
                        </div>

                        {/* Video Settings */}
                        <div className="bg-[var(--bg-color)] p-4 rounded-lg border border-[var(--border-color)]">
                            <h4 className="font-bold mb-3 text-purple-400 flex items-center justify-between">
                                <span><i className="fas fa-play-circle mr-2"></i> Video Ads</span>
                                <div className="flex items-center gap-2 text-sm font-normal text-white">
                                    <span>Min Budget: ₹</span>
                                    <input type="number" value={settings.adConfig?.minBudgets.video} onChange={e => handleChange('adConfig.minBudgets.video', Number(e.target.value))} className="w-20 p-1 rounded bg-[var(--card-bg)] border border-[var(--border-color)]"/>
                                </div>
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                {durations.map(d => (
                                    <div key={`vd-${d}`}>
                                        <label className="block text-[10px] opacity-70 mb-1">{d}s CPM</label>
                                        <input type="number" value={settings.adConfig?.rates.video.cpm[d as any]} onChange={e => handleChange(`adConfig.rates.video.cpm.${d}`, Number(e.target.value))} className="w-full p-2 rounded bg-[var(--card-bg)] border border-[var(--border-color)]"/>
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-[10px] opacity-70 mb-1">CPC (1k Click)</label>
                                    <input type="number" value={settings.adConfig?.rates.video.cpc} onChange={e => handleChange('adConfig.rates.video.cpc', Number(e.target.value))} className="w-full p-2 rounded bg-[var(--card-bg)] border border-[var(--border-color)]"/>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="border-t border-[var(--border-color)] pt-4">
                    <h3 className="font-bold text-lg mb-2">Maintenance Mode</h3>
                    <div className="flex items-center justify-between bg-[var(--bg-color)] p-3 rounded-lg">
                        <p className="font-semibold">Activate Maintenance Mode</p>
                        <ToggleSwitch 
                            checked={settings.maintenance?.status === 'ACTIVE'}
                            onChange={(isChecked) => handleChange('maintenance.status', isChecked ? 'ACTIVE' : 'INACTIVE')}
                        />
                    </div>
                </div>
                
                <div className="border-t border-[var(--border-color)] pt-4">
                    <h3 className="font-bold text-lg mb-2">Payment Settings</h3>
                    <div className="bg-[var(--bg-color)] p-3 rounded-lg mb-3">
                        <label className="block text-sm font-semibold mb-1">Minimum Add Money Limit (₹)</label>
                        <input 
                            type="number" 
                            value={settings.minAddMoney || 50} 
                            onChange={(e) => handleChange('minAddMoney', Number(e.target.value))}
                            className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg"
                        />
                        <p className="text-xs text-[var(--secondary-text-color)] mt-1">The minimum amount a user must add to their wallet.</p>
                    </div>

                    <div className="space-y-2 mb-3">
                        {settings.upiIds?.map((id: string) => (
                            <div key={id} className="flex items-center justify-between bg-[var(--bg-color)] p-2 rounded-lg">
                                <span className="font-mono text-sm">{id}</span>
                                <button onClick={() => handleRemoveUpiId(id)} className="text-red-400 hover:text-red-600 text-sm"><i className="fas fa-trash"></i></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={newUpiId} onChange={(e) => setNewUpiId(e.target.value)} placeholder="Enter new UPI ID" className="flex-grow p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg"/>
                        <button onClick={handleAddUpiId} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">Add</button>
                    </div>
                </div>

                <div className="border-t border-[var(--border-color)] pt-4">
                    <h3 className="font-bold text-lg mb-4">Banner Ad Configuration</h3>
                    <div className="space-y-4">
                         <div className="bg-[var(--bg-color)] p-3 rounded-lg">
                            <label className="block text-sm font-semibold mb-1">Banner Image URL</label>
                            <input 
                                type="text" 
                                value={settings.adBanner?.imageUrl || ''} 
                                onChange={(e) => handleChange('adBanner.imageUrl', e.target.value)}
                                placeholder="https://example.com/banner.jpg"
                                className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg"
                            />
                            <p className="text-xs text-[var(--secondary-text-color)] mt-1">Direct link to the image file.</p>
                        </div>
                        <div className="bg-[var(--bg-color)] p-3 rounded-lg">
                            <label className="block text-sm font-semibold mb-1">Target Link URL</label>
                            <input 
                                type="text" 
                                value={settings.adBanner?.linkUrl || ''} 
                                onChange={(e) => handleChange('adBanner.linkUrl', e.target.value)}
                                placeholder="https://example.com/offer"
                                className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg"
                            />
                            <p className="text-xs text-[var(--secondary-text-color)] mt-1">Where the user goes when clicking the banner.</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[var(--border-color)] pt-4">
                    <h3 className="font-bold text-lg mb-4">Video Page Ad Code</h3>
                    <div className="bg-[var(--bg-color)] p-3 rounded-lg">
                        <label className="block text-sm font-semibold mb-1">Custom Ad Code (HTML/JS)</label>
                        <textarea 
                            value={settings.customAdCode || ''} 
                            onChange={(e) => handleChange('customAdCode', e.target.value)}
                            placeholder="<script>...</script>"
                            className="w-full h-32 p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg font-mono text-xs"
                        />
                        <p className="text-xs text-[var(--secondary-text-color)] mt-1">This code will be injected below the video player.</p>
                    </div>
                </div>

                <div className="border-t border-[var(--border-color)] pt-4">
                    <h3 className="font-bold text-lg mb-4">Popup Ad Code</h3>
                    <div className="bg-[var(--bg-color)] p-3 rounded-lg">
                        <label className="block text-sm font-semibold mb-1">Popup Ad Script (HTML/JS)</label>
                        <textarea 
                            value={settings.popupAdCode || ''} 
                            onChange={(e) => handleChange('popupAdCode', e.target.value)}
                            placeholder="<script>...</script>"
                            className="w-full h-32 p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg font-mono text-xs"
                        />
                        <p className="text-xs text-[var(--secondary-text-color)] mt-1">This code will be injected globally for popups.</p>
                    </div>
                </div>

                <div className="border-t border-[var(--border-color)] pt-4">
                    <h3 className="font-bold text-lg mb-4">Adsterra Bottom Banner</h3>
                    <div className="bg-[var(--bg-color)] p-3 rounded-lg">
                        <label className="block text-sm font-semibold mb-1">Banner script link or HTML/JS code</label>
                        <textarea 
                            value={settings.adyestraAdCode || ''} 
                            onChange={(e) => handleChange('adyestraAdCode', e.target.value)}
                            placeholder="https://.../banner.js or <script>...</script>"
                            className="w-full h-32 p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg font-mono text-xs"
                        />
                        <p className="text-xs text-[var(--secondary-text-color)] mt-1">Shown at the bottom of public pages and on download pages. Paste the complete Adsterra banner code or its script URL, then save settings.</p>
                    </div>
                </div>

                <div className="border-t border-[var(--border-color)] pt-4">
                     <h3 className="font-bold text-lg mb-2">Social Links</h3>
                     <div className="space-y-3">
                        <input value={settings.socials?.telegram || ''} onChange={(e) => handleChange('socials.telegram', e.target.value)} placeholder="Telegram URL" className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg" />
                        <input value={settings.socials?.whatsapp || ''} onChange={(e) => handleChange('socials.whatsapp', e.target.value)} placeholder="WhatsApp URL" className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg" />
                        <input value={settings.socials?.instagram || ''} onChange={(e) => handleChange('socials.instagram', e.target.value)} placeholder="Instagram URL" className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg" />
                        <input value={settings.socials?.website || ''} onChange={(e) => handleChange('socials.website', e.target.value)} placeholder="Website URL" className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg" />
                     </div>
                </div>

                <button onClick={handleSave} className="bg-[var(--primary-color)] text-white font-bold py-2 px-6 rounded-lg mt-4">Save Settings</button>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
