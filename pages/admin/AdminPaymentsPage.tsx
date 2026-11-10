
import React, { useState, useEffect } from 'react';
import { PaymentRequest } from '../../types';
import { getPaymentRequests, updatePaymentRequestStatus } from '../../services/firebaseService';

const AdminPaymentsPage: React.FC = () => {
    const [requests, setRequests] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

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
    
    const filteredRequests = requests.filter(r => r.status === filter);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Payment Requests</h1>

            <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
                <button onClick={() => setFilter('pending')} className={`py-2 px-4 ${filter === 'pending' ? 'border-b-2 border-[var(--primary-color)] font-bold' : 'text-[var(--secondary-text-color)]'}`}>
                    Pending ({requests.filter(r => r.status === 'pending').length})
                </button>
                <button onClick={() => setFilter('approved')} className={`py-2 px-4 ${filter === 'approved' ? 'border-b-2 border-[var(--primary-color)] font-bold' : 'text-[var(--secondary-text-color)]'}`}>
                    Approved
                </button>
                 <button onClick={() => setFilter('rejected')} className={`py-2 px-4 ${filter === 'rejected' ? 'border-b-2 border-[var(--primary-color)] font-bold' : 'text-[var(--secondary-text-color)]'}`}>
                    Rejected
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
                        <div key={req.id} className="bg-[var(--card-bg)] p-4 rounded-lg flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="flex-grow space-y-1">
                                <p><strong className="font-semibold text-white">{req.userName}</strong> ({req.userEmail})</p>
                                <p className="text-sm">Requested <strong className="text-[var(--primary-color)]">{req.planName}</strong> for <strong className="text-[var(--primary-color)]">₹{req.amount}</strong></p>
                                <p className="text-xs text-[var(--secondary-text-color)]">Date: {new Date(req.requestedAt).toLocaleString()}</p>
                                <div className="font-mono text-xs bg-[var(--bg-color)] p-2 rounded mt-2">
                                    <p>Note: <span className="text-yellow-400">{req.transactionNote}</span></p>
                                    <p>UPI ID: {req.upiId}</p>
                                    {req.userTransactionId && <p>User Txn ID: {req.userTransactionId}</p>}
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
