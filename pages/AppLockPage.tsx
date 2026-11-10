
import React, { useState, useEffect, useCallback } from 'react';

interface AppLockPageProps {
  onUnlock: () => void;
}

const AppLockPage: React.FC<AppLockPageProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const hashPin = (p: string) => {
    return btoa(p.split('').reverse().join('') + 'FilmySky_SALT');
  };

  const verifyPin = useCallback(() => {
    const storedPin = localStorage.getItem('filmysky_app_pin');
    if (hashPin(pin) === storedPin) {
      onUnlock();
    } else {
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 500);
    }
  }, [pin, onUnlock]);
  
  useEffect(() => {
    if (pin.length === 4) {
      verifyPin();
    }
  }, [pin, verifyPin]);

  const handleKeyClick = (key: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + key);
    }
  };
  
  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };
  
  const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];

  return (
    <div className="fixed inset-0 bg-[var(--bg-color)] flex flex-col justify-center items-center z-[3000] p-4">
      <div className={`w-full max-w-xs text-center ${isShaking ? 'animate-shake' : ''}`}>
        <h2 className="text-2xl font-bold mb-6 text-[var(--text-color)]">Enter Your PIN</h2>
        <div className="flex justify-center gap-4 mb-8 h-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full transition-colors ${
                i < pin.length ? 'bg-[var(--primary-color)]' : 'bg-[var(--border-color)]'
              }`}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-5">
          {keypadKeys.map((key) => {
            if(key === '') return <div key={key}></div>
            return (
              <button
                key={key}
                onClick={() => (key === 'backspace' ? handleBackspace() : handleKeyClick(key))}
                className="bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] text-3xl font-bold rounded-full w-20 h-20 flex justify-center items-center transition-colors hover:bg-[var(--border-color)]"
              >
                {key === 'backspace' ? <i className="fas fa-backspace"></i> : key}
              </button>
            )
          })}
        </div>
      </div>
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
};

export default AppLockPage;
