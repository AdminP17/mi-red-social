import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
    light: {
        name: 'light',
        colors: {
            // Backgrounds
            bg: '#F1F5F9', // Slate-100
            bgSecondary: '#FFFFFF', // White
            surface: '#FFFFFF',

            // Primary (Violet)
            primary: '#7C3AED', // Violet-600
            primaryHover: '#6D28D9', // Violet-700
            primaryLight: '#EDE9FE', // Violet-100

            // Text
            text: '#0F172A', // Slate-900
            textSecondary: '#64748B', // Slate-500
            textTertiary: '#94A3B8', // Slate-400

            // Borders
            border: '#E2E8F0', // Slate-200
            borderLight: '#F8FAFC', // Slate-50

            // States
            success: '#10B981', // Emerald-500
            error: '#EF4444', // Red-500
            warning: '#F59E0B', // Amber-500

            // Shadows & Effects
            shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            shadowMd: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            backdrop: 'rgba(255, 255, 255, 0.8)',
        }
    },
    dark: {
        name: 'dark',
        colors: {
            // Backgrounds
            bg: '#0F172A', // Slate-900
            bgSecondary: '#1E293B', // Slate-800
            surface: '#1E293B',

            // Primary (Violet)
            primary: '#8B5CF6', // Violet-500
            primaryHover: '#7C3AED', // Violet-600
            primaryLight: '#2E1065', // Violet-950

            // Text
            text: '#F8FAFC', // Slate-50
            textSecondary: '#94A3B8', // Slate-400
            textTertiary: '#64748B', // Slate-500

            // Borders
            border: '#334155', // Slate-700
            borderLight: '#1E293B', // Slate-800

            // States
            success: '#34D399', // Emerald-400
            error: '#F87171', // Red-400
            warning: '#FBBF24', // Amber-400

            // Shadows & Effects
            shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
            shadowMd: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
            backdrop: 'rgba(30, 41, 59, 0.8)',
        }
    }
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' ? 'dark' : 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const currentTheme = themes[theme];

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors: currentTheme.colors }}>
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
