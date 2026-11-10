
import React, { useState } from 'react';
import AdminNav from '../components/AdminNav';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false); // Revert to original name

    return (
        <div className="flex h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
            <AdminNav isOpen={isOpen} setIsOpen={setIsOpen} /> {/* Revert prop name */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="md:hidden flex justify-between items-center p-4 bg-[var(--card-bg)] border-b border-[var(--border-color)]">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                    <button onClick={() => setIsOpen(true)}>
                        <i className="fas fa-bars text-xl"></i>
                    </button>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;