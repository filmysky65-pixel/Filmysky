
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

interface AdminNavProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
    { to: '/admin', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { to: '/admin/youtube', icon: 'fab fa-youtube text-red-500', label: 'YouTube Manager' },
    { to: '/admin/content', icon: 'fas fa-film', label: 'Content' },
    { to: '/admin/livetv', icon: 'fas fa-tv', label: 'Live TV' },
    { to: '/admin/users', icon: 'fas fa-users', label: 'Users' },
    { to: '/admin/ads', icon: 'fas fa-bullhorn', label: 'Ads Manager' },
    { to: '/admin/requests', icon: 'fas fa-inbox', label: 'Requests' },
    { to: '/admin/subscriptions', icon: 'fas fa-crown', label: 'Subscriptions' },
    { to: '/admin/payments', icon: 'fas fa-money-check-alt', label: 'Payments' },
    { to: '/admin/contacts', icon: 'fas fa-envelope', label: 'Messages' },
    { to: '/admin/settings', icon: 'fas fa-cog', label: 'Settings' },
];

const AdminNav: React.FC<AdminNavProps> = ({ isOpen, setIsOpen }) => {
    const { appSettings } = useAppContext();
    const navigate = useNavigate();
    const logoText = appSettings?.logoText || 'FilmySky';

    const NavItem: React.FC<typeof navItems[0]> = ({ to, icon, label }) => (
        <NavLink
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-[var(--primary-color)] text-white' : 'hover:bg-[var(--border-color)]'
                }`
            }
            onClick={() => setIsOpen(false)}
        >
            <i className={`${icon.includes(' ') ? icon : 'fas ' + icon} w-6 text-center text-lg`}></i>
            <span className="font-semibold">{label}</span>
        </NavLink>
    );

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity md:hidden ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-[var(--card-bg)] border-r border-[var(--border-color)] p-4 flex flex-col z-50 transform transition-transform md:relative md:translate-x-0 md:flex ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex justify-between items-center mb-8">
                    <h1 onClick={() => navigate('/')} className="text-2xl font-bold cursor-pointer">{logoText} Admin</h1>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-xl">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto">
                    {navItems.map(item => <NavItem key={item.to} {...item} />)}
                </nav>
                
                 <button onClick={() => navigate('/')} className="mt-auto flex-shrink-0 flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-[var(--border-color)]">
                    <i className="fas fa-sign-out-alt w-6 text-center text-lg"></i>
                    <span className="font-semibold">Back to App</span>
                </button>
            </aside>
        </>
    );
};

export default AdminNav;
