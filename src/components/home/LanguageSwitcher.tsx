'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const languages = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'fil' as const, name: 'Filipino', flag: '🇵🇭' },
  { code: 'hil' as const, name: 'Hiligaynon', flag: '🏝️' }
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  const handleLanguageChange = (code: 'en' | 'fil' | 'hil') => {
    setLanguage(code);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === language);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const dropdownContent = isOpen && mounted && buttonRect && (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bg-white rounded-xl shadow-2xl overflow-hidden z-[99999] min-w-[180px] border border-gray-200/60 backdrop-blur-sm"
      style={{
        top: `${buttonRect.bottom + 8}px`,
        right: `${window.innerWidth - buttonRect.right}px`,
      }}
      role="menu"
      aria-orientation="vertical"
    >
      <div className="py-2">
        {languages.map((lang, index) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-all duration-200 group ${
              language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
            role="menuitem"
          >
            <span className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </span>
            {language === lang.code && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Check className="h-4 w-4 text-blue-600" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white group"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium hidden sm:inline">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <span className="text-sm font-medium sm:hidden">
          {currentLanguage?.flag}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3 w-3" />
        </motion.div>
      </motion.button>

      {mounted && createPortal(
        <AnimatePresence>
          {dropdownContent}
        </AnimatePresence>,
        document.body
      )}

      {/* Backdrop overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/10 backdrop-blur-sm sm:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
