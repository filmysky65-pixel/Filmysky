
import { useEffect } from 'react';
import { useAppContext } from './useAppContext';
import { trackUserPresence } from '../services/firebaseService';

export const usePresence = () => {
    const { user } = useAppContext();

    useEffect(() => {
        let cleanup: (() => void) | undefined;
        if (user?.id) {
            cleanup = trackUserPresence(user.id);
        } else {
            // If user is not logged in, we can track as anonymous if desired, 
            // but usually presence is for logged in users or device IDs.
            // For now, let's track anonymous users with a temporary ID if needed, 
            // but simpler: only track logged in users.
            // OR generate a random ID for guests and store in localStorage?
            // The request said "jitne bande website pe online ho dikhe" (show how many people are online).
            // This implies ALL visitors.
            
            let visitorId = localStorage.getItem('filmysky_visitor_id');
            if (!visitorId) {
                visitorId = 'guest_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('filmysky_visitor_id', visitorId);
            }
            cleanup = trackUserPresence(visitorId);
        }
        return () => {
            if (cleanup) cleanup();
        };
    }, [user?.id]);
};
