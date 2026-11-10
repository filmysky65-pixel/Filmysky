import React from 'react';
import { NavLink } from 'react-router-dom';

export const YouTubeFooter: React.FC = () => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-[56px] bg-[#0f0f0f] border-t border-[#272727] flex items-center justify-around px-2 select-none"
      aria-label="YouTube Navigation"
    >
      {/* 1. HOME */}
      <NavLink
        to="/youtube"
        end
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            isActive ? 'text-[#ff0000]' : 'text-[#aaaaaa] hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <svg
              className="w-6 h-6 mb-0.5"
              viewBox="0 0 24 24"
              fill={isActive ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={isActive ? '0' : '2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={isActive ? 'currentColor' : 'currentColor'} />
            </svg>
            <span className="text-[10px] font-bold tracking-wider">HOME</span>
          </>
        )}
      </NavLink>

      {/* 2. Shorts */}
      <NavLink
        to="/youtube/shorts"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            isActive ? 'text-[#ff0000]' : 'text-[#aaaaaa] hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <svg
              className="w-6 h-6 mb-0.5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {/* YouTube Shorts Icon with bolt inside play badge */}
              <path d="M17.77 10.32l-1.2-.5a3.9 3.9 0 0 0-5.1-2.1l-1.2.5v-.02a3.9 3.9 0 0 0-5.1 5.1l1.2.5a3.9 3.9 0 0 0 5.1 2.1l1.2-.5v.02a3.9 3.9 0 0 0 5.1-5.1z" opacity={isActive ? "1" : "0.9"} />
              <polygon points="10 9.5 15 12 10 14.5 10 9.5" fill={isActive ? "#0f0f0f" : "#ffffff"} />
            </svg>
            <span className="text-[10px] font-medium tracking-normal">Shorts</span>
          </>
        )}
      </NavLink>

      {/* 3. SUBSCRIPTIONS */}
      <NavLink
        to="/youtube/subscriptions"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            isActive ? 'text-[#ff0000]' : 'text-[#aaaaaa] hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <svg
              className="w-6 h-6 mb-0.5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {/* Stacked Subscriptions Box with '+' icon */}
              <path d="M20 7H4V5h16v2zm-2-4H6v2h12V3zm4 8v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V11c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-2 0H4v10h16V11zm-7 2h-2v2H9v2h2v2h2v-2h2v-2h-2v-2z" />
            </svg>
            <span className="text-[10px] font-bold tracking-wider">SUBSCRIPTIONS</span>
          </>
        )}
      </NavLink>

      {/* 4. LIBRARY */}
      <NavLink
        to="/youtube/library"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
            isActive ? 'text-[#ff0000]' : 'text-[#aaaaaa] hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <svg
              className="w-6 h-6 mb-0.5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {/* Overlapping Library/Video Reels Icon with play symbol */}
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
            </svg>
            <span className="text-[10px] font-bold tracking-wider">LIBRARY</span>
          </>
        )}
      </NavLink>
    </nav>
  );
};

export default YouTubeFooter;
