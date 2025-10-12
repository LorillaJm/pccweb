'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    language: string;
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;
    setFontSize: (size: 'small' | 'medium' | 'large') => void;
    setLanguage: (lang: string) => void;
    actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<'light' | 'dark' | 'auto'>('light');
    const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');
    const [language, setLanguageState] = useState('en');
    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null;
        const savedFontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large' | null;
        const savedLanguage = localStorage.getItem('language');

        if (savedTheme) setThemeState(savedTheme);
        if (savedFontSize) setFontSizeState(savedFontSize);
        if (savedLanguage) setLanguageState(savedLanguage);
    }, []);

    // Handle theme changes and system preference
    useEffect(() => {
        const updateTheme = () => {
            let newTheme: 'light' | 'dark' = 'light';

            if (theme === 'auto') {
                newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            } else {
                newTheme = theme;
            }

            setActualTheme(newTheme);

            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        updateTheme();

        // Listen for system theme changes when in auto mode
        if (theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => updateTheme();
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [theme]);

    // Apply font size
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('text-sm', 'text-base', 'text-lg');
        
        if (fontSize === 'small') {
            root.style.fontSize = '14px';
        } else if (fontSize === 'large') {
            root.style.fontSize = '18px';
        } else {
            root.style.fontSize = '16px';
        }
    }, [fontSize]);

    const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const setFontSize = (size: 'small' | 'medium' | 'large') => {
        setFontSizeState(size);
        localStorage.setItem('fontSize', size);
    };

    const setLanguage = (lang: string) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    return (
        <ThemeContext.Provider value={{ theme, fontSize, language, setTheme, setFontSize, setLanguage, actualTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
