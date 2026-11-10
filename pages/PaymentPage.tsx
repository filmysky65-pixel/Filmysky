
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SubscriptionPlan } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { submitPaymentRequest } from '../services/firebaseService';

interface PaymentContext {
    mode: 'subscription' | 'wallet';
    plan?: SubscriptionPlan;
    amount?: number;
}

const PaymentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, appSettings } = useAppContext();
    
    // Determine payment mode and data
    const paymentContext = location.state as PaymentContext | undefined;
    
    const [isSubmitted, setIsSubmitted] = useState(false);
    const hasAutoSubmitted = useRef(false);

    // Redirect if context is missing (e.g. page reload)
    useEffect(() => {
        if (!paymentContext) {
            navigate('/', { replace: true });
        }
    }, [paymentContext, navigate]);

    // Validate Subscription Status
    useEffect(() => {
        if (paymentContext?.mode === 'subscription' && appSettings?.subscriptionStatus === 'INACTIVE') {
            alert("Subscriptions are currently disabled.");
            navigate('/');
        }
    }, [paymentContext, appSettings, navigate]);

    const { upiId, transactionNote, qrCodeUrl, displayAmount, title } = useMemo(() => {
        if (!paymentContext || !user) return { upiId: '', transactionNote: '', qrCodeUrl: '', displayAmount: 0, title: '' };

        const { mode, plan, amount } = paymentContext;
        const finalAmount = mode === 'subscription' && plan ? plan.price : (amount || 0);
        const titleText = mode === 'subscription' ? plan?.name : 'Wallet Top-up';

        const defaultUpiId = 'dummyupi@bank';
        let adminUpiIds: string[] = [];
        if (appSettings?.upiIds && Array.isArray(appSettings.upiIds)) {
            adminUpiIds = appSettings.upiIds.filter(Boolean);
        }
        const selectedUpiId = adminUpiIds.length > 0 ? adminUpiIds[Math.floor(Math.random() * adminUpiIds.length)] : defaultUpiId;
        
        // Generate Transaction Note Code
        const prefix = mode === 'subscription' ? 'CNS-' : 'CNA-';
        const randomNum = Math.floor(10000 + Math.random() * 90000); 
        const note = `${prefix}${randomNum}`;
        
        const upiLink = `upi://pay?pa=${selectedUpiId}&pn=CineFlix&am=${finalAmount}&tn=${note}&cu=INR`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}&qzone=1`;

        return { upiId: selectedUpiId, transactionNote: note, qrCodeUrl: qrUrl, displayAmount: finalAmount, title: titleText };
    }, [paymentContext, appSettings, user]);

    // Auto Submit Request when QR is ready
    useEffect(() => {
        const autoSubmit = async () => {
            if (!paymentContext || !user || !transactionNote || hasAutoSubmitted.current) return;
            
            hasAutoSubmitted.current = true;
            try {
                // Construct payload explicitly to avoid 'undefined' values which crash Firebase
                const payload: any = {
                    userId: user.id,
                    userName: user.name,
                    userEmail: user.email || null,
                    type: paymentContext.mode,
                    amount: displayAmount,
                    upiId: upiId,
                    transactionNote: transactionNote,
                };

                // Only add plan details if they exist (for subscription mode)
                if (paymentContext.plan) {
                    payload.planId = paymentContext.plan.id;
                    payload.planName = paymentContext.plan.name;
                }

                await submitPaymentRequest(payload);
                setIsSubmitted(true);
            } catch (error) {
                console.error("Failed to auto-submit payment request:", error);
                // If submission fails, allow manual retry or just inform user
                hasAutoSubmitted.current = false;
                alert("There was an issue initializing the payment request. Please check your connection.");
            }
        };
        autoSubmit();
    }, [paymentContext, user, transactionNote, displayAmount, upiId]);

    if (!paymentContext || !user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[var(--bg-color)] to-[#0c0a1a] flex flex-col justify-center items-center p-4">
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-sm text-[var(--secondary-text-color)] hover:text-[var(--text-color)] z-10">
                <i className="fas fa-arrow-left mr-2"></i> Cancel
            </button>

            <div className="w-full max-w-sm bg-[var(--card-bg)] rounded-2xl shadow-2xl p-6 relative overflow-hidden border border-[var(--border-color)]">
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold text-white">Scan & Pay</h1>
                    <p className="text-[var(--secondary-text-color)] text-sm">for <span className="font-bold text-[var(--primary-color)]">{title}</span></p>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-inner my-6 mx-auto w-64 h-64 relative">
                    <img src={qrCodeUrl} alt="UPI QR Code" className="w-full h-full" />
                    {!isSubmitted && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <i className="fas fa-spinner fa-spin text-3xl text-gray-500"></i>
                        </div>
                    )}
                </div>
                
                <div className="text-center">
                    <p className="text-lg text-[var(--secondary-text-color)]">Amount to Pay</p>
                    <p className="text-5xl font-bold text-white">₹{displayAmount}</p>
                </div>
            </div>
            
            <div className="w-full max-w-sm mt-6 text-center">
                {isSubmitted ? (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg animate-fade-in">
                        <i className="fas fa-clock mr-2"></i> 
                        <strong>Waiting for payment...</strong>
                        <p className="text-xs mt-1">Once you pay, our system will auto-verify your transaction.</p>
                        <button onClick={() => navigate(paymentContext.mode === 'wallet' ? '/advertiser-panel' : '/')} className="mt-4 text-sm underline text-white hover:text-[var(--primary-color)]">
                            Go Back
                        </button>
                    </div>
                ) : (
                    <div className="text-[var(--secondary-text-color)]">Generating Secure Payment Link...</div>
                )}
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default PaymentPage;
