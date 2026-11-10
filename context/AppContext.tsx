
import React, { createContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { User, Theme, AppSettings } from '../types';
import { auth, getUserProfile, createAnonymousUserProfile } from '../services/firebaseService';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

interface Permissions {
    isPremium: boolean;
    canWatchHighQuality: boolean;
    hasLiveTvAccess: boolean;
    shouldShowAds: boolean; // Controls AdBanner visibility, not video ads
    currentViewLimit: number; // -1 for unlimited
}

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAdmin: boolean;
  authLoading: boolean;
  appSettingsLoading: boolean; // Added loading state for settings
  logout: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  appSettings: AppSettings | null;
  permissions: Permissions;
  isThemeModalOpen: boolean;
  openThemeModal: () => void;
  closeThemeModal: () => void;
  isAboutMeModalOpen: boolean;
  openAboutMeModal: () => void;
  closeAboutMeModal: () => void;
  deferredPrompt: any;
  triggerInstallPrompt: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [appSettingsLoading, setAppSettingsLoading] = useState(true); // Initialized to true
  // Changed default to classic-dark (Red)
  const [theme, rawSetTheme] = useState<Theme>(() => (localStorage.getItem('filmysky_theme') as Theme) || 'classic-dark');
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAboutMeModalOpen, setIsAboutMeModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const triggerInstallPrompt = useCallback(async () => {
    if (!deferredPrompt) {
        return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribeAuth: firebase.Unsubscribe | undefined;
    const settingsRef = firebase.database().ref('filmysky/appSettings');
    
    const settingsCallback = (snapshot: firebase.database.DataSnapshot) => {
        if (isMounted) {
            const loadedSettings = snapshot.val() || {};
            setAppSettings(loadedSettings);
            setAppSettingsLoading(false); // Settings have arrived
        }
    };

    (async () => {
        try {
            await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } catch (error) {
            console.error("Firebase persistence error:", error);
        }

        unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
            if (!isMounted) return;
            
            if (firebaseUser) {
                const profile = await getUserProfile(firebaseUser.uid);
                if (profile) {
                    setUser({
                        ...profile,
                        id: firebaseUser.uid,
                        isAnonymous: firebaseUser.isAnonymous,
                        email: firebaseUser.email,
                    });
                } else {
                    // User is authenticated but has no profile (should not happen for email auth, but handle gracefully)
                    // Do not create anonymous profile
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        });

        settingsRef.on('value', settingsCallback);
    })();

    return () => {
        isMounted = false;
        if (unsubscribeAuth) {
            unsubscribeAuth();
        }
        settingsRef.off('value', settingsCallback);
    };
  }, []);
  
  const setTheme = (newTheme: Theme) => {
    rawSetTheme(newTheme);
    localStorage.setItem('filmysky_theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const logout = useCallback(async () => {
    await auth.signOut();
    setUser(null);
  }, []);
  
  const openThemeModal = () => setIsThemeModalOpen(true);
  const closeThemeModal = () => setIsThemeModalOpen(false);
  const openAboutMeModal = () => setIsAboutMeModalOpen(true);
  const closeAboutMeModal = () => setIsAboutMeModalOpen(false);
  
  const isAdmin = user?.role === true;

  const permissions = useMemo<Permissions>(() => {
    // Default unlimited views for everyone
    const defaultPermissions = {
        isPremium: false,
        canWatchHighQuality: true,
        hasLiveTvAccess: false,
        shouldShowAds: true, 
        currentViewLimit: -1, // -1 means unlimited
    };

    if (!user) return defaultPermissions;

    if (user.role) { // Admin
        return {
            isPremium: true,
            canWatchHighQuality: true,
            hasLiveTvAccess: true,
            shouldShowAds: false,
            currentViewLimit: -1,
        };
    }
    
    const sub = user.subscription;
    if (sub) {
        const isTimeBasedActive = sub.expiresAt && sub.expiresAt > Date.now();
        
        if (isTimeBasedActive) {
            return {
                isPremium: true,
                canWatchHighQuality: true,
                hasLiveTvAccess: sub.liveTvAccess,
                shouldShowAds: !sub.adsDisabled,
                currentViewLimit: -1,
            };
        }
        
        // Even if not time-based, everyone has unlimited views now.
        // We only check subscription for Live TV or Ad-Free
        return {
             isPremium: true,
             canWatchHighQuality: true,
             hasLiveTvAccess: sub.liveTvAccess,
             shouldShowAds: !sub.adsDisabled,
             currentViewLimit: -1,
         };
    }

    return defaultPermissions;
  }, [user]);


  const value: AppContextType = {
    user,
    setUser,
    isAdmin,
    authLoading,
    appSettingsLoading,
    logout,
    theme,
    setTheme,
    appSettings,
    permissions,
    isThemeModalOpen,
    openThemeModal,
    closeThemeModal,
    isAboutMeModalOpen,
    openAboutMeModal,
    closeAboutMeModal,
    deferredPrompt,
    triggerInstallPrompt,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
