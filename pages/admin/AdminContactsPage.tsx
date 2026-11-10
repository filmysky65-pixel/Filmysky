
import React, { useState, useEffect } from 'react';
import { ContactMessage } from '../../types';
import { getContactMessages } from '../../services/firebaseService';

const AdminContactsPage: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = getContactMessages(data => {
            setMessages(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i></div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
            
            {messages.length === 0 ? (
                 <div className="p-6 text-center text-[var(--secondary-text-color)] bg-[var(--card-bg)] rounded-lg">
                    You have no new messages.
                </div>
            ) : (
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className="bg-[var(--card-bg)] p-4 rounded-lg border-l-4 border-[var(--primary-color)]">
                           <div className="flex justify-between items-center mb-2">
                                <div>
                                    <p className="font-bold text-lg">{msg.name}</p>
                                    <a href={`mailto:${msg.email}`} className="text-sm text-[var(--primary-color)] hover:underline">{msg.email}</a>
                                </div>
                                <p className="text-xs text-[var(--secondary-text-color)]">{new Date(msg.submittedAt).toLocaleString()}</p>
                           </div>
                           <p className="text-[var(--secondary-text-color)] whitespace-pre-wrap">{msg.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminContactsPage;