import { useEffect } from 'react';
import { useAppContext } from './useAppContext';
import { messaging, saveFCMToken } from '../services/firebaseService';

const VAPID_KEY = 'BNOw61CUAWf0dPmKLsX0mhgMQAJh6TjRv0cyg-AIlIruHoJ9yxJkym2iHvLBuACZUG5qLk-lHK4BO7qd1WR744A';

export const useFCM = () => {
    const { user } = useAppContext();

    useEffect(() => {
        if (user && !user.isAnonymous && messaging) {
            const requestPermissionAndToken = async () => {
                try {
                    // Request permission
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        // Get token
                        const token = await messaging.getToken({ vapidKey: VAPID_KEY });
                        if (token) {
                            // Save token to DB
                            await saveFCMToken(user.id, token);
                        } else {
                            console.log('No registration token available. Request permission to generate one.');
                        }
                    } else {
                        console.log('Unable to get permission to notify.');
                    }
                } catch (error) {
                    console.error('An error occurred while retrieving token. ', error);
                }
            };

            requestPermissionAndToken();

            // Handle foreground messages
            const unsubscribe = messaging.onMessage((payload) => {
                console.log('Message received. ', payload);
                // For a better UX, you could implement a custom toast notification here
                // instead of a disruptive alert.
                alert(`Notification:\n${payload.notification?.title}\n${payload.notification?.body}`);
            });
            
            return () => {
                unsubscribe();
            };
        }
    }, [user]);
};
