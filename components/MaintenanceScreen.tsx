
import React, { useState, useEffect } from 'react';

interface MaintenanceScreenProps {
  status: string;
  config: any;
}

const CountdownItem: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="bg-black/30 p-3 rounded-lg min-w-[60px] text-center">
        <div className="text-3xl font-bold text-[var(--primary-color)]">{String(value).padStart(2, '0')}</div>
        <div className="text-xs text-[var(--secondary-text-color)]">{label}</div>
    </div>
);

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ status, config }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (status !== 'SCHEDULED' || !config?.scheduledEnd) return;

        const interval = setInterval(() => {
            const distance = config.scheduledEnd - Date.now();
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
    }, [status, config]);

    const isScheduled = status === 'SCHEDULED' && config?.scheduledEnd > Date.now();

    return (
        <div className="fixed inset-0 bg-black/95 flex justify-center items-center p-4 z-[99999]">
            <div className="bg-[var(--card-bg)] rounded-xl p-8 max-w-sm w-full text-center border border-[var(--border-color)]">
                <i className="fas fa-tools text-5xl text-[var(--primary-color)] mb-5"></i>
                <h2 className="text-2xl font-bold mb-3">{isScheduled ? 'Scheduled Maintenance' : 'Under Maintenance'}</h2>
                <p className="text-[var(--secondary-text-color)] leading-relaxed mb-6">
                    {isScheduled 
                        ? "The app is temporarily down for an update. We will be back online soon:" 
                        : "The app is currently down for maintenance. We'll be back shortly. Thank you for your patience!"}
                </p>
                {isScheduled && (
                    <div className="flex gap-3 justify-center">
                        <CountdownItem value={timeLeft.days} label="Days" />
                        <CountdownItem value={timeLeft.hours} label="Hours" />
                        <CountdownItem value={timeLeft.minutes} label="Mins" />
                        <CountdownItem value={timeLeft.seconds} label="Secs" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaintenanceScreen;