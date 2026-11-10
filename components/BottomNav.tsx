
import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { to: '/', icon: 'fas fa-home', label: 'Home' },
    { to: '/movies', icon: 'fas fa-film', label: 'Movies' },
    { to: '/series', icon: 'fas fa-tv', label: 'Series' },
    { to: '/youtube', icon: 'fab fa-youtube', label: 'YouTube' },
    { to: '/profile', icon: 'fas fa-user', label: 'Profile' },
];

const BottomNav: React.FC = () => {
    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-lg h-16 bg-[var(--card-bg)]/80 backdrop-blur-lg border border-[var(--border-color)] rounded-full shadow-2xl flex justify-around items-center z-50 md:hidden px-2">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => 
                        `flex flex-col items-center justify-center transition-all duration-300 relative ${
                            isActive ? 'text-[var(--primary-color)]' : 'text-gray-400'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <div className={`flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300 ${
                                isActive ? 'bg-[var(--primary-color)]/20' : ''
                            }`}>
                                <i className={`${item.icon} text-lg`}></i>
                            </div>
                            <span className={`text-[10px] mt-0.5 font-semibold transition-all duration-300 ${
                                isActive ? 'opacity-100' : 'opacity-70'
                            }`}>
                                {item.label}
                            </span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
