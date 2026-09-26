import { useState, useEffect } from 'react';

/**
 * Dark/Light mode toggle button.
 * Persists preference in localStorage and detects system preference on first visit.
 */
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <button
      className="theme-toggle-btn"
      onClick={() => setIsDark(prev => !prev)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
    >
      <i className={isDark ? 'ri-sun-line' : 'ri-moon-line'}></i>
    </button>
  );
};

export default ThemeToggle;
