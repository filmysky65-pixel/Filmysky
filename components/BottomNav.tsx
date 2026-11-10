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
    <nav aria-label="Bottom navigation" className="fixed bottom-4 left-1/2 z-50 w-[94%] max-w-[560px] -translate-x-1/2 rounded-full border border-[#d9c39d]/70 bg-[linear-gradient(110deg,rgba(191,157,112,.88),rgba(83,65,57,.92))] px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,.55)] backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5 items-center">
            {navItems.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `flex min-w-0 flex-col items-center justify-center gap-1 py-1.5 transition-colors ${isActive ? 'text-[#f20d20]' : 'text-[#c2c3cf]'}`}>
                    <i className={`${item.icon} text-[21px]`} aria-hidden="true"></i>
                    <span className="text-[11px] font-semibold leading-tight">{item.label}</span>
                </NavLink>
            ))}
        </div>
    </nav>
);

export default BottomNav;
