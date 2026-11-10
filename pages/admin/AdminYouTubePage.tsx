import React, { useState, useEffect } from 'react';
import { YouTubeConfig, YouTubeApiKey } from '../../types';
import { youtubeService } from '../../services/youtubeService';

export const AdminYouTubePage: React.FC = () => {
  const [config, setConfig] = useState<YouTubeConfig>(youtubeService.getConfig());
  const [newKey, setNewKey] = useState('');
  const [bulkKeys, setBulkKeys] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [visibleKeyIndices, setVisibleKeyIndices] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingIndex, setTestingIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'keys' | 'ads'>('keys');

  useEffect(() => {
    const unsub = youtubeService.subscribeConfig((newCfg) => {
      setConfig(newCfg);
    });
    return unsub;
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleAddSingleKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    if (config.apiKeys.length >= 40) {
      showToast('error', 'Maximum limit of 40 API keys reached.');
      return;
    }
    const success = await youtubeService.addApiKey(newKey);
    if (success) {
      setNewKey('');
      showToast('success', 'YouTube API Key added successfully!');
    } else {
      showToast('error', 'Key already exists or is invalid.');
    }
  };

  const handleAddBulkKeys = async () => {
    if (!bulkKeys.trim()) return;
    const added = await youtubeService.addMultipleApiKeys(bulkKeys);
    setBulkKeys('');
    setShowBulkInput(false);
    showToast('success', `Added ${added} new YouTube API key(s)!`);
  };

  const handleRemoveKey = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      await youtubeService.removeApiKey(index);
      showToast('success', 'API Key removed.');
    }
  };

  const handleSetActive = async (index: number) => {
    await youtubeService.setActiveKey(index);
    showToast('success', `Key #${index + 1} set as active.`);
  };

  const handleResetCredits = async (index: number) => {
    await youtubeService.resetKeyCredits(index);
    showToast('success', `Credits reset for Key #${index + 1}.`);
  };

  const handleResetAllCredits = async () => {
    if (window.confirm('Reset credits for all configured keys to 0?')) {
      await youtubeService.resetAllCredits();
      showToast('success', 'All API key credits have been reset to 0!');
    }
  };

  const handleTestKey = async (index: number, keyObj: YouTubeApiKey) => {
    setTestingIndex(index);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=1&key=${keyObj.key}`
      );
      if (res.ok) {
        showToast('success', `Key #${index + 1} is VALID and active!`);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('error', `Key #${index + 1} failed: ${err.error?.message || res.statusText}`);
      }
    } catch (e: any) {
      showToast('error', `Connection error: ${e.message}`);
    } finally {
      setTestingIndex(null);
    }
  };

  const handleSaveAds = async () => {
    setSaving(true);
    try {
      await youtubeService.updateConfig({
        ads: config.ads,
        quotaPerKey: config.quotaPerKey
      });
      showToast('success', 'YouTube Settings & Ads saved successfully!');
    } catch (e: any) {
      showToast('error', 'Failed to save: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const maskKey = (key: string, isVisible: boolean) => {
    if (isVisible) return key;
    if (key.length <= 10) return '••••••••••';
    return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <i className="fab fa-youtube text-red-600 text-3xl"></i>
            YouTube & API Keys Manager
          </h1>
          <p className="text-sm text-[var(--secondary-text-color)] mt-1">
            Manage up to 40 YouTube API keys with automatic 1000-credit failover rotation and configure banner/shorts ads.
          </p>
        </div>

        {statusMessage && (
          <div
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            <i className={`fas ${statusMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('keys')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'keys'
              ? 'border-red-600 text-red-500'
              : 'border-transparent text-[var(--secondary-text-color)] hover:text-white'
          }`}
        >
          <i className="fas fa-key"></i>
          API Keys ({config.apiKeys.length}/40)
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'ads'
              ? 'border-red-600 text-red-500'
              : 'border-transparent text-[var(--secondary-text-color)] hover:text-white'
          }`}
        >
          <i className="fas fa-bullhorn"></i>
          YouTube Ads (Home & Shorts)
        </button>
      </div>

      {/* TAB 1: API KEYS */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)]">
              <span className="text-xs text-[var(--secondary-text-color)] uppercase font-semibold">Total Keys</span>
              <p className="text-2xl font-black mt-1 text-white">
                {config.apiKeys.length} <span className="text-sm font-normal text-gray-400">/ 40</span>
              </p>
            </div>

            <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)]">
              <span className="text-xs text-[var(--secondary-text-color)] uppercase font-semibold">Active Key</span>
              <p className="text-2xl font-black mt-1 text-green-400">
                Key #{config.activeKeyIndex + 1}
              </p>
            </div>

            <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)]">
              <span className="text-xs text-[var(--secondary-text-color)] uppercase font-semibold">Credits Per Key</span>
              <p className="text-2xl font-black mt-1 text-blue-400">
                {config.quotaPerKey || 1000} <span className="text-xs font-normal text-gray-400">credits</span>
              </p>
            </div>

            <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)]">
              <span className="text-xs text-[var(--secondary-text-color)] uppercase font-semibold">Auto-Failover</span>
              <p className="text-2xl font-black mt-1 text-purple-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> Enabled
              </p>
            </div>
          </div>

          {/* Add Key Form */}
          <div className="bg-[var(--card-bg)] p-5 rounded-xl border border-[var(--border-color)] space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <i className="fas fa-plus-circle text-red-500"></i> Add YouTube API Key
            </h3>

            <form onSubmit={handleAddSingleKey} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Paste API Key (e.g. AIzaSy...)"
                className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 text-white"
              />
              <button
                type="submit"
                disabled={config.apiKeys.length >= 40}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i> Add Key
              </button>
              <button
                type="button"
                onClick={() => setShowBulkInput(!showBulkInput)}
                className="bg-[var(--bg-color)] hover:bg-[#2c2c2c] border border-[var(--border-color)] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                {showBulkInput ? 'Hide Bulk' : 'Bulk Import (up to 40)'}
              </button>
            </form>

            {/* Bulk Import Area */}
            {showBulkInput && (
              <div className="bg-[var(--bg-color)] p-4 rounded-lg border border-[var(--border-color)] space-y-3">
                <label className="text-xs font-semibold text-gray-300 block">
                  Paste multiple API Keys (separated by lines, commas, or spaces):
                </label>
                <textarea
                  rows={4}
                  value={bulkKeys}
                  onChange={(e) => setBulkKeys(e.target.value)}
                  placeholder="AIzaSyKey1...&#10;AIzaSyKey2...&#10;AIzaSyKey3..."
                  className="w-full bg-[#121212] border border-[var(--border-color)] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkInput(false)}
                    className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddBulkKeys}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    Import Keys
                  </button>
                </div>
              </div>
            )}

            {/* Quota Limit Setting & Quick Reset */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--border-color)] text-xs">
              <div className="flex items-center gap-3">
                <label className="font-semibold text-gray-300">Credits per key before switching:</label>
                <input
                  type="number"
                  min="50"
                  max="10000"
                  value={config.quotaPerKey || 1000}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      quotaPerKey: Number(e.target.value) || 1000
                    }))
                  }
                  className="w-24 bg-[var(--bg-color)] border border-[var(--border-color)] rounded px-2.5 py-1 text-center font-bold text-white focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={handleSaveAds}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded font-semibold text-xs"
                >
                  Save Limit
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetAllCredits}
                className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5"
              >
                <i className="fas fa-redo-alt text-xs"></i> Reset All Credits to 0
              </button>
            </div>
          </div>

          {/* Configured Keys List */}
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="font-bold text-base text-white">Configured YouTube API Keys</h3>
              <span className="text-xs text-[var(--secondary-text-color)]">
                Active key rotates to next key automatically after 1000 credits or on quotaExceeded.
              </span>
            </div>

            {config.apiKeys.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <i className="fas fa-key text-4xl mb-2"></i>
                <p>No API keys added yet. Add at least one to enable YouTube features.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color)]">
                {config.apiKeys.map((k, idx) => {
                  const isActive = config.activeKeyIndex === idx;
                  const isVisible = !!visibleKeyIndices[idx];
                  const quotaMax = config.quotaPerKey || 1000;
                  const percent = Math.min(100, Math.round(((k.creditsUsed || 0) / quotaMax) * 100));

                  return (
                    <div key={k.key + '-' + idx} className={`p-4 transition-colors ${isActive ? 'bg-red-500/5' : ''}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Key Info */}
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-gray-400">#{idx + 1}</span>
                            {isActive && (
                              <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Active Running
                              </span>
                            )}
                            {k.status === 'exhausted' && (
                              <span className="bg-orange-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                Exhausted (1000 Credits)
                              </span>
                            )}
                            {k.status === 'error' && (
                              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                Quota Error
                              </span>
                            )}
                          </div>

                          {/* Key Text */}
                          <div className="flex items-center gap-2 font-mono text-xs text-gray-200">
                            <span>{maskKey(k.key, isVisible)}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setVisibleKeyIndices((prev) => ({ ...prev, [idx]: !prev[idx] }))
                              }
                              className="text-gray-400 hover:text-white p-1"
                              title={isVisible ? 'Hide key' : 'Show full key'}
                            >
                              <i className={`fas ${isVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          </div>

                          {/* Credits Progress */}
                          <div className="max-w-md space-y-1">
                            <div className="flex justify-between text-[11px] text-gray-400">
                              <span>Credits Used: <strong className="text-white">{k.creditsUsed || 0}</strong> / {quotaMax}</span>
                              <span>{percent}%</span>
                            </div>
                            <div className="w-full bg-[#1e1e1e] h-2 rounded-full overflow-hidden border border-white/5">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  percent >= 100 ? 'bg-red-600' : percent > 80 ? 'bg-orange-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => handleSetActive(idx)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                            >
                              Set Active
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleResetCredits(idx)}
                            className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                            title="Reset credit count to 0"
                          >
                            Reset
                          </button>

                          <button
                            type="button"
                            disabled={testingIndex === idx}
                            onClick={() => handleTestKey(idx, k)}
                            className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
                          >
                            {testingIndex === idx ? <i className="fas fa-spinner fa-spin"></i> : 'Test'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveKey(idx)}
                            className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ADS CONFIGURATION (HOME BANNER & SHORTS ADS) */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          {/* Section 1: Home Screen Banner Ads */}
          <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <i className="fas fa-image text-red-500"></i> YouTube Home Screen Banner Ads
                </h3>
                <p className="text-xs text-[var(--secondary-text-color)]">
                  Configure banner ads displayed in the YouTube Home video feed.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.ads?.homeBanner?.enabled ?? true}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ads: {
                        ...prev.ads,
                        homeBanner: {
                          ...prev.ads.homeBanner,
                          enabled: e.target.checked
                        }
                      }
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Banner Type</label>
                <select
                  value={config.ads?.homeBanner?.type || 'image'}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ads: {
                        ...prev.ads,
                        homeBanner: {
                          ...prev.ads.homeBanner,
                          type: e.target.value as 'image' | 'code'
                        }
                      }
                    }))
                  }
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="image">Custom Image Banner (Image + Click Link)</option>
                  <option value="code">HTML / Ad Script Code (Adsterra / AdSense / Custom)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Ad Frequency (Show ad every X videos)
                </label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={config.ads?.homeBanner?.frequency || 6}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ads: {
                        ...prev.ads,
                        homeBanner: {
                          ...prev.ads.homeBanner,
                          frequency: Number(e.target.value) || 6
                        }
                      }
                    }))
                  }
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              {config.ads?.homeBanner?.type === 'image' ? (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Banner Image URL</label>
                    <input
                      type="url"
                      value={config.ads?.homeBanner?.imageUrl || ''}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          ads: {
                            ...prev.ads,
                            homeBanner: {
                              ...prev.ads.homeBanner,
                              imageUrl: e.target.value
                            }
                          }
                        }))
                      }
                      placeholder="https://example.com/banner.jpg"
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Target Click URL</label>
                    <input
                      type="url"
                      value={config.ads?.homeBanner?.targetUrl || ''}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          ads: {
                            ...prev.ads,
                            homeBanner: {
                              ...prev.ads.homeBanner,
                              targetUrl: e.target.value
                            }
                          }
                        }))
                      }
                      placeholder="https://t.me/yourchannel"
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Banner Title / Caption</label>
                    <input
                      type="text"
                      value={config.ads?.homeBanner?.title || ''}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          ads: {
                            ...prev.ads,
                            homeBanner: {
                              ...prev.ads.homeBanner,
                              title: e.target.value
                            }
                          }
                        }))
                      }
                      placeholder="Join our official Telegram VIP channel"
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Ad Script / HTML Code</label>
                  <textarea
                    rows={4}
                    value={config.ads?.homeBanner?.code || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        ads: {
                          ...prev.ads,
                          homeBanner: {
                            ...prev.ads.homeBanner,
                            code: e.target.value
                          }
                        }
                      }))
                    }
                    placeholder="<script src='...'></script>"
                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-3 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              )}

              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showAtTop"
                  checked={config.ads?.homeBanner?.showAtTop ?? true}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ads: {
                        ...prev.ads,
                        homeBanner: {
                          ...prev.ads.homeBanner,
                          showAtTop: e.target.checked
                        }
                      }
                    }))
                  }
                  className="rounded text-red-600 focus:ring-0"
                />
                <label htmlFor="showAtTop" className="text-xs text-gray-300 font-medium">
                  Also show a banner ad at the top of the YouTube Home screen
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Shorts Ads */}
          <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <i className="fas fa-bolt text-red-500"></i> YouTube Shorts Ads
                </h3>
                <p className="text-xs text-[var(--secondary-text-color)]">
                  Configure sponsored ads shown in the Shorts feed.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.ads?.shortsAd?.enabled ?? true}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ads: {
                        ...prev.ads,
                        shortsAd: {
                          ...prev.ads.shortsAd,
                          enabled: e.target.checked
                        }
                      }
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Shorts Frequency (Show ad every X shorts)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.ads?.shortsAd?.frequency || 3}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ads: {
                        ...prev.ads,
                        shortsAd: {
                          ...prev.ads.shortsAd,
                          frequency: Number(e.target.value) || 3
                        }
                      }
                    }))
                  }
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={config.ads?.shortsAd?.ctaText || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ads: {
                        ...prev.ads,
                        shortsAd: {
                          ...prev.ads.shortsAd,
                          ctaText: e.target.value
                        }
                      }
                    }))
                  }
                  placeholder="Install App / Watch Now / Learn More"
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Ad Headline / Title</label>
                <input
                  type="text"
                  value={config.ads?.shortsAd?.title || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ads: {
                        ...prev.ads,
                        shortsAd: {
                          ...prev.ads.shortsAd,
                          title: e.target.value
                        }
                      }
                    }))
                  }
                  placeholder="FilmySky Premium App"
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Click URL</label>
                <input
                  type="url"
                  value={config.ads?.shortsAd?.targetUrl || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ads: {
                        ...prev.ads,
                        shortsAd: {
                          ...prev.ads.shortsAd,
                          targetUrl: e.target.value
                        }
                      }
                    }))
                  }
                  placeholder="https://t.me/filmysky_official"
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1">Media / Image URL</label>
                <input
                  type="url"
                  value={config.ads?.shortsAd?.imageUrl || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ads: {
                        ...prev.ads,
                        shortsAd: {
                          ...prev.ads.shortsAd,
                          imageUrl: e.target.value
                        }
                      }
                    }))
                  }
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={config.ads?.shortsAd?.description || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ads: {
                        ...prev.ads,
                        shortsAd: {
                          ...prev.ads.shortsAd,
                          description: e.target.value
                        }
                      }
                    }))
                  }
                  placeholder="Stream movies in 4K with lightning speed..."
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-3 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveAds}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-red-900/30 transition-all flex items-center gap-2"
            >
              {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
              Save All Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminYouTubePage;
