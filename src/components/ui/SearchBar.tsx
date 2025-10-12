'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, FileText, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from './Portal';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'program' | 'news' | 'event' | 'page';
  url: string;
  category?: string;
}

interface SearchBarProps {
  variant?: 'default' | 'futuristic' | 'light' | 'dark';
  placeholder?: string;
  className?: string;
  onClose?: () => void;
  context?: 'navigation' | 'page' | 'modal';
}

export function SearchBar({ 
  variant = 'default', 
  placeholder = 'Search programs, news, events...',
  className = '',
  onClose,
  context = 'navigation'
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Handle search with debounce
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim()) {
      debounceTimer.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults([]);
      setIsLoading(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Calculate dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, []);

  // Handle click outside and body scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    // Prevent body scroll on mobile when search is open
    if (isOpen && window.innerWidth <= 768) {
      document.body.classList.add('search-modal-open');
    } else {
      document.body.classList.remove('search-modal-open');
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('search-modal-open');
    };
  }, [isOpen, updateDropdownPosition]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const result = results[selectedIndex];
      if (result) {
        window.location.href = result.url;
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      onClose?.();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'program': return <BookOpen className="w-4 h-4" />;
      case 'news': return <FileText className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Dynamic styling based on variant and context
  const getInputStyles = () => {
    const baseStyles = 'w-full pl-10 pr-12 py-2.5 sm:py-3 rounded-full focus:outline-none transition-all duration-300 text-sm sm:text-base';
    
    switch (variant) {
      case 'futuristic':
        return `${baseStyles} quantum-glass text-white placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 neural-glow-sm`;
      
      case 'light':
        return `${baseStyles} bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg`;
      
      case 'dark':
        return `${baseStyles} bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400`;
      
      default:
        // Adaptive default based on context
        if (context === 'page') {
          return `${baseStyles} bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg`;
        }
        return `${baseStyles} bg-white/10 backdrop-blur-md text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 border border-white/20`;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'light':
        return 'text-gray-400';
      case 'dark':
        return 'text-gray-400';
      case 'futuristic':
        return 'text-gray-300';
      default:
        return context === 'page' ? 'text-gray-400' : 'text-gray-300';
    }
  };

  const getClearButtonColor = () => {
    switch (variant) {
      case 'light':
        return 'text-gray-400 hover:text-gray-600';
      case 'dark':
        return 'text-gray-400 hover:text-gray-200';
      case 'futuristic':
        return 'text-gray-300 hover:text-white';
      default:
        return context === 'page' ? 'text-gray-400 hover:text-gray-600' : 'text-gray-300 hover:text-white';
    }
  };

  return (
    <div ref={searchRef} className={`relative search-container ${className}`} style={{ zIndex: 9999 }}>
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none ${getIconColor()}`} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
            updateDropdownPosition();
          }}
          onFocus={() => {
            setIsOpen(true);
            updateDropdownPosition();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={getInputStyles()}
          aria-label="Search"
          aria-controls="search-results"
        />

        {query && (
          <button
            onClick={handleClear}
            className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 transition-all duration-200 p-1.5 rounded-full ${getClearButtonColor()} ${
              variant === 'light' || context === 'page'
                ? 'hover:bg-gray-100'
                : variant === 'dark'
                  ? 'hover:bg-white/10'
                  : 'hover:bg-white/10'
            }`}
            aria-label="Clear search"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        )}
      </div>

      {/* Search Results Portal */}
      <AnimatePresence mode="wait">
        {isOpen && (query.trim() || results.length > 0) && (
          <Portal>
            {/* Mobile Search Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[99998] md:hidden"
              style={{ pointerEvents: 'auto' }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Search Results Dropdown */}
            <motion.div
              id="search-results"
              initial={{ 
                opacity: 0, 
                y: -10,
                scaleY: 0.95
              }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scaleY: 1
              }}
              exit={{ 
                opacity: 0, 
                y: -10,
                scaleY: 0.95
              }}
              transition={{ 
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
                opacity: { duration: 0.25 },
                y: { duration: 0.3 },
                scaleY: { duration: 0.3 }
              }}
              style={{ 
                position: window.innerWidth <= 768 ? 'fixed' : 'absolute',
                top: window.innerWidth <= 768 ? '50%' : dropdownPosition.top,
                left: window.innerWidth <= 768 ? '1rem' : dropdownPosition.left,
                right: window.innerWidth <= 768 ? '1rem' : 'auto',
                width: window.innerWidth <= 768 ? 'auto' : dropdownPosition.width,
                transform: window.innerWidth <= 768 ? 'translateY(-50%)' : 'none',
                maxHeight: window.innerWidth <= 768 ? '70vh' : 'auto',
                overflowY: window.innerWidth <= 768 ? 'auto' : 'visible',
                zIndex: 99999,
                transformOrigin: 'top',
                pointerEvents: 'auto'
              }}
              className={`search-results-dropdown rounded-2xl shadow-2xl overflow-hidden ${
                variant === 'futuristic' 
                  ? 'quantum-glass-intense border border-cyan-500/30' 
                  : variant === 'light' || context === 'page'
                    ? 'bg-white border border-gray-200'
                    : variant === 'dark'
                      ? 'bg-gray-800 border border-gray-600'
                      : 'bg-white/95 backdrop-blur-lg border border-gray-200'
              }`}
            >
            {isLoading && results.length === 0 ? (
              <div className={`p-4 text-center ${
                variant === 'futuristic' ? 'text-gray-300' : 
                variant === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <Link
                    key={result.id}
                    href={result.url}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                      onClose?.();
                    }}
                    className={`block p-3 sm:p-4 transition-all duration-200 ${
                      selectedIndex === index
                        ? variant === 'futuristic'
                          ? 'bg-cyan-500/20 neural-glow-sm'
                          : variant === 'dark'
                            ? 'bg-gray-700'
                            : 'bg-blue-50'
                        : variant === 'futuristic'
                          ? 'hover:bg-cyan-500/10'
                          : variant === 'dark'
                            ? 'hover:bg-gray-700/50'
                            : 'hover:bg-gray-50'
                    } ${index !== results.length - 1 ? 'border-b border-gray-200/20' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${
                        variant === 'futuristic' ? 'text-cyan-400' : 
                        variant === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-semibold text-sm sm:text-base truncate ${
                            variant === 'futuristic' ? 'text-white' : 
                            variant === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {result.title}
                          </h4>
                          {result.category && (
                            <span className={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                              variant === 'futuristic'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : variant === 'dark'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-blue-100 text-blue-700'
                            }`}>
                              {result.category}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs sm:text-sm mt-1 line-clamp-2 ${
                          variant === 'futuristic' ? 'text-gray-300' : 
                          variant === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {result.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : query.trim() && !isLoading ? (
              <div className={`p-6 text-center ${
                variant === 'futuristic' ? 'text-gray-300' : 
                variant === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <Search className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium text-sm sm:text-base">No results found</p>
                <p className="text-xs sm:text-sm mt-1">Try different keywords</p>
              </div>
            ) : null}
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
