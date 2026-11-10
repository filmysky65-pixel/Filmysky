
import React, { useState, useEffect } from 'react';
import { Comment } from '../types';
import { getComments, addComment } from '../services/firebaseService';
import { useAppContext } from '../hooks/useAppContext';
import { useNavigate } from 'react-router-dom';

interface CommentsSectionProps {
  contentId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ contentId }) => {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!contentId) return;
        const unsubscribe = getComments(contentId, (fetchedComments) => {
            // Show latest 50 comments. In firebaseService, comments are sorted newest-first.
            setComments(fetchedComments.slice(0, 50));
        });
        return () => unsubscribe();
    }, [contentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || newComment.trim() === '') return;

        if (user.isAnonymous) {
            navigate('/auth');
            return;
        }

        setIsLoading(true);
        try {
            await addComment(contentId, user.id, user.name, newComment.trim());
            setNewComment('');
        } catch (error) {
            console.error("Failed to add comment:", error);
            alert("Could not post comment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const timeSince = (date: number) => {
        const seconds = Math.floor((Date.now() - date) / 1000);
        if (seconds < 5) return "Just now";
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold mb-4 flex-shrink-0">Comments ({comments.length})</h3>
            
            <div className="flex-grow overflow-y-auto pr-1 space-y-4 pb-20 md:pb-0">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                        <div className="w-10 h-10 bg-[var(--border-color)] rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-user text-[var(--secondary-text-color)]"></i>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm">{comment.userName}</p>
                                <p className="text-xs text-[var(--secondary-text-color)]">{timeSince(comment.timestamp)}</p>
                            </div>
                            <p className="text-sm text-[var(--secondary-text-color)] mt-1 break-words">{comment.text}</p>
                        </div>
                    </div>
                ))}
                 {comments.length === 0 && (
                    <p className="text-center text-sm text-[var(--secondary-text-color)] py-4">
                        Be the first to comment.
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-[var(--border-color)] fixed bottom-0 left-0 right-0 bg-[var(--card-bg)] p-3 z-10 md:relative md:p-0 md:pt-4 md:bg-transparent md:flex-shrink-0 md:mt-auto">
                <div className="flex items-center gap-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={user?.isAnonymous ? "Login to post a comment..." : "Add a public comment..."}
                        className="w-full p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg text-sm resize-none"
                        rows={1}
                        disabled={isLoading || user?.isAnonymous}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || newComment.trim() === ''}
                        className="bg-[var(--primary-color)] text-white font-bold h-10 w-10 flex items-center justify-center rounded-lg text-lg disabled:opacity-50 flex-shrink-0"
                    >
                        {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommentsSection;
