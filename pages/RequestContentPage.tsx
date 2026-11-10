

import React, { useState } from 'react';
import { addContentRequest } from '../services/firebaseService';
import { useAppContext } from '../hooks/useAppContext';
import { useNavigate } from 'react-router-dom';

const RequestContentPage: React.FC = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'Movie' | 'Series'>('Movie');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("You must be logged in to make a request.");
            return;
        }
        if (!title) {
            alert("Title is required.");
            return;
        }

        setIsLoading(true);
        try {
            await addContentRequest(user.id, user.name, title, type, notes);
            setMessage('Your request has been submitted successfully! We will review it shortly.');
            setTitle('');
            setType('Movie');
            setNotes('');
            setTimeout(() => navigate('/'), 3000);
        } catch (error) {
            setMessage('An error occurred. Please try again.');
            console.error("Failed to submit request:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Request Content</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="title">Title</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg" required />
                </div>
                <div>
                    <label htmlFor="type">Type</label>
                    <select id="type" value={type} onChange={(e) => setType(e.target.value as 'Movie' | 'Series')} className="w-full mt-1 p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg">
                        <option value="Movie">Movie</option>
                        <option value="Series">Web Series</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="notes">Notes (optional)</label>
                    <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full mt-1 p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg" placeholder="e.g., specific language, director, release year..." />
                </div>
                
                <button type="submit" disabled={isLoading} className="w-full bg-[var(--primary-color)] text-white font-bold py-3 rounded-lg disabled:opacity-50">
                    {isLoading ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>
            {message && <p className="mt-4 text-center">{message}</p>}
        </div>
    );
};

export default RequestContentPage;