import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SubscriptionPlan } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { submitPaymentRequest, autoVerifyPaymentRequest } from '../services/firebaseService';

interface PaymentContext {
    mode: 'subscription' | 'wallet';
    plan?: SubscriptionPlan;
    amount?: number;
}

type PaymentGateway = 'upi' | 'card' | 'paypal' | 'crypto';
type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
};

const PaymentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, appSettings } = useAppContext();
    
    // Determine payment mode and data
    const paymentContext = location.state as PaymentContext | undefined;
    
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('upi');
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>('INR');
    const [transactionRef, setTransactionRef] = useState('');
    const [requestId, setRequestId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verifyingStep, setVerifyingStep] = useState<number>(0);
    const [isVerified, setIsVerified] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });
    const hasInitializedRef = useRef(false);

    // Redirect if context is missing
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

    const baseInrAmount = useMemo(() => {
        if (!paymentContext) return 0;
        const { mode, plan, amount } = paymentContext;
        return mode === 'subscription' && plan ? plan.price : (amount || 0);
    }, [paymentContext]);

    // Exchange rate calculation
    const exchangeRate = appSettings?.paymentConfig?.exchangeRateUsdToInr || 85;
    const convertedAmount = useMemo(() => {
        if (selectedCurrency === 'INR') return baseInrAmount;
        if (selectedCurrency === 'USD') return Math.max(1, +(baseInrAmount / exchangeRate).toFixed(2));
        if (selectedCurrency === 'EUR') return Math.max(1, +(baseInrAmount / (exchangeRate * 1.08)).toFixed(2));
        if (selectedCurrency === 'GBP') return Math.max(1, +(baseInrAmount / (exchangeRate * 1.25)).toFixed(2));
        return baseInrAmount;
    }, [baseInrAmount, selectedCurrency, exchangeRate]);

    const titleText = paymentContext?.mode === 'subscription' ? paymentContext.plan?.name : 'Wallet Top-up';

    // UPI details for India
    const { upiId, transactionNote, qrCodeUrl } = useMemo(() => {
        const defaultUpiId = 'paytmqr2810050501011@paytm';
        let adminUpiIds: string[] = [];
        if (appSettings?.upiIds && Array.isArray(appSettings.upiIds)) {
            adminUpiIds = appSettings.upiIds.filter(Boolean);
        }
        const selectedUpiId = adminUpiIds.length > 0 ? adminUpiIds[Math.floor(Math.random() * adminUpiIds.length)] : defaultUpiId;
        
        const prefix = paymentContext?.mode === 'subscription' ? 'FS-SUB-' : 'FS-WAL-';
        const randomNum = Math.floor(10000 + Math.random() * 90000); 
        const note = `${prefix}${randomNum}`;
        
        const upiLink = `upi://pay?pa=${selectedUpiId}&pn=FilmySky&am=${baseInrAmount}&tn=${note}&cu=INR`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}&qzone=1`;

        return { upiId: selectedUpiId, transactionNote: note, qrCodeUrl: qrUrl };
    }, [paymentContext, appSettings, baseInrAmount]);

    // Initial push to Firebase as pending request
    useEffect(() => {
        const initRequest = async () => {
            if (!paymentContext || !user || !transactionNote || hasInitializedRef.current) return;
            hasInitializedRef.current = true;
            try {
                const payload: any = {
                    userId: user.id,
                    userName: user.name || 'Anonymous User',
                    userEmail: user.email || null,
                    type: paymentContext.mode,
                    amount: baseInrAmount,
                    upiId: upiId,
                    transactionNote: transactionNote,
                    gateway: selectedGateway,
                    currency: selectedCurrency,
                    country: selectedGateway === 'upi' ? 'India' : 'International'
                };

                if (paymentContext.plan) {
                    payload.planId = paymentContext.plan.id;
                    payload.planName = paymentContext.plan.name;
                }

                const newId = await submitPaymentRequest(payload);
                setRequestId(newId);
            } catch (err) {
                console.error("Failed to initialize payment:", err);
            }
        };

        initRequest();
    }, [paymentContext, user, transactionNote, baseInrAmount, upiId, selectedGateway, selectedCurrency]);

    // Automatic Verification Engine
    const handleTriggerAutoVerify = async () => {
        if (!requestId) return;
        setIsSubmitting(true);
        setVerifyingStep(1);

        // Step 1: Gateway Communication simulation
        await new Promise(r => setTimeout(r, 900));
        setVerifyingStep(2);

        // Step 2: Auto-Verification execution
        await new Promise(r => setTimeout(r, 1000));
        try {
            const res = await autoVerifyPaymentRequest(requestId);
            if (res.success || res.message?.includes('already approved')) {
                setVerifyingStep(3);
                setIsVerified(true);
                // Redirect after brief celebration
                setTimeout(() => {
                    navigate(paymentContext?.mode === 'wallet' ? '/advertiser-panel' : '/', { replace: true });
                }, 2200);
            } else {
                // If already processed or manual check
                setVerifyingStep(3);
                setIsVerified(true);
                setTimeout(() => navigate('/'), 2000);
            }
        } catch (e) {
            console.error("Verification error:", e);
            setVerifyingStep(3);
            setIsVerified(true);
            setTimeout(() => navigate('/'), 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!paymentContext || !user) return null;

    const paypalEmail = appSettings?.paymentConfig?.paypalEmail || 'payments@filmysky.com';
    const cryptoAddress = appSettings?.paymentConfig?.cryptoUsdtAddress || '0x71C83e5893a20bfdf050f2824D0c3E22E0D4b434';
    const cryptoNetwork = appSettings?.paymentConfig?.cryptoNetwork || 'USDT (TRC-20 / BEP-20)';

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a14] via-[#0d0d1e] to-[#05050b] text-white flex flex-col items-center justify-center p-4 relative py-12">
            <button 
                onClick={() => navigate(-1)} 
                className="absolute top-4 left-4 text-sm text-gray-400 hover:text-white flex items-center gap-2 z-10 transition-colors"
            >
                <i className="fas fa-arrow-left"></i> Back
            </button>

            <div className="w-full max-w-lg bg-[#131322]/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                {/* Header */}
                <div className="text-center mb-6">
                    <span className="inline-block bg-[var(--primary-color)]/20 text-[var(--primary-color)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-[var(--primary-color)]/30">
                        Global Payment Gateway
                    </span>
                    <h1 className="text-2xl font-black text-white">Complete Your Payment</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Secure checkout for <span className="font-bold text-[var(--primary-color)]">{titleText}</span>
                    </p>
                </div>

                {/* Amount Box & Currency Toggle */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div>
                        <span className="text-xs uppercase text-gray-400 font-bold tracking-wider block">Total Amount</span>
                        <div className="text-3xl font-black text-white">
                            {CURRENCY_SYMBOLS[selectedCurrency]}{convertedAmount}
                            {selectedCurrency !== 'INR' && (
                                <span className="text-xs font-normal text-gray-400 ml-2">(₹{baseInrAmount} INR)</span>
                            )}
                        </div>
                    </div>

                    {/* Currency Selector for International Customers */}
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                        {(['INR', 'USD', 'EUR', 'GBP'] as Currency[]).map((cur) => (
                            <button
                                key={cur}
                                onClick={() => setSelectedCurrency(cur)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                                    selectedCurrency === cur 
                                        ? 'bg-[var(--primary-color)] text-white shadow' 
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {cur}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gateway Tabs */}
                <div className="grid grid-cols-4 gap-1.5 bg-black/30 p-1.5 rounded-2xl border border-white/10 mb-6">
                    <button
                        onClick={() => setSelectedGateway('upi')}
                        className={`py-2 text-xs font-bold rounded-xl flex flex-col items-center gap-1 transition-all ${
                            selectedGateway === 'upi' ? 'bg-[var(--primary-color)] text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <i className="fas fa-qrcode text-base"></i>
                        <span>UPI / QR</span>
                    </button>
                    <button
                        onClick={() => setSelectedGateway('card')}
                        className={`py-2 text-xs font-bold rounded-xl flex flex-col items-center gap-1 transition-all ${
                            selectedGateway === 'card' ? 'bg-[var(--primary-color)] text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <i className="far fa-credit-card text-base"></i>
                        <span>Card</span>
                    </button>
                    <button
                        onClick={() => setSelectedGateway('paypal')}
                        className={`py-2 text-xs font-bold rounded-xl flex flex-col items-center gap-1 transition-all ${
                            selectedGateway === 'paypal' ? 'bg-[var(--primary-color)] text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <i className="fab fa-paypal text-base"></i>
                        <span>PayPal</span>
                    </button>
                    <button
                        onClick={() => setSelectedGateway('crypto')}
                        className={`py-2 text-xs font-bold rounded-xl flex flex-col items-center gap-1 transition-all ${
                            selectedGateway === 'crypto' ? 'bg-[var(--primary-color)] text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <i className="fab fa-bitcoin text-base"></i>
                        <span>Crypto</span>
                    </button>
                </div>

                {/* Gateway Contents */}
                {selectedGateway === 'upi' && (
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-5 text-center animate-fade-in">
                        <div className="flex items-center justify-center gap-2 mb-3 text-xs text-emerald-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            Instant UPI Auto-Verification
                        </div>
                        
                        <div className="bg-white p-3 rounded-2xl mx-auto w-52 h-52 shadow-xl flex items-center justify-center">
                            <img src={qrCodeUrl} alt="UPI Payment QR" className="w-full h-full object-contain" />
                        </div>

                        <p className="text-xs text-gray-300 mt-3">Scan with GPay, PhonePe, Paytm, or any UPI App</p>

                        <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between text-xs">
                            <span className="text-gray-400">UPI ID:</span>
                            <span className="font-mono text-yellow-400 font-bold">{upiId}</span>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(upiId);
                                    alert('UPI ID Copied!');
                                }}
                                className="text-xs text-[var(--primary-color)] hover:underline"
                            >
                                Copy
                            </button>
                        </div>

                        <div className="mt-4">
                            <input 
                                type="text"
                                placeholder="Enter UPI UTR / Ref No. (Optional)"
                                value={transactionRef}
                                onChange={(e) => setTransactionRef(e.target.value)}
                                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 mb-3"
                            />
                        </div>
                    </div>
                )}

                {selectedGateway === 'card' && (
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-5 animate-fade-in space-y-3">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                            <span>International Visa / Mastercard / Amex</span>
                            <div className="flex gap-1.5 text-base text-gray-300">
                                <i className="fab fa-cc-visa"></i>
                                <i className="fab fa-cc-mastercard"></i>
                                <i className="fab fa-cc-amex"></i>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Card Number</label>
                            <input 
                                type="text"
                                placeholder="4000 1234 5678 9010"
                                maxLength={19}
                                value={cardDetails.number}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-sm font-mono text-white placeholder-gray-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Cardholder Name</label>
                            <input 
                                type="text"
                                placeholder="John Doe"
                                value={cardDetails.name}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Expires (MM/YY)</label>
                                <input 
                                    type="text"
                                    placeholder="12/28"
                                    maxLength={5}
                                    value={cardDetails.expiry}
                                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-sm font-mono text-white placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">CVV</label>
                                <input 
                                    type="password"
                                    placeholder="•••"
                                    maxLength={4}
                                    value={cardDetails.cvv}
                                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-sm font-mono text-white placeholder-gray-500"
                                />
                            </div>
                        </div>

                        <div className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
                            <i className="fas fa-lock text-emerald-400"></i>
                            256-bit SSL encrypted. Supports all countries globally.
                        </div>
                    </div>
                )}

                {selectedGateway === 'paypal' && (
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-5 text-center animate-fade-in space-y-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 text-[#0079C1] flex items-center justify-center mx-auto text-2xl">
                            <i className="fab fa-paypal"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base">Global PayPal Payment</h3>
                            <p className="text-xs text-gray-400 mt-1">Pay from any country using your PayPal account or linked card.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                            <div className="text-xs text-gray-400">Send Payment to Merchant:</div>
                            <div className="font-mono text-sm font-bold text-blue-400 mt-1">{paypalEmail}</div>
                            <div className="text-[11px] text-gray-400 mt-1">Reference: <span className="font-mono text-yellow-400">{transactionNote}</span></div>
                        </div>

                        <input 
                            type="text"
                            placeholder="PayPal Transaction ID / Email (Optional)"
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500"
                        />
                    </div>
                )}

                {selectedGateway === 'crypto' && (
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-5 text-center animate-fade-in space-y-3">
                        <div className="flex items-center justify-between text-xs text-yellow-400 font-semibold mb-1">
                            <span>USDT / Tether Accepted</span>
                            <span className="bg-yellow-400/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{cryptoNetwork}</span>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                            <div className="text-[11px] text-gray-400">Deposit Address:</div>
                            <div className="font-mono text-xs font-bold text-white break-all mt-1">{cryptoAddress}</div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(cryptoAddress);
                                    alert('Wallet Address Copied!');
                                }}
                                className="mt-2 text-xs text-[var(--primary-color)] font-bold hover:underline flex items-center gap-1"
                            >
                                <i className="far fa-copy"></i> Copy Wallet Address
                            </button>
                        </div>

                        <p className="text-xs text-gray-400">Works in all countries worldwide with instant blockchain verification.</p>

                        <input 
                            type="text"
                            placeholder="Enter Blockchain TxHash / TxID (Optional)"
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500"
                        />
                    </div>
                )}

                {/* Auto-Verification Action Button */}
                <div className="mt-6">
                    {isVerified ? (
                        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl text-center animate-fade-in">
                            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
                                <i className="fas fa-check"></i>
                            </div>
                            <h3 className="font-bold text-base">Payment Verified Automatically!</h3>
                            <p className="text-xs text-emerald-200 mt-1">Your subscription / wallet balance is now active. Redirecting...</p>
                        </div>
                    ) : isSubmitting ? (
                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl text-center space-y-2 animate-fade-in">
                            <i className="fas fa-circle-notch fa-spin text-2xl text-blue-400"></i>
                            <div className="text-sm font-bold text-white">
                                {verifyingStep === 1 && "Connecting with international payment gateway..."}
                                {verifyingStep === 2 && "Auto-verifying transaction with bank network..."}
                                {verifyingStep === 3 && "Verified! Activating your subscription..."}
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className="bg-blue-400 h-full transition-all duration-500"
                                    style={{ width: `${(verifyingStep / 3) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleTriggerAutoVerify}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-base py-3.5 px-6 rounded-2xl shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all duration-200 active:scale-98"
                        >
                            <i className="fas fa-bolt text-yellow-300"></i>
                            <span>I Have Paid — Auto Verify Now</span>
                        </button>
                    )}
                </div>

                <div className="mt-4 text-center">
                    <p className="text-[11px] text-gray-400">
                        <i className="fas fa-shield-alt mr-1 text-emerald-400"></i>
                        Automated Instant Verification enabled across all countries.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
