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
        <nav className="fixed bottom-3 left-1/2 z-50 w-[94%] max-w-[430px] -translate-x-1/2 rounded-[26px] border border-white/10 bg-[#101010]/95 px-1 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md md:hidden">
            <div className="grid grid-cols-5 gap-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center rounded-xl px-1 py-2 transition-all duration-200 ${
                                isActive ? 'text-[#ff2a2a]' : 'text-white/60'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`mb-1 flex h-7 w-7 items-center justify-center ${isActive ? 'text-[#ff2a2a]' : 'text-white/75'}`}>
                                    <i className={`${item.icon} text-lg`}></i>
                                </div>
                                <span className={`text-[10px] font-semibold ${isActive ? 'text-[#ff2a2a]' : 'text-white/70'}`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;

