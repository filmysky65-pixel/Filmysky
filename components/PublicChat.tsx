import React, { useState, useEffect, useRef } from 'react';
import { getPublicChatMessages, sendPublicChatMessage } from '../services/firebaseService';
import { useAppContext } from '../hooks/useAppContext';

const PublicChat: React.FC = () => {
    const { user } = useAppContext();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [guestName, setGuestName] = useState('');
    const [isNameSet, setIsNameSet] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = getPublicChatMessages((msgs) => {
            // Client-side filter to be double sure about 24h limit display
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            const validMsgs = msgs.filter(m => m.timestamp > oneDayAgo);
            setMessages(validMsgs);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (user) {
            setGuestName(user.name);
            setIsNameSet(true);
        } else {
            const storedName = localStorage.getItem('filmysky_guest_name');
            if (storedName) {
                setGuestName(storedName);
                setIsNameSet(true);
            }
        }
    }, [user]);

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (guestName.trim()) {
            localStorage.setItem('filmysky_guest_name', guestName.trim());
            setIsNameSet(true);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await sendPublicChatMessage(guestName, newMessage.trim(), user?.id);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message.");
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg flex flex-col h-[500px]">
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <i className="fas fa-comments text-[var(--primary-color)]"></i> Community Chat
                </h2>
                <div className="text-xs text-[var(--secondary-text-color)]">
                    Messages disappear after 24 hours
                </div>
            </div>

            {!isNameSet ? (
                <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                    <i className="fas fa-user-circle text-5xl mb-4 text-[var(--secondary-text-color)]"></i>
                    <h3 className="text-lg font-semibold mb-2">Join the Conversation</h3>
                    <p className="text-sm text-[var(--secondary-text-color)] mb-4">Enter your name to start chatting.</p>
                    <form onSubmit={handleNameSubmit} className="w-full max-w-xs flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Your Name" 
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="flex-grow p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg"
                            required
                        />
                        <button type="submit" className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-bold">
                            Join
                        </button>
                    </form>
                </div>
            ) : (
                <>
                    <div className="flex-grow overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-[var(--secondary-text-color)]">
                                No messages yet. Be the first to say hi!
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = (user && msg.userId === user.id) || (!user && msg.userName === guestName);
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[80%] rounded-lg p-3 ${isMe ? 'bg-[var(--primary-color)] text-white' : 'bg-[var(--bg-color)] border border-[var(--border-color)]'}`}>
                                            {!isMe && <p className="text-xs font-bold mb-1 opacity-75">{msg.userName}</p>}
                                            <p className="break-words text-sm">{msg.text}</p>
                                        </div>
                                        <span className="text-[10px] text-[var(--secondary-text-color)] mt-1 px-1">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 border-t border-[var(--border-color)] flex gap-2">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Message as ${guestName}...`}
                            className="flex-grow p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg"
                        />
                        <button 
                            type="submit" 
                            disabled={!newMessage.trim()}
                            className="w-10 h-10 bg-[var(--primary-color)] text-white rounded-lg flex items-center justify-center disabled:opacity-50"
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default PublicChat;
