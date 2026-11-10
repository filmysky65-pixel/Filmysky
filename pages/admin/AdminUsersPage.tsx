

import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../../types';
import { getAllUsers, deleteUser } from '../../services/firebaseService';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: 'single' | 'bulk'; targetId?: string }>({ isOpen: false, type: 'single' });

    useEffect(() => {
        const unsubscribe = getAllUsers(data => {
            setUsers(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const name = user.name || '';
            const email = user.email || '';
            return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   email.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [users, searchTerm]);

    const handleSelectAll = () => {
        if (selectedUserIds.length === filteredUsers.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(filteredUsers.map(u => u.id));
        }
    };

    const handleSelectUser = (id: string) => {
        setSelectedUserIds(prev => 
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const handleDeleteClick = (id: string) => {
        setConfirmModal({ isOpen: true, type: 'single', targetId: id });
    };

    const handleBulkDeleteClick = () => {
        setConfirmModal({ isOpen: true, type: 'bulk' });
    };

    const executeDelete = async () => {
        if (confirmModal.type === 'single' && confirmModal.targetId) {
            await deleteUser(confirmModal.targetId);
        } else if (confirmModal.type === 'bulk') {
            await Promise.all(selectedUserIds.map(id => deleteUser(id)));
            setSelectedUserIds([]);
        }
        setConfirmModal({ isOpen: false, type: 'single' });
    };

    const getSubscriptionStatus = (user: User) => {
        if (user.role) return { text: 'Admin', className: 'bg-purple-500/20 text-purple-300' };
        const sub = user.subscription;
        if (sub && ((sub.expiresAt && sub.expiresAt > Date.now()) || (sub.viewLimit && sub.viewLimit > (user.isAnonymous ? 100 : 300)))) {
            return { text: 'Premium', className: 'bg-green-500/20 text-green-300' };
        }
        return { text: 'Free', className: 'bg-gray-500/20 text-gray-300' };
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Users ({users.length})</h1>
                {selectedUserIds.length > 0 && (
                    <button 
                        onClick={handleBulkDeleteClick}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <i className="fas fa-trash"></i> Delete Selected ({selectedUserIds.length})
                    </button>
                )}
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                />
            </div>

            <div className="bg-[var(--card-bg)] rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--border-color)] text-[var(--secondary-text-color)] uppercase text-xs font-bold tracking-wider">
                            <th className="p-4 w-10 text-center">
                                <input 
                                    type="checkbox" 
                                    checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[var(--primary-color)] focus:ring-offset-0 focus:ring-1 focus:ring-[var(--primary-color)]"
                                />
                            </th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-[var(--secondary-text-color)]">
                                    No users found matching "{searchTerm}"
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => {
                                const subStatus = getSubscriptionStatus(user);
                                return (
                                    <tr key={user.id} className="hover:bg-[var(--border-color)]/30 transition-colors group">
                                        <td className="p-4 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedUserIds.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[var(--primary-color)] focus:ring-offset-0 focus:ring-1 focus:ring-[var(--primary-color)] cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-4 font-medium text-[var(--text-color)]">{user.name}</td>
                                        <td className="p-4 text-[var(--secondary-text-color)]">{user.email || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full ${subStatus.className}`}>
                                                {subStatus.text}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-[var(--secondary-text-color)]">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleDeleteClick(user.id)}
                                                className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                                                title="Delete User"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={executeDelete}
                title={confirmModal.type === 'bulk' ? "Delete Multiple Users?" : "Delete User?"}
                message={confirmModal.type === 'bulk' 
                    ? `Are you sure you want to delete ${selectedUserIds.length} selected users? This action cannot be undone.` 
                    : "Are you sure you want to delete this user? This will remove all their data permanently."}
            />
        </div>
    );
};

export default AdminUsersPage;