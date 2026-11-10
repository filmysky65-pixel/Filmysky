
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LiveTvStream, LiveTvNetwork } from '../../types';
import {
    getLiveTvNetworkById,
    getLiveTvStreams,
    addLiveTvStream,
    updateLiveTvStream,
    deleteLiveTvStream
} from '../../services/firebaseService';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminLiveTvStreamsPage: React.FC = () => {
    const { networkId } = useParams<{ networkId: string }>();
    const navigate = useNavigate();
    const [network, setNetwork] = useState<LiveTvNetwork | null>(null);
    const [streams, setStreams] = useState<LiveTvStream[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentStream, setCurrentStream] = useState<Partial<LiveTvStream>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (!networkId) {
            navigate('/admin/livetv');
            return;
        }

        const fetchNetwork = async () => {
            const net = await getLiveTvNetworkById(networkId);
            setNetwork(net);
        };
        fetchNetwork();

        const unsubscribe = getLiveTvStreams(networkId, data => {
            setStreams(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [networkId, navigate]);

    const handleSave = async () => {
        if (!networkId || !currentStream.title || !currentStream.poster || !currentStream.streamUrl) {
            alert("All fields are required.");
            return;
        }

        if (currentStream.id) { // Update
            await updateLiveTvStream(networkId, currentStream.id, currentStream as LiveTvStream);
        } else { // Add
            await addLiveTvStream(networkId, currentStream as Omit<LiveTvStream, 'id'>);
        }
        setCurrentStream({});
        setIsEditing(false);
    };

    const handleDeleteClick = (streamId: string) => {
        setSelectedId(streamId);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedId && networkId) {
            await deleteLiveTvStream(networkId, selectedId);
            setSelectedId(null);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (stream: LiveTvStream) => {
        setCurrentStream(stream);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setCurrentStream({});
        setIsEditing(false);
    };

    return (
        <div>
            <div className="mb-6">
                 <button onClick={() => navigate('/admin/livetv')} className="text-sm text-[var(--secondary-text-color)] hover:text-[var(--text-color)] mb-4">
                    <i className="fas fa-arrow-left mr-2"></i> Back to Networks
                </button>
                 <h1 className="text-2xl font-bold">Manage Streams for "{network?.name}"</h1>
            </div>
           
            <div className="flex justify-end mb-4">
                {!isEditing && <button onClick={() => setIsEditing(true)} className="bg-[var(--primary-color)] text-white font-bold py-2 px-4 rounded-lg">Add New Stream</button>}
            </div>

            {isEditing && (
                <div className="bg-[var(--card-bg)] p-4 rounded-lg mb-6 space-y-3">
                    <h2 className="font-bold">{currentStream.id ? 'Edit' : 'Add'} Stream</h2>
                    <input placeholder="Title" value={currentStream.title || ''} onChange={(e) => setCurrentStream(p => ({...p, title: e.target.value}))} className="w-full mt-1 p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg" />
                    <input placeholder="16:9 Poster URL" value={currentStream.poster || ''} onChange={(e) => setCurrentStream(p => ({...p, poster: e.target.value}))} className="w-full mt-1 p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg" />
                    <div>
                        <input placeholder="Stream Embed URL" value={currentStream.streamUrl || ''} onChange={(e) => setCurrentStream(p => ({...p, streamUrl: e.target.value}))} className="w-full mt-1 p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg" />
                        <p className="text-xs text-[var(--secondary-text-color)] mt-1">
                            Enter the full embeddable URL for the stream (e.g., from YouTube, Vimeo, or other sources). Make sure embedding is permitted by the provider.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="bg-green-500 text-white py-2 px-4 rounded">Save</button>
                        <button onClick={handleCancel} className="bg-gray-500 text-white py-2 px-4 rounded">Cancel</button>
                    </div>
                </div>
            )}

            <div className="bg-[var(--card-bg)] rounded-lg shadow-md overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[var(--border-color)]">
                            <th className="p-4">Poster</th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Stream URL</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {streams.map(stream => (
                            <tr key={stream.id} className="border-b border-[var(--border-color)] last:border-b-0">
                                <td className="p-2"><img src={stream.poster} alt={stream.title} className="w-24 aspect-video object-cover rounded"/></td>
                                <td className="p-4 font-semibold">{stream.title}</td>
                                <td className="p-4 font-mono text-sm truncate max-w-xs">{stream.streamUrl}</td>
                                <td className="p-4 flex gap-4">
                                    <button onClick={() => handleEdit(stream)} className="text-blue-400 hover:text-blue-600 transition-colors text-lg" title="Edit">
                                        <i className="fas fa-pen"></i>
                                    </button>
                                    <button onClick={() => handleDeleteClick(stream.id)} className="text-red-400 hover:text-red-600 transition-colors text-lg" title="Delete">
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
                title="Delete Stream"
                message="Are you sure you want to delete this stream? This action is permanent."
            />
        </div>
    );
};

export default AdminLiveTvStreamsPage;
