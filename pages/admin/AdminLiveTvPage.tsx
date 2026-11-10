

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LiveTvNetwork } from '../../types';
import { getLiveTvNetworks, addLiveTvNetwork, updateLiveTvNetwork, deleteLiveTvNetwork } from '../../services/firebaseService';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminLiveTvPage: React.FC = () => {
    const [networks, setNetworks] = useState<LiveTvNetwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentNetwork, setCurrentNetwork] = useState<Partial<LiveTvNetwork>>({});
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = getLiveTvNetworks(data => {
            setNetworks(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const handleSave = async () => {
        if (!currentNetwork.name || !currentNetwork.poster) {
            alert("Name and Poster URL are required.");
            return;
        }
        setLoading(true);
        if (currentNetwork.id) { // Update
            await updateLiveTvNetwork(currentNetwork.id, currentNetwork as LiveTvNetwork);
        } else { // Add
            await addLiveTvNetwork(currentNetwork as Omit<LiveTvNetwork, 'id'>);
        }
        setCurrentNetwork({});
        setIsEditing(false);
        setLoading(false);
    };
    
    const handleDeleteClick = (id: string) => {
        setSelectedId(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedId) {
            await deleteLiveTvNetwork(selectedId);
            setSelectedId(null);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (network: LiveTvNetwork) => {
        setCurrentNetwork(network);
        setIsEditing(true);
        window.scrollTo(0, 0);
    };

    const handleCancel = () => {
        setCurrentNetwork({});
        setIsEditing(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Live TV Networks</h1>
                {!isEditing && <button onClick={() => setIsEditing(true)} className="bg-[var(--primary-color)] text-white font-bold py-2 px-4 rounded-lg">Add New Network</button>}
            </div>

            {isEditing && (
                <div className="bg-[var(--card-bg)] p-4 rounded-lg mb-6 space-y-3">
                    <h2 className="font-bold text-lg">{currentNetwork.id ? 'Edit Network' : 'Add New Network'}</h2>
                    <input placeholder="Network Name" value={currentNetwork.name || ''} onChange={(e) => setCurrentNetwork(p => ({...p, name: e.target.value}))} className="w-full mt-1 p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg" />
                    <input placeholder="1:1 Poster URL" value={currentNetwork.poster || ''} onChange={(e) => setCurrentNetwork(p => ({...p, poster: e.target.value}))} className="w-full mt-1 p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg" />
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={loading} className="bg-green-500 text-white py-2 px-4 rounded disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={handleCancel} className="bg-gray-500 text-white py-2 px-4 rounded">Cancel</button>
                    </div>
                </div>
            )}
            
            <div className="bg-[var(--card-bg)] rounded-lg shadow-md overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[var(--border-color)]">
                            <th className="p-4">Poster</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {networks.map(network => (
                            <tr key={network.id} className="border-b border-[var(--border-color)] last:border-b-0">
                                <td className="p-2"><img src={network.poster} alt={network.name} className="w-24 aspect-square object-cover rounded"/></td>
                                <td className="p-4 font-semibold">{network.name}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => navigate(`/admin/livetv/${network.id}`)} className="bg-blue-500 text-white text-sm font-bold py-2 px-3 rounded-lg">Manage Streams</button>
                                        <button onClick={() => handleEdit(network)} className="text-yellow-400 hover:text-yellow-600 transition-colors text-lg" title="Edit">
                                            <i className="fas fa-pen"></i>
                                        </button>
                                        <button onClick={() => handleDeleteClick(network.id)} className="text-red-400 hover:text-red-600 transition-colors text-lg" title="Delete">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
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
                title="Delete Network"
                message="Are you sure you want to delete this entire network and all its streams? This action cannot be undone."
            />
        </div>
    );
};

export default AdminLiveTvPage;