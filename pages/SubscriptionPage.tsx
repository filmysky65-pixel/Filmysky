
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionPlan } from '../types';
import { getSubscriptionPlans } from '../services/firebaseService';
import { useAppContext } from '../hooks/useAppContext';

const SubscriptionPage: React.FC = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, appSettings } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = getSubscriptionPlans(data => {
            setPlans(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (appSettings?.subscriptionStatus === 'INACTIVE') {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-[60vh] text-center">
                <i className="fas fa-ban text-6xl text-[var(--secondary-text-color)] mb-4"></i>
                <h1 className="text-2xl font-bold mb-2">Subscriptions Unavailable</h1>
                <p className="text-[var(--secondary-text-color)]">Premium subscriptions are currently disabled by the administrator.</p>
                <button onClick={() => navigate('/')} className="mt-6 bg-[var(--primary-color)] text-white font-bold py-2 px-6 rounded-lg">Go Home</button>
            </div>
        );
    }

    const handleSubscribe = (plan: SubscriptionPlan) => {
        if (!user || user.isAnonymous) {
            navigate('/auth');
            return;
        }
        // Updated to match the new PaymentPage context structure
        navigate('/payment', { state: { mode: 'subscription', plan } });
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-2 text-center">Premium Plans</h1>
            <p className="text-center text-[var(--secondary-text-color)] mb-8">Go Premium to remove ads and unlock exclusive features.</p>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--primary-color)] transition-all p-6 rounded-2xl flex flex-col shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary-color)]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            
                            <h2 className="text-xl font-bold text-[var(--primary-color)] relative z-10">{plan.name}</h2>
                            <div className="flex items-baseline mt-4 mb-6">
                                <span className="text-4xl font-bold">₹{plan.price}</span>
                                <span className="text-[var(--secondary-text-color)] ml-2">/ {plan.validity} days</span>
                            </div>
                            
                            <button onClick={() => handleSubscribe(plan)} className="mt-auto bg-[var(--primary-color)] hover:bg-blue-600 transition-colors text-white font-bold py-3 rounded-xl w-full shadow-lg shadow-blue-500/20">
                                Choose Plan
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubscriptionPage;
