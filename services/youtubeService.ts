import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { YouTubeApiKey, YouTubeConfig, YouTubeVideoItem, YouTubeCommentItem } from '../types';

const STORAGE_KEY = 'filmysky_youtube_config_v1';
const HISTORY_KEY = 'filmysky_yt_history';
const LIKES_KEY = 'filmysky_yt_likes';
const SUBS_KEY = 'filmysky_yt_subs';
const SAVED_KEY = 'filmysky_yt_saved';

const DEFAULT_INITIAL_KEY = 'AIzaSyBW_ZUxDA14spnxN3osiwcPN65hEo0AIQw';

const DEFAULT_CONFIG: YouTubeConfig = {
  apiKeys: [
    {
      key: DEFAULT_INITIAL_KEY,
      creditsUsed: 0,
      maxCredits: 1000,
      status: 'active',
      lastUsed: Date.now()
    }
  ],
  activeKeyIndex: 0,
  quotaPerKey: 1000,
  ads: {
    homeBanner: {
      enabled: true,
      type: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=900&auto=format&fit=crop&q=80',
      targetUrl: 'https://t.me/filmysky_official',
      title: 'Join FilmySky VIP Telegram for fast movie & series updates',
      frequency: 6,
      showAtTop: true
    },
    shortsAd: {
      enabled: true,
      frequency: 3,
      title: 'FilmySky Premium App',
      description: 'Watch all Indian web series and 4K movies without interruptions!',
      imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
      ctaText: 'Install App',
      targetUrl: 'https://telegram.org'
    }
  }
};

class YouTubeService {
  private config: YouTubeConfig = DEFAULT_CONFIG;
  private initialized = false;
  private listeners: ((config: YouTubeConfig) => void)[] = [];

  constructor() {
    this.loadFromLocalStorage();
    this.initFirebaseSync();
  }

  private loadFromLocalStorage() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.apiKeys) && parsed.apiKeys.length > 0) {
          this.config = {
            ...DEFAULT_CONFIG,
            ...parsed,
            ads: {
              ...DEFAULT_CONFIG.ads,
              ...(parsed.ads || {})
            }
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load YouTube config from localStorage:', e);
    }
  }

  private initFirebaseSync() {
    if (this.initialized) return;
    try {
      if (firebase.apps.length) {
        const db = firebase.database();
        const ref = db.ref('filmysky/youtubeConfig');
        ref.on('value', (snapshot) => {
          const data = snapshot.val();
          if (data && Array.isArray(data.apiKeys) && data.apiKeys.length > 0) {
            this.config = {
              ...DEFAULT_CONFIG,
              ...data,
              ads: {
                ...DEFAULT_CONFIG.ads,
                ...(data.ads || {})
              }
            };
            this.saveToLocalStorage();
            this.notifyListeners();
          } else {
            // First time seeding to Firebase
            ref.set(this.config).catch(() => {});
          }
        });
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Firebase sync not ready, using local storage:', e);
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.getConfig());
      } catch (err) {
        console.error('Error in YouTube config listener:', err);
      }
    });
  }

  public subscribeConfig(listener: (config: YouTubeConfig) => void): () => void {
    this.listeners.push(listener);
    listener(this.getConfig());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getConfig(): YouTubeConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  public async updateConfig(newConfig: Partial<YouTubeConfig>): Promise<void> {
    this.config = {
      ...this.config,
      ...newConfig,
      ads: {
        ...this.config.ads,
        ...(newConfig.ads || {})
      }
    };
    this.saveToLocalStorage();
    this.notifyListeners();

    try {
      if (firebase.apps.length) {
        await firebase.database().ref('filmysky/youtubeConfig').update(this.config);
      }
    } catch (e) {
      console.warn('Firebase update failed, cached locally:', e);
    }
  }

  public async addApiKey(rawKey: string): Promise<boolean> {
    const key = rawKey.trim();
    if (!key) return false;
    if (this.config.apiKeys.some((k) => k.key === key)) return false;
    if (this.config.apiKeys.length >= 40) return false;

    const newKey: YouTubeApiKey = {
      key,
      creditsUsed: 0,
      maxCredits: this.config.quotaPerKey || 1000,
      status: this.config.apiKeys.length === 0 ? 'active' : 'available',
      lastUsed: Date.now()
    };

    const updatedKeys = [...this.config.apiKeys, newKey];
    await this.updateConfig({ apiKeys: updatedKeys });
    return true;
  }

  public async addMultipleApiKeys(rawKeysText: string): Promise<number> {
    const lines = rawKeysText.split(/[\n,;\s]+/).map((k) => k.trim()).filter(Boolean);
    let addedCount = 0;
    const currentKeys = [...this.config.apiKeys];

    for (const key of lines) {
      if (currentKeys.length >= 40) break;
      if (!currentKeys.some((k) => k.key === key)) {
        currentKeys.push({
          key,
          creditsUsed: 0,
          maxCredits: this.config.quotaPerKey || 1000,
          status: currentKeys.length === 0 ? 'active' : 'available',
          lastUsed: Date.now()
        });
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await this.updateConfig({ apiKeys: currentKeys });
    }
    return addedCount;
  }

  public async removeApiKey(index: number): Promise<void> {
    if (index < 0 || index >= this.config.apiKeys.length) return;
    const updated = [...this.config.apiKeys];
    updated.splice(index, 1);

    let activeIdx = this.config.activeKeyIndex;
    if (activeIdx >= updated.length) {
      activeIdx = Math.max(0, updated.length - 1);
    }
    if (updated[activeIdx]) {
      updated[activeIdx].status = 'active';
    }

    await this.updateConfig({
      apiKeys: updated,
      activeKeyIndex: activeIdx
    });
  }

  public async setActiveKey(index: number): Promise<void> {
    if (index < 0 || index >= this.config.apiKeys.length) return;
    const updated = this.config.apiKeys.map((k, i) => ({
      ...k,
      status: (i === index ? 'active' : k.status === 'active' ? 'available' : k.status) as any
    }));

    await this.updateConfig({
      apiKeys: updated,
      activeKeyIndex: index
    });
  }

  public async resetKeyCredits(index: number): Promise<void> {
    if (index < 0 || index >= this.config.apiKeys.length) return;
    const updated = [...this.config.apiKeys];
    updated[index] = {
      ...updated[index],
      creditsUsed: 0,
      status: this.config.activeKeyIndex === index ? 'active' : 'available',
      errorReason: undefined
    };
    await this.updateConfig({ apiKeys: updated });
  }

  public async resetAllCredits(): Promise<void> {
    const updated = this.config.apiKeys.map((k, i) => ({
      ...k,
      creditsUsed: 0,
      status: (i === this.config.activeKeyIndex ? 'active' : 'available') as any,
      errorReason: undefined
    }));
    await this.updateConfig({ apiKeys: updated });
  }

  /**
   * Automatic rotation helper: selects the next key when current reaches 1000 credits or hits quota
   */
  private rotateToNextKey(exhaustedIndex: number, reason = 'Quota limit reached (1000 credits)'): string | null {
    const keys = [...this.config.apiKeys];
    if (keys[exhaustedIndex]) {
      keys[exhaustedIndex].status = 'exhausted';
      keys[exhaustedIndex].errorReason = reason;
    }

    // Look for next available key
    let nextIndex = -1;
    for (let i = 1; i <= keys.length; i++) {
      const idx = (exhaustedIndex + i) % keys.length;
      if (keys[idx] && keys[idx].status !== 'exhausted' && keys[idx].creditsUsed < (this.config.quotaPerKey || 1000)) {
        nextIndex = idx;
        break;
      }
    }

    if (nextIndex !== -1) {
      keys[nextIndex].status = 'active';
      this.config = {
        ...this.config,
        apiKeys: keys,
        activeKeyIndex: nextIndex
      };
      this.saveToLocalStorage();
      this.notifyListeners();
      try {
        if (firebase.apps.length) {
          firebase.database().ref('filmysky/youtubeConfig').update({
            apiKeys: keys,
            activeKeyIndex: nextIndex
          }).catch(() => {});
        }
      } catch (e) {}
      return keys[nextIndex].key;
    }

    return null;
  }

  /**
   * Execute YouTube API call with automatic key rotation and credit tracking
   */
  public async executeYouTubeRequest<T>(endpoint: string, params: Record<string, string>, retryCount = 0): Promise<T> {
    if (this.config.apiKeys.length === 0) {
      throw new Error('No YouTube API keys configured');
    }

    let currentIndex = this.config.activeKeyIndex;
    let currentKeyObj = this.config.apiKeys[currentIndex];

    // Check if current key exceeded limit of 1000 credits
    const quotaLimit = this.config.quotaPerKey || 1000;
    if (!currentKeyObj || currentKeyObj.creditsUsed >= quotaLimit || currentKeyObj.status === 'exhausted') {
      const nextKey = this.rotateToNextKey(currentIndex, 'Quota limit reached (1000 credits)');
      if (!nextKey) {
        throw new Error('All configured YouTube API keys have exhausted their quota');
      }
      currentIndex = this.config.activeKeyIndex;
      currentKeyObj = this.config.apiKeys[currentIndex];
    }

    const searchParams = new URLSearchParams({
      ...params,
      key: currentKeyObj.key
    });

    const url = `https://www.googleapis.com/youtube/v3/${endpoint}?${searchParams.toString()}`;

    try {
      const response = await fetch(url);

      // Track credit usage (1 request = 1 credit used)
      this.config.apiKeys[currentIndex].creditsUsed = (this.config.apiKeys[currentIndex].creditsUsed || 0) + 1;
      this.config.apiKeys[currentIndex].lastUsed = Date.now();
      this.saveToLocalStorage();

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const reason = errData?.error?.errors?.[0]?.reason || errData?.error?.message || response.statusText;

        // Quota exceeded or forbidden -> rotate immediately
        if (response.status === 403 || reason?.toLowerCase().includes('quota') || reason?.toLowerCase().includes('limit')) {
          console.warn(`YouTube API Key ${currentIndex + 1} quota exhausted (${reason}). Rotating to next key...`);
          if (retryCount < this.config.apiKeys.length) {
            this.rotateToNextKey(currentIndex, `Quota error: ${reason}`);
            return this.executeYouTubeRequest<T>(endpoint, params, retryCount + 1);
          }
        }

        throw new Error(reason || `YouTube API Error (${response.status})`);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (retryCount < this.config.apiKeys.length && (err.message?.includes('quota') || err.message?.includes('403'))) {
        this.rotateToNextKey(currentIndex, err.message);
        return this.executeYouTubeRequest<T>(endpoint, params, retryCount + 1);
      }
      throw err;
    }
  }

  // API Methods

  /**
   * Fetch Trending / Popular videos
   */
  public async getTrendingVideos(regionCode = 'IN', videoCategoryId?: string): Promise<YouTubeVideoItem[]> {
    try {
      const params: Record<string, string> = {
        part: 'snippet,contentDetails,statistics',
        chart: 'mostPopular',
        regionCode,
        maxResults: '24'
      };
      if (videoCategoryId && videoCategoryId !== '0') {
        params.videoCategoryId = videoCategoryId;
      }

      const data: any = await this.executeYouTubeRequest('videos', params);
      if (data && Array.isArray(data.items)) {
        return data.items.map((item: any) => this.formatVideoItem(item));
      }
      return this.getFallbackVideos();
    } catch (err) {
      console.warn('Using fallback videos due to API error:', err);
      return this.getFallbackVideos();
    }
  }

  /**
   * Search Videos by keyword or category
   */
  public async searchVideos(query: string, pageToken?: string): Promise<{ items: YouTubeVideoItem[]; nextPageToken?: string }> {
    try {
      const params: Record<string, string> = {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: '24',
        regionCode: 'IN'
      };
      if (pageToken) params.pageToken = pageToken;

      const data: any = await this.executeYouTubeRequest('search', params);
      if (data && Array.isArray(data.items)) {
        const videoIds = data.items.map((i: any) => i.id?.videoId).filter(Boolean).join(',');
        
        // Enrich with statistics and duration if ids present
        let detailsMap: Record<string, any> = {};
        if (videoIds) {
          try {
            const detailsData: any = await this.executeYouTubeRequest('videos', {
              part: 'snippet,contentDetails,statistics',
              id: videoIds
            });
            if (detailsData?.items) {
              detailsData.items.forEach((item: any) => {
                detailsMap[item.id] = item;
              });
            }
          } catch (e) {}
        }

        const items = data.items.map((item: any) => {
          const id = item.id?.videoId || item.id;
          const detail = detailsMap[id];
          return this.formatVideoItem(detail || item);
        });

        return { items, nextPageToken: data.nextPageToken };
      }
      return { items: this.getFallbackVideos().filter(v => v.title.toLowerCase().includes(query.toLowerCase())) };
    } catch (err) {
      console.warn('Search API fallback:', err);
      const filtered = this.getFallbackVideos().filter(v => 
        v.title.toLowerCase().includes(query.toLowerCase()) || 
        v.description.toLowerCase().includes(query.toLowerCase())
      );
      return { items: filtered.length > 0 ? filtered : this.getFallbackVideos() };
    }
  }

  /**
   * Get single video details
   */
  public async getVideoDetails(videoId: string): Promise<YouTubeVideoItem | null> {
    try {
      const data: any = await this.executeYouTubeRequest('videos', {
        part: 'snippet,contentDetails,statistics',
        id: videoId
      });
      if (data?.items?.[0]) {
        return this.formatVideoItem(data.items[0]);
      }
    } catch (err) {
      console.warn('Video details fallback:', err);
    }

    const fallback = this.getFallbackVideos().find((v) => v.id === videoId);
    if (fallback) return fallback;

    return {
      id: videoId,
      title: 'YouTube Video',
      description: 'Streamed seamlessly without external popups or third-party ads on FilmySky.',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      channelId: 'channel_filmysky',
      channelTitle: 'FilmySky Creator',
      publishedAt: new Date().toISOString(),
      viewCount: '1,450,230',
      duration: '14:20',
      likeCount: '85,400',
      commentCount: '1,240'
    };
  }

  /**
   * Get Related / Recommended videos
   */
  public async getRelatedVideos(videoId: string): Promise<YouTubeVideoItem[]> {
    try {
      const data: any = await this.executeYouTubeRequest('search', {
        part: 'snippet',
        relatedToVideoId: videoId,
        type: 'video',
        maxResults: '16'
      });
      if (data?.items) {
        return data.items.map((i: any) => this.formatVideoItem(i));
      }
    } catch (e) {}
    return this.getFallbackVideos().filter((v) => v.id !== videoId);
  }

  /**
   * Get Video Comments
   */
  public async getVideoComments(videoId: string): Promise<YouTubeCommentItem[]> {
    try {
      const data: any = await this.executeYouTubeRequest('commentThreads', {
        part: 'snippet',
        videoId,
        maxResults: '20',
        order: 'relevance'
      });
      if (data?.items) {
        return data.items.map((item: any) => {
          const top = item.snippet?.topLevelComment?.snippet;
          return {
            id: item.id,
            authorName: top?.authorDisplayName || 'Viewer',
            authorProfileImageUrl: top?.authorProfileImageUrl,
            textDisplay: top?.textDisplay || '',
            likeCount: top?.likeCount || 0,
            publishedAt: top?.publishedAt || new Date().toISOString()
          };
        });
      }
    } catch (e) {}

    return [
      {
        id: 'c1',
        authorName: 'Rahul Verma',
        textDisplay: 'Awesome video quality! Loved watching this on FilmySky without annoying ads.',
        likeCount: 42,
        publishedAt: '2 hours ago'
      },
      {
        id: 'c2',
        authorName: 'Priya Sharma',
        textDisplay: 'Sound and picture clarity are so clean. Great playback!',
        likeCount: 19,
        publishedAt: '5 hours ago'
      },
      {
        id: 'c3',
        authorName: 'Amit Patel',
        textDisplay: 'Best video feed interface. Clean and fast!',
        likeCount: 11,
        publishedAt: '1 day ago'
      }
    ];
  }

  /**
   * Get YouTube Shorts videos
   */
  public async getShorts(): Promise<YouTubeVideoItem[]> {
    try {
      const searchRes: any = await this.executeYouTubeRequest('search', {
        part: 'snippet',
        q: '#shorts trending hindi',
        type: 'video',
        videoDuration: 'short',
        maxResults: '24',
        regionCode: 'IN'
      });
      if (searchRes?.items) {
        return searchRes.items.map((i: any) => ({
          ...this.formatVideoItem(i),
          isShort: true
        }));
      }
    } catch (e) {}

    return this.getFallbackShorts();
  }

  private formatVideoItem(item: any): YouTubeVideoItem {
    const id = typeof item.id === 'string' ? item.id : item.id?.videoId || 'dQw4w9WgXcQ';
    const snip = item.snippet || {};
    const stats = item.statistics || {};
    const content = item.contentDetails || {};

    const thumbnails = snip.thumbnails || {};
    const thumbUrl =
      thumbnails.maxres?.url ||
      thumbnails.high?.url ||
      thumbnails.medium?.url ||
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

    return {
      id,
      title: snip.title || 'YouTube Video',
      description: snip.description || '',
      thumbnail: thumbUrl,
      channelId: snip.channelId || '',
      channelTitle: snip.channelTitle || 'Channel',
      publishedAt: snip.publishedAt || new Date().toISOString(),
      viewCount: this.formatViewCount(stats.viewCount),
      duration: this.formatDuration(content.duration),
      likeCount: this.formatViewCount(stats.likeCount),
      commentCount: this.formatViewCount(stats.commentCount)
    };
  }

  public formatViewCount(views?: string | number): string {
    if (!views) return '240K';
    const num = Number(views);
    if (isNaN(num)) return String(views);
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return String(num);
  }

  public formatDuration(isoDuration?: string): string {
    if (!isoDuration) return '12:30';
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '10:00';
    const hours = match[1] ? Number(match[1]) : 0;
    const minutes = match[2] ? Number(match[2]) : 0;
    const seconds = match[3] ? Number(match[3]) : 0;

    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${minutes}:${pad(seconds)}`;
  }

  public formatRelativeTime(dateString?: string): string {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  }

  // Local storage utilities for User Actions

  public getWatchHistory(): YouTubeVideoItem[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public addToWatchHistory(video: YouTubeVideoItem): void {
    try {
      const history = this.getWatchHistory().filter((v) => v.id !== video.id);
      history.unshift(video);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    } catch {}
  }

  public clearWatchHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
  }

  public getLikedVideos(): YouTubeVideoItem[] {
    try {
      const data = localStorage.getItem(LIKES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public isLiked(videoId: string): boolean {
    return this.getLikedVideos().some((v) => v.id === videoId);
  }

  public toggleLikeVideo(video: YouTubeVideoItem): boolean {
    const list = this.getLikedVideos();
    const index = list.findIndex((v) => v.id === video.id);
    let isNowLiked = false;
    if (index >= 0) {
      list.splice(index, 1);
      isNowLiked = false;
    } else {
      list.unshift(video);
      isNowLiked = true;
    }
    localStorage.setItem(LIKES_KEY, JSON.stringify(list));
    return isNowLiked;
  }

  public getSavedVideos(): YouTubeVideoItem[] {
    try {
      const data = localStorage.getItem(SAVED_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public isSaved(videoId: string): boolean {
    return this.getSavedVideos().some((v) => v.id === videoId);
  }

  public toggleSaveVideo(video: YouTubeVideoItem): boolean {
    const list = this.getSavedVideos();
    const index = list.findIndex((v) => v.id === video.id);
    let isNowSaved = false;
    if (index >= 0) {
      list.splice(index, 1);
      isNowSaved = false;
    } else {
      list.unshift(video);
      isNowSaved = true;
    }
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
    return isNowSaved;
  }

  public getSubscribedChannels(): { id: string; title: string; avatar: string }[] {
    try {
      const data = localStorage.getItem(SUBS_KEY);
      return data ? JSON.parse(data) : [
        { id: 'tseries', title: 'T-Series', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=60' },
        { id: 'setindia', title: 'SET India', avatar: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=100&auto=format&fit=crop&q=60' },
        { id: 'bbkimyvines', title: 'BB Ki Vines', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' }
      ];
    } catch {
      return [];
    }
  }

  public isSubscribed(channelTitle: string): boolean {
    return this.getSubscribedChannels().some((c) => c.title === channelTitle);
  }

  public toggleSubscribe(channel: { id?: string; title: string; avatar?: string }): boolean {
    const list = this.getSubscribedChannels();
    const index = list.findIndex((c) => c.title === channel.title);
    let isNowSubbed = false;
    if (index >= 0) {
      list.splice(index, 1);
      isNowSubbed = false;
    } else {
      list.push({
        id: channel.id || channel.title.toLowerCase().replace(/\s+/g, '-'),
        title: channel.title,
        avatar: channel.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'
      });
      isNowSubbed = true;
    }
    localStorage.setItem(SUBS_KEY, JSON.stringify(list));
    return isNowSubbed;
  }

  // Fallback data for smooth offline / quota-exhaustion fallback
  private getFallbackVideos(): YouTubeVideoItem[] {
    return [
      {
        id: 'L0MK7qz13bU',
        title: 'Fighter: Official Teaser | Hrithik Roshan, Deepika Padukone, Anil Kapoor',
        description: 'Watch the high-octane action thriller teaser of Fighter featuring Hrithik Roshan and Deepika Padukone.',
        thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
        channelId: 'tseries',
        channelTitle: 'T-Series',
        publishedAt: '2024-01-15T10:00:00Z',
        viewCount: '48.2M',
        duration: '1:45',
        likeCount: '1.2M',
        commentCount: '45.1K'
      },
      {
        id: 'kJQP7kiw5Fk',
        title: 'Luis Fonsi - Despacito ft. Daddy Yankee (Official Music Video)',
        description: 'Experience the record-breaking global hit music video.',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        channelId: 'luisfonsi',
        channelTitle: 'Luis Fonsi',
        publishedAt: '2017-01-13T05:00:00Z',
        viewCount: '8.4B',
        duration: '4:42',
        likeCount: '52.3M',
        commentCount: '4.2M'
      },
      {
        id: 'dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
        description: 'The legendary music video remastered in high definition.',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
        channelId: 'rickastley',
        channelTitle: 'Rick Astley',
        publishedAt: '2009-10-25T07:00:00Z',
        viewCount: '1.5B',
        duration: '3:33',
        likeCount: '16.4M',
        commentCount: '2.5M'
      },
      {
        id: 'jfKfPfyJRdk',
        title: 'lofi hip hop radio 📚 - beats to relax/study to',
        description: 'Chill and relax with ambient lo-fi beats live streaming 24/7.',
        thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
        channelId: 'lofigirl',
        channelTitle: 'Lofi Girl',
        publishedAt: '2023-07-12T12:00:00Z',
        viewCount: '24.8M',
        duration: 'LIVE',
        likeCount: '3.1M',
        commentCount: '120K'
      },
      {
        id: 'JGwWNGJdvx8',
        title: 'Ed Sheeran - Shape of You (Official Music Video)',
        description: 'Official music video for Ed Sheeran - Shape of You.',
        thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
        channelId: 'edsheeran',
        channelTitle: 'Ed Sheeran',
        publishedAt: '2017-01-30T11:00:00Z',
        viewCount: '6.2B',
        duration: '4:24',
        likeCount: '33.1M',
        commentCount: '1.2M'
      },
      {
        id: 'hT_nvWreIhg',
        title: 'OneRepublic - Counting Stars (Official Music Video)',
        description: 'Official Music Video for Counting Stars performed by OneRepublic.',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        channelId: 'onerepublic',
        channelTitle: 'OneRepublic',
        publishedAt: '2013-05-31T07:00:00Z',
        viewCount: '4.0B',
        duration: '4:44',
        likeCount: '17.8M',
        commentCount: '420K'
      }
    ];
  }

  private getFallbackShorts(): YouTubeVideoItem[] {
    return [
      {
        id: '3JZ_D3ELwOQ',
        title: 'Incredible stunt by team riders! 🔥 #shorts #trending',
        description: 'Watch this mind-blowing trick performed on live stage.',
        thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        channelId: 'c_shorts_1',
        channelTitle: 'Action Mania',
        publishedAt: new Date().toISOString(),
        viewCount: '5.2M',
        duration: '0:45',
        likeCount: '420K',
        commentCount: '1.8K',
        isShort: true
      },
      {
        id: '9bZkp7q19f0',
        title: 'Hilarious comedy moment on set 🤣 #shorts #comedy',
        description: 'Behind the scenes laughter with the crew.',
        thumbnail: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&auto=format&fit=crop&q=80',
        channelId: 'c_shorts_2',
        channelTitle: 'Desi Laughs',
        publishedAt: new Date().toISOString(),
        viewCount: '8.1M',
        duration: '0:32',
        likeCount: '780K',
        commentCount: '3.4K',
        isShort: true
      },
      {
        id: 'fJ9rUzIMcZQ',
        title: 'Most satisfying cooking skills! 🍳 #shorts #food',
        description: 'Street food chef demonstrates lightning speed.',
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        channelId: 'c_shorts_3',
        channelTitle: 'Street Food King',
        publishedAt: new Date().toISOString(),
        viewCount: '3.9M',
        duration: '0:58',
        likeCount: '310K',
        commentCount: '890',
        isShort: true
      }
    ];
  }
}

export const youtubeService = new YouTubeService();
