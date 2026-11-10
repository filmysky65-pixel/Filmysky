
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/storage';
import 'firebase/compat/messaging';
import { User, Content, LiveTvNetwork, LiveTvStream, UpcomingContent, SubscriptionPlan, Comment, ContentRequest, PaymentRequest, AdCampaign, WalletTransaction, AppSettings, ContactMessage } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyCJRUp-c9_zeqT6RTjrqf81MOZyI53QZqI",
  authDomain: "filmysky-3454b.firebaseapp.com",
  databaseURL: "https://filmysky-3454b-default-rtdb.firebaseio.com",
  projectId: "filmysky-3454b",
  storageBucket: "filmysky-3454b.firebasestorage.app",
  messagingSenderId: "146408648284",
  appId: "1:146408648284:web:b8cb1891a533a24119c099",
  measurementId: "G-GT8CLQYYL4"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Prefer WebSockets to avoid RTDB long-polling URLs that Googlebot can't fetch.
try {
  const databaseNamespace = firebase.database as unknown as { INTERNAL?: { forceWebSockets?: () => void } };
  databaseNamespace.INTERNAL?.forceWebSockets?.();
} catch (error) {
  console.warn('Firebase RTDB transport override failed:', error);
}

export const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();
export const messaging = firebase.messaging.isSupported() ? firebase.messaging() : null;

const CONTENT_REST_URL = 'https://filmysky-3454b-default-rtdb.firebaseio.com/filmysky/content.json';

// Helper to reliably parse date for sorting
const parseDate = (date: string | number | undefined): number => {
    if (!date) return 0;
    if (typeof date === 'number') return date;
    const parsed = Date.parse(date);
    return isNaN(parsed) ? 0 : parsed;
};

const buildContentRestUrl = (params?: Record<string, unknown>) => {
    const url = new URL(CONTENT_REST_URL);
    if (!params) return url.toString();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        url.searchParams.set(key, JSON.stringify(value));
    });
    return url.toString();
};

const fetchContentMap = async (params?: Record<string, unknown>): Promise<Record<string, Content>> => {
    const response = await fetch(buildContentRestUrl(params), {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error(`Content fetch failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data || {};
};

const mapAndSortContent = (data: Record<string, Content>) => {
    const contentList: Content[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
    contentList.sort((a, b) => {
        const timeA = parseDate(a.createdAt);
        const timeB = parseDate(b.createdAt);
        if (timeA !== timeB) return timeB - timeA;
        return b.id.localeCompare(a.id);
    });
    return contentList;
};

// USER MANAGEMENT
export const getUserProfile = async (uid: string): Promise<User | null> => {
    try {
        const snapshot = await db.ref(`filmysky/users/${uid}`).once('value');
        return snapshot.val();
    } catch (error) {
        console.error(`Error reading user profile for uid: ${uid}:`, error);
        return null;
    }
};

export const createAnonymousUserProfile = async (uid:string): Promise<User> => {
    const newUser: User = {
        id: uid, name: `Guest_${uid.slice(0, 4)}`, email: null, isAnonymous: true,
        role: false, createdAt: Date.now(), viewCount: 0,
        walletBalance: 0
    };
    await db.ref(`filmysky/users/${uid}`).set(newUser);
    return newUser;
};

export const createUserProfile = async (uid: string, name: string, email: string): Promise<User> => {
    const newUser: User = {
        id: uid, name, email, isAnonymous: false,
        role: false, createdAt: Date.now(), viewCount: 0,
        walletBalance: 0
    };
    await db.ref(`filmysky/users/${uid}`).set(newUser);
    return newUser;
};

export const updateUserProfile = async (uid: string, name: string, email: string): Promise<void> => {
    await db.ref(`filmysky/users/${uid}`).update({ name, email, isAnonymous: false });
};

// Content
export const getLatestHomeContent = (callback: (content: Content[]) => void, limit = 200) => {
    // Keep home payload light for faster initial loads.
    let cancelled = false;
    const load = async () => {
        try {
            const data = await fetchContentMap({ orderBy: '$key', limitToLast: limit });
            if (cancelled) return;
            const contentList = mapAndSortContent(data).slice(0, limit);
            callback(contentList);
        } catch (error) {
            console.error('Error loading latest home content:', error);
            if (!cancelled) callback([]);
        }
    };
    load();
    return () => {
        cancelled = true;
    };
};

export const getPaginatedContent = async (filterField: 'type' | 'category', filterValue: string, limit: number, lastItemKey?: string): Promise<{ data: Content[], lastKey: string | null }> => {
    try {
        const data = await fetchContentMap();
        const filtered = mapAndSortContent(data).filter(item => item[filterField] === filterValue);
        const startIndex = lastItemKey ? filtered.findIndex(item => item.id === lastItemKey) + 1 : 0;
        const pageItems = filtered.slice(startIndex, startIndex + limit);
        const newLastKey = pageItems.length > 0 ? pageItems[pageItems.length - 1].id : null;
        return { data: pageItems, lastKey: newLastKey };
    } catch (error) { 
        console.error("Pagination Error:", error);
        return { data: [], lastKey: null }; 
    }
};

export const getAllContent = (callback: (content: Content[]) => void) => {
    let cancelled = false;
    const load = async () => {
        try {
            const data = await fetchContentMap();
            if (cancelled) return;
            const contentList = mapAndSortContent(data);
            callback(contentList);
        } catch (error) {
            console.error('Error loading content:', error);
            if (!cancelled) callback([]);
        }
    };
    load();
    return () => {
        cancelled = true;
    };
};

export const getContentById = async (id: string): Promise<Content | null> => {
    try {
        const data = await fetchContentMap({ orderBy: '$key', equalTo: id });
        const value = data[id];
        return value ? { ...value, id } : null;
    } catch (error) {
        console.error(`Error loading content id ${id}:`, error);
        return null;
    }
};

export const getUpcomingContent = (callback: (content: UpcomingContent[]) => void) => {
    const ref = db.ref('filmysky/upcoming');
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        const list: UpcomingContent[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(list);
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};

export const updateUserWatchlist = async (userId: string, contentId: string, isAdding: boolean): Promise<void> => {
    const watchlistRef = db.ref(`filmysky/users/${userId}/watchlist/${contentId}`);
    if (isAdding) await watchlistRef.set(true);
    else await watchlistRef.remove();
};

export const incrementViewCount = async (userId: string) => {
    const userRef = db.ref(`filmysky/users/${userId}/viewCount`);
    await userRef.set(firebase.database.ServerValue.increment(1));
};

export const incrementContentViewCount = async (contentId: string) => {
    await db.ref(`filmysky/content/${contentId}/views`).transaction((currentViews) => {
        return (currentViews || 0) + 1;
    }).catch(e => console.error("Error incrementing content view:", e));
};

export const getComments = (contentId: string, callback: (comments: Comment[]) => void) => {
    const ref = db.ref(`filmysky/comments/${contentId}`).orderByChild('timestamp');
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        const list: Comment[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(list.reverse());
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};

export const addComment = async (contentId: string, userId: string, userName: string, text: string): Promise<any> => {
    const ref = db.ref(`filmysky/comments/${contentId}`).push();
    await ref.set({ userId, userName, text, timestamp: firebase.database.ServerValue.TIMESTAMP });
};

export const addContentRequest = async (userId: string, userName: string, title: string, type: 'Movie' | 'Series', notes: string): Promise<any> => {
    const newRequestRef = db.ref('filmysky/requests').push();
    await newRequestRef.set({ userId, userName, title, type, notes, status: 'pending', requestedAt: firebase.database.ServerValue.TIMESTAMP });
};

// ============================================================================
// ADVERTISER & WALLET SYSTEM
// ============================================================================

export const getAdvertiserCampaigns = (userId: string, callback: (campaigns: AdCampaign[]) => void) => {
    const ref = db.ref('filmysky/ads').orderByChild('userId').equalTo(userId);
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        const list: AdCampaign[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(list.reverse());
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};

export const getAllCampaigns = (callback: (campaigns: AdCampaign[]) => void) => {
    const ref = db.ref('filmysky/ads').orderByChild('createdAt');
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        const list: AdCampaign[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(list.reverse());
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
}

export const createAdCampaign = async (campaignData: Omit<AdCampaign, 'id' | 'spent' | 'status' | 'stats' | 'createdAt'>): Promise<{success: boolean, message: string}> => {
    const userRef = db.ref(`filmysky/users/${campaignData.userId}`);
    const userSnap = await userRef.once('value');
    const user: User = userSnap.val();

    if (user.role) {
        const newAdRef = db.ref('filmysky/ads').push();
        const campaign: AdCampaign = {
            ...campaignData,
            id: newAdRef.key!,
            spent: 0,
            status: 'active',
            stats: { views: 0, clicks: 0 },
            createdAt: Date.now()
        };
        await newAdRef.set(campaign);
        return { success: true, message: 'Admin Campaign created (Active).' };
    }

    const settingsSnap = await db.ref('filmysky/appSettings/adConfig').once('value');
    const adConfig = settingsSnap.val() || {};
    const minBudgets = adConfig.minBudgets || { youtube: 50, website: 50, video: 50 };

    let requiredMin = 50;
    if (campaignData.adType === 'video') requiredMin = minBudgets.video;
    else if (campaignData.subType === 'youtube') requiredMin = minBudgets.youtube;
    else requiredMin = minBudgets.website;

    if (campaignData.budget < requiredMin) {
        return { success: false, message: `Minimum budget for this ad type is ₹${requiredMin}` };
    }

    if ((user.walletBalance || 0) < campaignData.budget) {
        return { success: false, message: 'Insufficient wallet balance.' };
    }

    try {
        await db.ref().transaction(async (root) => {
            if (!root) return root;
            const userPath = `filmysky/users/${campaignData.userId}`;
            const userData = root.child(userPath).val();
            if (userData && (userData.walletBalance || 0) >= campaignData.budget) {
                userData.walletBalance -= campaignData.budget;
                root.child(userPath).update(userData);
                const txnId = root.child('filmysky/transactions').push().key;
                root.child(`filmysky/transactions/${txnId}`).set({
                    userId: campaignData.userId,
                    amount: campaignData.budget,
                    type: 'debit',
                    description: `Budget Locked: ${campaignData.name}`,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });
                const adId = root.child('filmysky/ads').push().key;
                const campaign: AdCampaign = {
                    ...campaignData,
                    id: adId!,
                    spent: 0,
                    status: 'pending',
                    stats: { views: 0, clicks: 0 },
                    createdAt: firebase.database.ServerValue.TIMESTAMP as any
                };
                root.child(`filmysky/ads/${adId}`).set(campaign);
            } else {
                return; 
            }
            return root;
        });
        return { success: true, message: 'Campaign submitted for approval.' };
    } catch (e: any) {
        return { success: false, message: 'Transaction failed: ' + e.message };
    }
};

export const toggleAdStatus = async (adId: string, currentStatus: AdCampaign['status']) => {
    if (currentStatus === 'completed' || currentStatus === 'rejected' || currentStatus === 'pending') return;
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await db.ref(`filmysky/ads/${adId}`).update({ status: newStatus });
};

export const updateAdCampaignStatus = async (adId: string, status: 'active' | 'rejected'): Promise<void> => {
    const adRef = db.ref(`filmysky/ads/${adId}`);
    const adSnap = await adRef.once('value');
    const ad: AdCampaign = adSnap.val();
    if (!ad) return;

    if (status === 'rejected' && ad.status === 'pending') {
        await db.ref().transaction(async (root) => {
            if (!root) return root;
            const userPath = `filmysky/users/${ad.userId}`;
            const userData = root.child(userPath).val();
            if (userData) {
                userData.walletBalance = (userData.walletBalance || 0) + ad.budget;
                root.child(userPath).update(userData);
                const txnId = root.child('filmysky/transactions').push().key;
                root.child(`filmysky/transactions/${txnId}`).set({
                    userId: ad.userId,
                    amount: ad.budget,
                    type: 'credit',
                    description: `Refund: Campaign Rejected (${ad.name})`,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });
            }
            root.child(`filmysky/ads/${adId}/status`).set('rejected');
            return root;
        });
    } else {
        await adRef.update({ status });
    }
};

export const serveAd = async (type: 'interstitial' | 'video', category?: string): Promise<AdCampaign | null> => {
    const settingsSnap = await db.ref('filmysky/appSettings/adConfig').once('value');
    const config = settingsSnap.val();
    if (config && config.masterSwitch) {
        if (typeof config.masterSwitch === 'object') {
            if (type === 'video' && config.masterSwitch.video === false) return null;
            if (type === 'interstitial' && config.masterSwitch.interstitial === false) return null;
        } else if (config.masterSwitch === false) {
            return null; 
        }
    }
    const adsRef = db.ref('filmysky/ads');
    const snapshot = await adsRef.orderByChild('status').equalTo('active').once('value');
    const adsData = snapshot.val();
    if (!adsData) return null;
    let validAds: AdCampaign[] = Object.values(adsData);
    validAds = validAds.filter(ad => ad.adType === type);
    if (category) {
        validAds = validAds.filter(ad => ad.targetCategory === 'All' || ad.targetCategory.toLowerCase() === category.toLowerCase());
    }
    validAds = validAds.filter(ad => ad.budget > ad.spent);
    if (validAds.length === 0) return null;
    const randomAd = validAds[Math.floor(Math.random() * validAds.length)];
    return randomAd;
};

export const recordAdView = async (ad: AdCampaign) => {
    if (!ad || !ad.id) return;
    const cost = ad.costPerView || 0.01; 
    const updates: any = {};
    updates[`filmysky/ads/${ad.id}/stats/views`] = firebase.database.ServerValue.increment(1);
    updates[`filmysky/ads/${ad.id}/spent`] = firebase.database.ServerValue.increment(cost);
    await db.ref().update(updates);
};

export const recordAdClick = async (ad: AdCampaign) => {
    if (!ad || !ad.id) return;
    const cost = ad.costPerClick || 0.05; 
    const updates: any = {};
    updates[`filmysky/ads/${ad.id}/stats/clicks`] = firebase.database.ServerValue.increment(1);
    updates[`filmysky/ads/${ad.id}/spent`] = firebase.database.ServerValue.increment(cost);
    await db.ref().update(updates);
};

export const getUserWallet = async (userId: string): Promise<{ balance: number, transactions: WalletTransaction[] }> => {
    const userSnap = await db.ref(`filmysky/users/${userId}/walletBalance`).once('value');
    const balance = userSnap.val() || 0;
    const txnSnap = await db.ref(`filmysky/transactions`).orderByChild('userId').equalTo(userId).limitToLast(50).once('value');
    const txnData = txnSnap.val() || {};
    const transactions: WalletTransaction[] = Object.keys(txnData).map(key => ({...txnData[key], id: key})).reverse();
    return { balance, transactions };
};

export const submitPaymentRequest = async (requestData: Omit<PaymentRequest, 'id' | 'requestedAt' | 'status'>): Promise<string> => {
    const sanitizedData = JSON.parse(JSON.stringify(requestData));
    const newRequestRef = db.ref('filmysky/paymentRequests').push();
    await newRequestRef.set({
        ...sanitizedData,
        status: 'pending',
        requestedAt: firebase.database.ServerValue.TIMESTAMP,
    });
    return newRequestRef.key || '';
};

export const autoVerifyPaymentRequest = async (requestId: string): Promise<{ success: boolean; message: string }> => {
    const result = await updatePaymentRequestStatus(requestId, 'approved');
    if (result.success) {
        // Tag as autoVerified
        try {
            await db.ref(`filmysky/paymentRequests/${requestId}`).update({ autoVerified: true });
        } catch {}
    }
    return result;
};

export const getPaymentRequests = (callback: (requests: PaymentRequest[]) => void) => {
    const ref = db.ref('filmysky/paymentRequests').orderByChild('requestedAt');
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        const list: PaymentRequest[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(list.reverse());
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};

export const updatePaymentRequestStatus = async (
    requestId: string,
    status: 'approved' | 'rejected'
): Promise<{ success: boolean; message: string }> => {
    const requestRef = db.ref(`filmysky/paymentRequests/${requestId}`);
    const requestSnap = await requestRef.once('value');
    const request: PaymentRequest = requestSnap.val();
    if (!request) return { success: false, message: "Request not found." };
    if (request.status !== 'pending') return { success: false, message: `Request is already ${request.status}.` };
    const userRef = db.ref(`filmysky/users/${request.userId}`);
    const userSnap = await userRef.once('value');
    const user: User = userSnap.val();
    if (!user) {
        await requestRef.update({ status: 'rejected' });
        return { success: false, message: "User not found." };
    }
    if (status === 'approved') {
        if (request.type === 'subscription' && request.planId) {
            const planSnap = await db.ref(`filmysky/subscriptionPlans/${request.planId}`).once('value');
            const plan: SubscriptionPlan = { ...planSnap.val(), id: request.planId };
            if (!plan) return { success: false, message: "Plan not found." };
            const newSubscription: User['subscription'] = {
                planName: plan.name,
                maxQuality: plan.maxQuality,
                adsDisabled: plan.adsDisabled,
                liveTvAccess: plan.liveTvAccess,
                viewLimit: -1, 
            };
            if (plan.type === 'time-based' && plan.validity) {
                const currentExpiry = (user.subscription?.expiresAt && user.subscription.expiresAt > Date.now())
                    ? user.subscription.expiresAt
                    : Date.now();
                newSubscription.expiresAt = currentExpiry + (plan.validity * 24 * 60 * 60 * 1000);
            }
            await userRef.update({ subscription: newSubscription });
            await queueNotificationForUser(request.userId, { title: 'Subscription Activated!', body: `Your ${plan.name} plan is active.` });
        } else if (request.type === 'wallet') {
            const currentBalance = user.walletBalance || 0;
            const newBalance = currentBalance + request.amount;
            await userRef.update({ walletBalance: newBalance });
            await db.ref('filmysky/transactions').push({
                userId: request.userId,
                amount: request.amount,
                type: 'credit',
                description: 'Wallet Deposit via Admin/UPI',
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            await queueNotificationForUser(request.userId, { title: 'Wallet Credited', body: `₹${request.amount} added to your ad wallet.` });
        }
    }
    await requestRef.update({ status });
    return { success: true, message: `Request ${status}.` };
};

export const getAppSettings = (callback: (settings: AppSettings) => void) => {
    const ref = db.ref('filmysky/appSettings');
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        if (data.adConfig) {
            if (typeof data.adConfig.masterSwitch === 'boolean') {
                data.adConfig.masterSwitch = {
                    video: data.adConfig.masterSwitch,
                    interstitial: data.adConfig.masterSwitch
                };
            }
            ['youtube', 'website', 'video'].forEach(type => {
                if (data.adConfig.rates && data.adConfig.rates[type] && typeof data.adConfig.rates[type].cpm === 'number') {
                    const oldCpm = data.adConfig.rates[type].cpm;
                    data.adConfig.rates[type].cpm = { '15': oldCpm, '30': oldCpm * 1.5, '45': oldCpm * 2, '59': oldCpm * 2.5 };
                }
            });
        }
        callback(data);
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};

export const updateAppSettings = async (settings: AppSettings): Promise<void> => {
    await db.ref('filmysky/appSettings').update(settings);
};

export const submitContactForm = async (name: string, email: string, message: string): Promise<void> => {
    const newContactRef = db.ref('filmysky/contactMessages').push();
    await newContactRef.set({ name, email, message, submittedAt: firebase.database.ServerValue.TIMESTAMP });
};
export const getContactMessages = (callback: (messages: ContactMessage[]) => void) => {
    const ref = db.ref('filmysky/contactMessages').orderByChild('submittedAt');
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        const list: ContactMessage[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(list.reverse());
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};

// PUBLIC CHAT SYSTEM
export const getPublicChatMessages = (callback: (messages: any[]) => void) => {
    // Get messages from the last 24 hours (approx)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const ref = db.ref('filmysky/publicChat').orderByChild('timestamp').startAt(oneDayAgo);
    
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        const list: any[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
        // Sort by timestamp ascending
        list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        callback(list);
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};

export const sendPublicChatMessage = async (userName: string, text: string, userId?: string): Promise<void> => {
    const ref = db.ref('filmysky/publicChat').push();
    await ref.set({
        userName,
        text,
        userId: userId || 'anonymous',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
};

export const saveFCMToken = async (userId: string, token: string): Promise<void> => {
    const currentTokenSnap = await db.ref(`filmysky/users/${userId}/fcmToken`).once('value');
    if (currentTokenSnap.val() !== token) await db.ref(`filmysky/users/${userId}`).update({ fcmToken: token });
};
export const queueNotificationForAll = async (notification: { title: string; body: string }): Promise<void> => {
    const queueRef = db.ref('filmysky/notificationsQueue').push();
    await queueRef.set({ sendTo: 'all', notification, createdAt: firebase.database.ServerValue.TIMESTAMP });
};
export const queueNotificationForUser = async (userId: string, notification: { title: string; body: string }): Promise<void> => {
    const queueRef = db.ref('filmysky/notificationsQueue').push();
    await queueRef.set({ sendTo: userId, notification, createdAt: firebase.database.ServerValue.TIMESTAMP });
};
export const getDashboardStats = async (): Promise<{ totalUsers: number, totalContent: number, pendingRequests: number }> => {
    const usersSnap = await db.ref('filmysky/users').once('value');
    const contentSnap = await db.ref('filmysky/content').once('value');
    const requestsSnap = await db.ref('filmysky/paymentRequests').orderByChild('status').equalTo('pending').once('value'); 
    return { totalUsers: usersSnap.numChildren(), totalContent: contentSnap.numChildren(), pendingRequests: requestsSnap.numChildren() };
};
export const uploadFile = async (file: File, path: string): Promise<string> => {
    const ref = storage.ref().child(`${path}/${Date.now()}_${file.name}`);
    const snapshot = await ref.put(file);
    return snapshot.ref.getDownloadURL();
};
export const addContent = async (content: Omit<Content, 'id'>) => db.ref('filmysky/content').push(content);
export const updateContent = async (id: string, content: Content) => { const { id: _, ...data } = content; await db.ref(`filmysky/content/${id}`).update(data); };
export const deleteContent = async (id: string) => db.ref(`filmysky/content/${id}`).remove();
export const getAllUsers = (callback: (users: User[]) => void) => {
    const ref = db.ref('filmysky/users');
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        const list: User[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(list);
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};
export const deleteUser = async (userId: string) => db.ref(`filmysky/users/${userId}`).remove();
export const updateUserRole = async (uid: string, isAdmin: boolean) => db.ref(`filmysky/users/${uid}`).update({ role: isAdmin });
export const getContentRequests = (callback: (requests: ContentRequest[]) => void) => {
    const ref = db.ref('filmysky/requests').orderByChild('requestedAt');
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        const list: ContentRequest[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(list.reverse());
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};
export const updateContentRequestStatus = async (requestId: string, status: 'completed' | 'rejected') => db.ref(`filmysky/requests/${requestId}`).update({ status });
export const getLiveTvNetworks = (callback: (networks: LiveTvNetwork[]) => void) => {
    const ref = db.ref('filmysky/liveTvNetworks');
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        const list: LiveTvNetwork[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(list);
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};
export const getLiveTvNetworkById = async (id: string): Promise<LiveTvNetwork | null> => {
    const snapshot = await db.ref(`filmysky/liveTvNetworks/${id}`).once('value');
    return snapshot.val() ? { ...snapshot.val(), id } : null;
};
export const addLiveTvNetwork = async (network: Omit<LiveTvNetwork, 'id'>) => db.ref('filmysky/liveTvNetworks').push(network);
export const updateLiveTvNetwork = async (id: string, network: LiveTvNetwork) => { const { id: _, ...data } = network; await db.ref(`filmysky/liveTvNetworks/${id}`).update(data); };
export const deleteLiveTvNetwork = async (id: string) => db.ref(`filmysky/liveTvNetworks/${id}`).remove();
export const getLiveTvStreams = (networkId: string, callback: (streams: LiveTvStream[]) => void) => {
    const ref = db.ref(`filmysky/liveTvNetworks/${networkId}/streams`);
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        const list: LiveTvStream[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(list);
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};
export const getLiveTvStream = async (networkId: string, streamId: string): Promise<LiveTvStream | null> => {
    const snapshot = await db.ref(`filmysky/liveTvNetworks/${networkId}/streams/${streamId}`).once('value');
    return snapshot.val() ? { ...snapshot.val(), id: streamId } : null;
};
export const addLiveTvStream = async (networkId: string, stream: Omit<LiveTvStream, 'id'>) => db.ref(`filmysky/liveTvNetworks/${networkId}/streams`).push(stream);
export const updateLiveTvStream = async (networkId: string, streamId: string, stream: LiveTvStream) => { const { id, ...data } = stream; await db.ref(`filmysky/liveTvNetworks/${networkId}/streams/${streamId}`).update(data); };
export const deleteLiveTvStream = async (networkId: string, streamId: string) => db.ref(`filmysky/liveTvNetworks/${networkId}/streams/${streamId}`).remove();
export const getSubscriptionPlans = (callback: (plans: SubscriptionPlan[]) => void) => {
    const ref = db.ref('filmysky/subscriptionPlans');
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        const list: SubscriptionPlan[] = Object.keys(data).map(key => ({ ...data[key], id: key }));
        callback(list.sort((a,b) => a.price - b.price));
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};
export const addSubscriptionPlan = async (plan: Omit<SubscriptionPlan, 'id'>) => db.ref('filmysky/subscriptionPlans').push(plan);
export const updateSubscriptionPlan = async (id: string, plan: SubscriptionPlan) => { const { id: planId, ...data } = plan; await db.ref(`filmysky/subscriptionPlans/${id}`).update(data); };
export const deleteSubscriptionPlan = async (id: string) => db.ref(`filmysky/subscriptionPlans/${id}`).remove();

// ============================================================================
// PRESENCE SYSTEM
// ============================================================================

export const trackUserPresence = (userId: string) => {
    // Use push() to generate a unique connection ID for this specific session/tab
    // This allows multiple tabs/devices for the same user to be tracked correctly.
    // The user is "online" if they have at least one connection.
    const userStatusRef = db.ref(`filmysky/presence/${userId}`);
    const connectionRef = userStatusRef.push(); 
    const connectedRef = db.ref('.info/connected');

    const listener = (snap: firebase.database.DataSnapshot) => {
        if (snap.val() === true) {
            // Remove this specific connection on disconnect
            connectionRef.onDisconnect().remove();
            // Set this specific connection
            connectionRef.set(firebase.database.ServerValue.TIMESTAMP);
        }
    };
    connectedRef.on('value', listener);

    return () => {
        connectedRef.off('value', listener);
        connectionRef.remove();
    };
};

export const getOnlineUsersCount = (callback: (count: number) => void) => {
    const ref = db.ref('filmysky/presence');
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val() || {};
        callback(Object.keys(data).length);
    };
    ref.on('value', listener);
    return () => ref.off('value', listener);
};
