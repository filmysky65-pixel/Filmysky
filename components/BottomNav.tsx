
import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { to: '/', icon: 'fas fa-home', label: 'Home' },
    { to: '/movies', icon: 'fas fa-film', label: 'Movies' },
    { to: '/series', icon: 'fas fa-tv', label: 'Series' },
    { to: '/youtube', icon: 'fab fa-youtube', label: 'YouTube' },
    { to: '/profile', icon: 'fas fa-user', label: 'Profile' },
];

const BottomNav: React.FC = () => (
    <nav className="fixed bottom-4 left-1/2 z-50 flex h-[5.25rem] w-[94%] max-w-5xl -translate-x-1/2 items-center justify-around rounded-full border border-white/30 bg-[linear-gradient(110deg,rgba(194,157,101,0.78),rgba(92,75,72,0.84))] px-2 shadow-[0_12px_35px_rgba(0,0,0,0.5)] backdrop-blur-xl md:bottom-6 md:h-20 md:max-w-3xl md:px-5">
        {navItems.map(item => (
            <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 transition-colors ${isActive ? 'text-red-600' : 'text-white/60 hover:text-white'}`}
            >
                <i className={`${item.icon} text-xl sm:text-2xl md:text-3xl`} aria-hidden="true" />
                <span className="text-[10px] font-bold sm:text-xs md:text-sm">{item.label}</span>
            </NavLink>
        ))}
    </nav>
);

export default BottomNav;
