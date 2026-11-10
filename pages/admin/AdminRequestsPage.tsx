
import React, { useState, useEffect } from 'react';
import { ContentRequest } from '../../types';
import { getContentRequests, updateContentRequestStatus } from '../../services/firebaseService';

const AdminRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<ContentRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = getContentRequests(data => {
            setRequests(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (requestId: string, status: 'completed' | 'rejected') => {
        await updateContentRequestStatus(requestId, status);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-300';
            case 'completed': return 'bg-green-500/20 text-green-300';
            case 'rejected': return 'bg-red-500/20 text-red-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i></div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Content Requests</h1>
            <div className="bg-[var(--card-bg)] rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[var(--border-color)]">
                            <th className="p-4">Title</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Requested By</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(request => (
                            <tr key={request.id} className="border-b border-[var(--border-color)] last:border-b-0">
                                <td className="p-4 font-semibold">{request.title}</td>
                                <td className="p-4">{request.type}</td>
                                <td className="p-4 text-sm text-[var(--secondary-text-color)]">{request.userName}</td>
                                <td className="p-4 text-sm">{new Date(request.requestedAt).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${getStatusColor(request.status)}`}>
                                        {request.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {request.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleStatusChange(request.id, 'completed')} 
                                                className="text-green-400 hover:text-green-600 transition-colors text-lg" 
                                                title="Mark as Completed"
                                            >
                                                <i className="fas fa-check-circle"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(request.id, 'rejected')} 
                                                className="text-red-400 hover:text-red-600 transition-colors text-lg" 
                                                title="Reject"
                                            >
                                                <i className="fas fa-times-circle"></i>
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {requests.length === 0 && (
                    <div className="p-6 text-center text-[var(--secondary-text-color)]">
                        No pending requests found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRequestsPage;
