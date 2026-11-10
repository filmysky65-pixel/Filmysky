import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface YouTubeHeaderProps {
  initialSearchQuery?: string;
  onSearch?: (query: string) => void;
}

export const YouTubeHeader: React.FC<YouTubeHeaderProps> = ({ initialSearchQuery = '', onSearch }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState(initialSearchQuery);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigate(`/youtube/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#272727] flex items-center justify-between px-3 md:px-6">
      {searchOpen ? (
        <form onSubmit={handleSearchSubmit} className="flex items-center w-full gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="p-2 text-gray-300 hover:text-white"
            aria-label="Close search"
          >
            <i className="fas fa-arrow-left text-lg"></i>
          </button>
          <div className="flex-1 flex items-center bg-[#222222] rounded-full px-4 py-1.5 border border-[#303030]">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search YouTube..."
              autoFocus
              className="w-full bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-white mr-2"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#272727] hover:bg-[#3f3f3f] text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          >
            Search
          </button>
        </form>
      ) : (
        <>
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-400 hover:text-white p-1" title="Back to FilmySky Home">
              <i className="fas fa-arrow-left text-base"></i>
            </Link>

            <Link to="/youtube" className="flex items-center gap-1.5 group select-none">
              <div className="w-7 h-5 bg-[#ff0000] rounded-lg flex items-center justify-center text-white shadow-md shadow-red-900/30">
                <i className="fas fa-play text-[10px] ml-0.5"></i>
              </div>
              <span className="font-bold text-lg md:text-xl tracking-tight text-white flex items-center">
                YouTube
                <span className="text-[10px] text-red-500 font-semibold uppercase ml-1 px-1 py-0.2 bg-red-500/10 rounded">
                  Free
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center w-full max-w-lg mx-6"
          >
            <div className="flex items-center w-full bg-[#121212] border border-[#303030] rounded-l-full px-4 py-1.5 focus-within:border-blue-500">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-gray-400 hover:text-white mr-2"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#222222] hover:bg-[#272727] text-gray-300 hover:text-white border border-l-0 border-[#303030] rounded-r-full px-6 py-1.5 text-sm transition-colors"
              title="Search"
            >
              <i className="fas fa-search"></i>
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
              aria-label="Search"
            >
              <i className="fas fa-search text-lg"></i>
            </button>

            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#272727] hover:bg-[#383838] text-white transition-colors border border-white/5"
            >
              <i className="fas fa-film text-red-500"></i>
              <span>FilmySky Movies</span>
            </Link>

            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center text-white text-xs font-bold border border-white/10"
              title="Profile"
            >
              <i className="fas fa-user"></i>
            </Link>
          </div>
        </>
      )}
    </header>
  );
};

export default YouTubeHeader;
