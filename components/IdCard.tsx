
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';

const IdCard: React.FC = () => {
    const { user, appSettings } = useAppContext();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const logoText = appSettings?.logoText || 'FilmySky';

    const isTimeBasedActive = user?.subscription?.expiresAt && user.subscription.expiresAt > Date.now();

    useEffect(() => {
        if (!isTimeBasedActive || !user?.subscription?.expiresAt) {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        const interval = setInterval(() => {
            const distance = user.subscription!.expiresAt - Date.now();
            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }
            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [user, isTimeBasedActive]);

    // if (!user) return null; // Allow guest card
    
    // Changed prefix from CNF to FSK
    const userName = user?.name || 'VIP Guest';
    const userIdDisplay = user 
        ? `ID: FSK-${user.createdAt?.toString().slice(-6) || '000000'}-${user.id.slice(0, 4).toUpperCase()}`
        : 'ID: FSK-VIP-GUEST';
        
    const planName = user?.subscription?.planName || (user ? 'Free' : 'VIP');
    
    // Always display unlimited now
    const viewLimitDisplay = 'Unlimited';

    const getPlanStyles = () => {
        switch (planName.toUpperCase()) {
            case 'GOLD': 
            case 'VIP':
                return 'text-[var(--gold-color)] border-[var(--gold-color)]';
            case 'PLATINUM': return 'text-[var(--platinum-color)] border-[var(--platinum-color)]';
            case 'DIAMOND': return 'text-[var(--diamond-color)] border-[var(--diamond-color)]';
            default: return 'text-[var(--secondary-text-color)] border-[var(--secondary-text-color)]';
        }
    };

    return (
        <div className="w-full h-56 flex justify-center items-center p-4 [perspective:2000px]">
            <div className="w-full max-w-sm h-full bg-gradient-to-br from-[#222] to-[#111] rounded-2xl p-4 flex flex-col relative [transform-style:preserve-3d] shadow-2xl hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] hover:shadow-[var(--primary-color)]/50 transition-all duration-500 ease-in-out hover:[transform:rotateY(0)_rotateX(0)_translateY(-5px)_scale(1.05)] [animation:float-rotate_12s_infinite_ease-in-out]">
                {/* Hologram */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent [background-size:300%_100%] [animation:shine_8s_infinite_linear] z-10 pointer-events-none rounded-2xl"></div>

                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <div className="text-xl font-bold text-white flex items-center">
                        <i className="fas fa-play-circle text-[var(--primary-color)] mr-2 text-lg"></i>
                        {logoText}
                    </div>
                    <span className="text-[10px] font-bold text-[var(--secondary-text-color)] tracking-widest">MEMBER</span>
                </div>

                <div className="flex gap-4 flex-grow">
                    <div className="w-20 h-24 bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-lg flex justify-center items-center text-5xl flex-shrink-0">
                        <i className="fas fa-user-astronaut"></i>
                    </div>
                    <div className="flex flex-col justify-between flex-grow">
                        <div>
                            <p className="text-lg font-bold leading-tight text-white">{userName}</p>
                            <p className="text-[10px] text-[var(--secondary-text-color)] tracking-wider uppercase">{userIdDisplay}</p>
                             <p className="text-[10px] text-[var(--secondary-text-color)] tracking-wider uppercase">Views: {viewLimitDisplay}</p>
                        </div>
                        <div className="mt-1">
                            <p className="text-[8px] text-[var(--secondary-text-color)] tracking-widest uppercase">
                                {isTimeBasedActive ? 'EXPIRES IN' : 'VALID THRU'}
                            </p>
                            <p className={`font-mono text-lg font-bold tracking-wider ${!isTimeBasedActive && !user?.role ? 'animate-pulse' : ''}`}>
                                {isTimeBasedActive ? `${String(timeLeft.days).padStart(2, '0')}d ${String(timeLeft.hours).padStart(2, '0')}h ${String(timeLeft.minutes).padStart(2, '0')}m` : 'Lifetime'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-auto pt-2 flex-shrink-0">
                    <div className={`text-xs font-bold px-2 py-1 border rounded-md ${getPlanStyles()}`}>
                        {planName} Member
                    </div>
                    {/* Chip */}
                    <div className="w-10 h-8 bg-gradient-to-br from-yellow-500 to-gray-400 rounded relative overflow-hidden">
                        <div className="absolute top-1/2 left-[-10px] right-[-10px] h-px bg-black/40"></div>
                        <div className="absolute left-1/2 top-[-10px] bottom-[-10px] w-px bg-black/40"></div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes float-rotate {
                    0% { transform: rotateY(-5deg) rotateX(10deg); }
                    50% { transform: rotateY(5deg) rotateX(-10deg) translateY(-10px); }
                    100% { transform: rotateY(-5deg) rotateX(10deg); }
                }
                .group:hover .id-card {
                    animation-play-state: paused;
                }
                @keyframes shine {
                    0% { background-position: 150% 0; }
                    100% { background-position: -150% 0; }
                }
            `}</style>
        </div>
    );
};

export default IdCard;
