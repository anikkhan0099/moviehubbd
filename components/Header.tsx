import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, SpinnerIcon, MenuIcon, XIcon } from './Icons';
import { MOCK_DATA } from '../constants';
import { ContentItem } from '../types';

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<ContentItem[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsContainerRef = useRef<HTMLUListElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/' },
    { 
        name: 'Types', 
        dropdown: ['Movies', 'Series', 'Anime'] 
    },
    { 
        name: 'Languages', 
        dropdown: ['Bengali', 'Hindi', 'English', 'Dual Audio'] 
    },
    { 
        name: 'Categories', 
        dropdown: ['18+ Adult', 'Action', 'Comedy', 'Horror', 'Bangla TV Shows', 'Indian TV Shows'] 
    },
    { 
        name: 'Genres', 
        dropdown: ['Drama', 'Thriller', 'Sci-Fi', 'Romance', 'Crime', 'Family'] 
    },
  ];

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const debounceTimer = setTimeout(() => {
      const filtered = MOCK_DATA.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10); // Limit suggestions
      setSuggestions(filtered);
      setActiveIndex(-1); // Reset index on new search
      setIsLoading(false);
    }, 500); // Simulate network delay

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (activeIndex < 0 || !suggestionsContainerRef.current) return;

    const activeItem = suggestionsContainerRef.current.children[activeIndex] as HTMLLIElement;
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prevIndex => (prevIndex + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prevIndex => (prevIndex - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        const selectedItem = suggestions[activeIndex];
        navigate(`/item/${selectedItem.slug}`);
        setSearchTerm('');
        setIsSearchFocused(false);
      }
    }
  };

  const handleSuggestionClick = () => {
    setSearchTerm('');
    setIsSearchFocused(false);
    setActiveIndex(-1);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  return (
    <header className="bg-gray-900/70 backdrop-blur-md sticky top-0 z-50 border-b border-cyan-500/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img className="h-10 w-auto" src="https://i.ibb.co/hZ5g0J1/Movie-Hub-BD-Logo.png" alt="MovieHubBD Logo" />
            </Link>
          </div>
          
          {/* Desktop Navigation (Centered) */}
          <nav className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-x-2">
            {navItems.map((item) => (
              <div 
                key={item.name}
                className="relative group"
              >
                <a
                  href={item.path || '#'}
                  className="flex items-center text-gray-300 hover:text-cyan-400 transition-colors duration-200 px-3 py-2 rounded-md"
                >
                  {item.name}
                  {item.dropdown && (
                     <svg className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                     </svg>
                  )}
                </a>
                {item.dropdown && (
                  <div className="absolute top-full mt-2 w-56 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 py-2
                                  opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-250 ease-out origin-top
                                  pointer-events-none group-hover:pointer-events-auto">
                    <ul>
                      {item.dropdown.map((subItem) => (
                        <li key={subItem}>
                          <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-cyan-400 transition-colors">
                            {subItem}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>
          
          {/* Search & Mobile Menu */}
          <div className="flex items-center">
            <div className="relative flex" ref={searchRef}>
               <div className="relative">
                 <input
                   ref={inputRef}
                   type="text"
                   placeholder="Search..."
                   className="bg-gray-800 text-white rounded-l-md w-40 sm:w-48 md:w-64 py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   onFocus={() => setIsSearchFocused(true)}
                   onKeyDown={handleKeyDown}
                   role="combobox"
                   aria-haspopup="listbox"
                   aria-expanded={isSearchFocused && suggestions.length > 0}
                   aria-controls="search-suggestions"
                   aria-activedescendant={activeIndex >= 0 ? `suggestion-${suggestions[activeIndex].id}` : undefined}
                 />
                 {searchTerm.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        aria-label="Clear search"
                    >
                        <XIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                    </button>
                 )}
               </div>
              <button className="bg-cyan-500 text-slate-900 px-4 rounded-r-md hover:bg-cyan-400 transition-colors">
                <SearchIcon className="w-5 h-5" />
              </button>
              {isSearchFocused && searchTerm.trim().length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-800 rounded-md shadow-lg overflow-hidden border border-gray-700 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <SpinnerIcon className="w-6 h-6 text-cyan-400 animate-spin" />
                      <span className="ml-2 text-gray-400">Loading...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <ul 
                      ref={suggestionsContainerRef} 
                      id="search-suggestions" 
                      role="listbox"
                      onMouseLeave={() => setActiveIndex(-1)}
                    >
                      {suggestions.map((item, index) => (
                        <li 
                          key={item.id} 
                          id={`suggestion-${item.id}`} 
                          role="option" 
                          aria-selected={index === activeIndex}
                        >
                          <Link 
                            to={`/item/${item.slug}`} 
                            className={`flex items-center p-2 transition-colors ${index === activeIndex ? 'bg-gray-900' : 'hover:bg-gray-900'}`}
                            onClick={handleSuggestionClick}
                            onMouseEnter={() => setActiveIndex(index)}
                          >
                            <img 
                              src={item.posterPath} 
                              alt={item.title} 
                              className="w-10 h-14 object-cover rounded-sm"
                              loading="lazy" 
                            />
                            <div className="ml-3">
                              <p className="font-semibold text-sm">{item.title}</p>
                              <p className="text-xs text-gray-400">{item.type}</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-gray-400">No results found.</div>
                  )}
                </div>
              )}
            </div>
            <div className="lg:hidden ml-2">
              <button
                ref={mobileMenuButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <XIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="lg:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.name} className="text-gray-300">
                  <span className="block px-3 py-2 text-sm font-medium text-cyan-400">{item.name}</span>
                  <div className="pl-3">
                    {item.dropdown.map((subItem) => (
                      <a
                        key={subItem}
                        href="#"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        {subItem}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.path || '#'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;