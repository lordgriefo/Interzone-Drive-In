// src/components/ThemeProvider.jsx
// Floating theme-switcher pill — writes to document.documentElement.dataset.theme
// so all CSS variables cascade instantly without React re-renders.

import React, { useState, useEffect } from 'react';

const THEMES = [
  { value: 'strangelet',       label: '🟠 Strangelet  Black/Orange/Purple' },
  { value: 'interzone',        label: '🔵 Interzone  Black/Orange/Blue' },
  { value: 'noir_rose',        label: '🩷 Noir Rose  Black/Pink/Magenta' },
  { value: 'deep_space',       label: '🟣 Deep Space  Black/Cyan/Indigo' },
  { value: 'mpc60_grey',       label: '⬜ MPC 60  Grey' },
  { value: 'amber_industrial', label: '🟡 Amber  Industrial' },
  { value: 'green_crt',        label: '🟢 Green  CRT' },
];

const STORAGE_KEY = 'kinet_theme';

export function ThemeProvider() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'strangelet';
  });

  // Apply on mount + whenever theme changes
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="theme-switcher" title="Switch UI Theme">
      {/* Palette swatch dot */}
      <span style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'var(--accent-orange)',
        flexShrink: 0,
        boxShadow: '0 0 5px var(--accent-orange-glow)',
      }} />
      <label htmlFor="theme-select">THEME</label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        {THEMES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
    </div>
  );
}
