

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Content } from '../../types';
import { getAllContent, deleteContent, updateContent } from '../../services/firebaseService';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminContentPage: React.FC = () => {
    const [content, setContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = getAllContent(data => {
            setContent(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDeleteClick = (id: string) => {
        setSelectedId(id);
        setIsModalOpen(true);
    };
    
    const confirmDelete = async () => {
        if (selectedId) {
            await deleteContent(selectedId);
            setSelectedId(null);
        }
        setIsModalOpen(false);
    };

    const handleBumpTop = async (content: any) => {
        // Set createdAt to current time to make it latest
        await updateContent(content.id, { ...content, createdAt: Date.now() });
    };

    const handleBumpBottom = async (content: any) => {
        // Set createdAt to 0 to make it last
        await updateContent(content.id, { ...content, createdAt: 0 });
    };

    const filteredContent = content.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center items-center h-64"><i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i></div>;
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-2xl font-bold">Manage Content</h1>
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full max-w-xs p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg"
                    />
                    <button onClick={() => navigate('/admin/content/new')} className="bg-[var(--primary-color)] text-white font-bold py-2 px-4 rounded-lg flex-shrink-0">
                        Add New
                    </button>
                </div>
            </div>
            <div className="bg-[var(--card-bg)] rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[var(--border-color)]">
                            <th className="p-4">Title</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContent.map(item => (
                            <tr key={item.id} className="border-b border-[var(--border-color)] last:border-b-0">
                                <td className="p-4">
                                    <div className="font-semibold text-[var(--text-color)]">{item.title}</div>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                        {item.imdbId && (
                                            <span className="inline-flex items-center gap-1 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30 font-mono">
                                                <i className="fab fa-imdb"></i> {item.imdbId}
                                            </span>
                                        )}
                                        {item.tmdbId && (
                                            <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 font-mono">
                                                TMDB: {item.tmdbId}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 capitalize">{item.type}</td>
                                <td className="p-4">{item.category}</td>
                                <td className="p-4 flex gap-4">
                                    <button onClick={() => handleBumpTop(item)} className="text-green-400 hover:text-green-600 transition-colors text-lg" title="Make Latest (Top)">
                                        <i className="fas fa-arrow-up"></i>
                                    </button>
                                    <button onClick={() => handleBumpBottom(item)} className="text-yellow-400 hover:text-yellow-600 transition-colors text-lg" title="Make Oldest (Bottom)">
                                        <i className="fas fa-arrow-down"></i>
                                    </button>
                                    <button onClick={() => navigate(`/admin/content/edit/${item.id}`)} className="text-blue-400 hover:text-blue-600 transition-colors text-lg" title="Edit">
                                        <i className="fas fa-pen"></i>
                                    </button>
                                    <button onClick={() => handleDeleteClick(item.id)} className="text-red-400 hover:text-red-600 transition-colors text-lg" title="Delete">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Content"
                message="Are you sure you want to delete this item? This action cannot be undone."
            />
        </div>
    );
};

export default AdminContentPage;