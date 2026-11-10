import React, { useState, useEffect } from 'react';
import { PaymentRequest } from '../../types';
import { getPaymentRequests, updatePaymentRequestStatus } from '../../services/firebaseService';

const AdminPaymentsPage: React.FC = () => {
    const [requests, setRequests] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        setLoading(true);
        const unsubscribe = getPaymentRequests(data => {
            setRequests(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (requestId: string, status: 'approved' | 'rejected') => {
        const originalRequests = [...requests];
        // Optimistically update UI
        setRequests(prev => prev.map(r => r.id === requestId ? {...r, status} : r));
        
        const result = await updatePaymentRequestStatus(requestId, status);
        if (!result.success) {
            alert(`Failed: ${result.message}`);
            // Revert UI on failure
            setRequests(originalRequests);
        }
    };
    
    const filteredRequests = requests.filter(r => filter === 'all' ? true : r.status === filter);

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const approvedCount = requests.filter(r => r.status === 'approved').length;
    const autoVerifiedCount = requests.filter(r => r.autoVerified).length;

    const getGatewayBadge = (gateway?: string) => {
        switch (gateway) {
            case 'card':
                return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full"><i className="far fa-credit-card mr-1"></i>Card</span>;
            case 'paypal':
                return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full"><i className="fab fa-paypal mr-1"></i>PayPal</span>;
            case 'crypto':
                return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full"><i className="fab fa-bitcoin mr-1"></i>Crypto USDT</span>;
            case 'upi':
            default:
                return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full"><i className="fas fa-qrcode mr-1"></i>UPI / India</span>;
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Global Payment Requests</h1>
                    <p className="text-xs text-[var(--secondary-text-color)] mt-1">Manage domestic (UPI) & international (Card, PayPal, Crypto) payments</p>
                </div>

                <div className="flex gap-2 text-xs">
                    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] px-3 py-1.5 rounded-lg">
                        <span className="text-[var(--secondary-text-color)]">Auto-Verified:</span> <strong className="text-emerald-400">{autoVerifiedCount}</strong>
                    </div>
                    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] px-3 py-1.5 rounded-lg">
                        <span className="text-[var(--secondary-text-color)]">Approved:</span> <strong className="text-blue-400">{approvedCount}</strong>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
                <button onClick={() => setFilter('pending')} className={`py-2 px-4 ${filter === 'pending' ? 'border-b-2 border-[var(--primary-color)] font-bold' : 'text-[var(--secondary-text-color)]'}`}>
                    Pending ({pendingCount})
                </button>
                <button onClick={() => setFilter('approved')} className={`py-2 px-4 ${filter === 'approved' ? 'border-b-2 border-[var(--primary-color)] font-bold' : 'text-[var(--secondary-text-color)]'}`}>
                    Approved ({approvedCount})
                </button>
                <button onClick={() => setFilter('rejected')} className={`py-2 px-4 ${filter === 'rejected' ? 'border-b-2 border-[var(--primary-color)] font-bold' : 'text-[var(--secondary-text-color)]'}`}>
                    Rejected
                </button>
                <button onClick={() => setFilter('all')} className={`py-2 px-4 ${filter === 'all' ? 'border-b-2 border-[var(--primary-color)] font-bold' : 'text-[var(--secondary-text-color)]'}`}>
                    All
                </button>
            </div>

            {loading ? (
                 <div className="flex justify-center items-center h-64"><i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i></div>
            ) : filteredRequests.length === 0 ? (
                <div className="p-6 text-center text-[var(--secondary-text-color)]">
                    No {filter} requests found.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map(req => (
                        <div key={req.id} className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)] flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="flex-grow space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p><strong className="font-semibold text-white">{req.userName}</strong> ({req.userEmail || 'No Email'})</p>
                                    {getGatewayBadge(req.gateway)}
                                    {req.country && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">{req.country}</span>}
                                    {req.autoVerified && (
                                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <i className="fas fa-bolt text-[9px]"></i> Auto-Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm">
                                    Requested <strong className="text-[var(--primary-color)]">{req.planName || (req.type === 'wallet' ? 'Wallet Recharge' : 'Subscription')}</strong> for <strong className="text-emerald-400">₹{req.amount} {req.currency || 'INR'}</strong>
                                </p>
                                <p className="text-xs text-[var(--secondary-text-color)]">Date: {new Date(req.requestedAt).toLocaleString()}</p>
                                <div className="font-mono text-xs bg-[var(--bg-color)] p-2.5 rounded-lg mt-2 space-y-1">
                                    <p>Note: <span className="text-yellow-400 font-bold">{req.transactionNote}</span></p>
                                    {req.upiId && <p>UPI ID: {req.upiId}</p>}
                                    {req.userTransactionId && <p>User Txn Ref: {req.userTransactionId}</p>}
                                    <p className="text-[11px] text-[var(--secondary-text-color)]">Status: <span className={`uppercase font-bold ${req.status === 'approved' ? 'text-emerald-400' : req.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>{req.status}</span></p>
                                </div>
                            </div>
                            {req.status === 'pending' && (
                                <div className="flex-shrink-0 flex gap-2 w-full md:w-auto">
                                    <button onClick={() => handleStatusChange(req.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex-1">
                                        Approve
                                    </button>
                                    <button onClick={() => handleStatusChange(req.id, 'rejected')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex-1">
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPaymentsPage;
