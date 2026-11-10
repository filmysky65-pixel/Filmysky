
import React, { useState, useEffect } from 'react';
import { getDashboardStats, getOnlineUsersCount } from '../../services/firebaseService';

const StatCard: React.FC<{ icon: string; title: string; value: number | string; color: string }> = ({ icon, title, value, color }) => (

    <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl text-white ${color}`}>
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <p className="text-sm text-[var(--secondary-text-color)]">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);


const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalContent: 0, pendingRequests: 0 });
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats().then(data => {
            setStats(data);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load dashboard stats:", err);
            setLoading(false);
        });

        const unsubscribe = getOnlineUsersCount((count: number) => {
            setOnlineUsers(count);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {

        return <div className="flex justify-center items-center h-64"><i className="fas fa-spinner fa-spin text-4xl text-[var(--primary-color)]"></i></div>;
    }
    
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <StatCard icon="fa-users" title="Online Users" value={onlineUsers} color="bg-purple-500" />
               <StatCard icon="fa-users" title="Total Users" value={stats.totalUsers} color="bg-blue-500" />
               <StatCard icon="fa-film" title="Total Content" value={stats.totalContent} color="bg-green-500" />
               <StatCard icon="fa-inbox" title="Pending Requests" value={stats.pendingRequests} color="bg-yellow-500" />
            </div>

        </div>
    );
};

export default AdminDashboardPage;