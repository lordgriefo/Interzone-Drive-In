// src/components/StrangeletSuiteMenu.jsx
// Dropdown menu & launcher for all 6 active Perchance sites in the Strangelet Suite

import React, { useState, useRef, useEffect } from 'react';
import { STRANGELET_SUITE_APPS } from '../constants/urls';

export function StrangeletSuiteMenu({ currentAppId = 'keneticut', align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', zIndex: 120 }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title="Explore all 6 Perchance AI & Creative Suite Apps"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 9px',
          background: isOpen
            ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.25), rgba(255, 107, 0, 0.25))'
            : 'rgba(25, 25, 45, 0.85)',
          border: isOpen ? '1px solid #fbbf24' : '1px solid rgba(251, 191, 36, 0.45)',
          borderRadius: 4,
          color: '#fbbf24',
          fontFamily: "'Syncopate', sans-serif",
          fontSize: 8,
          fontWeight: 800,
          letterSpacing: 1,
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 12px rgba(251, 191, 36, 0.4)' : 'none',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#fbbf24';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(251, 191, 36, 0.35)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.45)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        <span>⚡ STRANGELET SUITE</span>
        <span style={{ fontSize: 9, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          ▾
        </span>
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [align === 'left' ? 'left' : 'right']: 0,
            width: 320,
            maxWidth: '90vw',
            backgroundColor: '#0a0a14',
            border: '1px solid rgba(251, 191, 36, 0.5)',
            borderRadius: 6,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.95), 0 0 20px rgba(251, 191, 36, 0.25)',
            padding: 10,
            backdropFilter: 'blur(14px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: 6,
              marginBottom: 4,
            }}
          >
            <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 8.5, fontWeight: 800, color: '#fbbf24', letterSpacing: 1.5 }}>
              ⚡ INTERZONE CREATIVE NETWORK
            </div>
            <div style={{ fontSize: 8, color: '#a1a1aa', fontFamily: 'monospace' }}>
              {STRANGELET_SUITE_APPS.length} LIVE SITES
            </div>
          </div>

          {/* List of 6 Apps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: '68vh', overflowY: 'auto' }}>
            {STRANGELET_SUITE_APPS.map((app) => {
              const isCurrent = app.id === currentAppId;
              return (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '6px 8px',
                    borderRadius: 4,
                    backgroundColor: isCurrent ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isCurrent ? app.color : 'rgba(255, 255, 255, 0.08)'}`,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = app.color;
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isCurrent ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = isCurrent ? app.color : 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ fontSize: 16, lineHeight: 1, marginTop: 2 }}>{app.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span
                          style={{
                            fontFamily: "'Syncopate', sans-serif",
                            fontSize: 9,
                            fontWeight: 700,
                            color: app.color,
                            letterSpacing: 0.5,
                          }}
                        >
                          {app.title}
                        </span>
                        {app.subtitle && (
                          <span style={{ fontSize: 7, color: '#71717a', fontFamily: 'monospace' }}>
                            {app.subtitle}
                          </span>
                        )}
                      </div>
                      {isCurrent ? (
                        <span
                          style={{
                            fontSize: 7,
                            fontFamily: 'monospace',
                            color: '#00e5ff',
                            border: '1px solid #00e5ff',
                            padding: '1px 3px',
                            borderRadius: 2,
                            fontWeight: 700,
                          }}
                        >
                          YOU ARE HERE
                        </span>
                      ) : (
                        <span style={{ fontSize: 9, color: app.color }}>↗</span>
                      )}
                    </div>
                    <div style={{ fontSize: 8.5, color: '#a1a1aa', marginTop: 2, lineHeight: 1.3 }}>
                      {app.desc}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Footer link to Drive-In & Support */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: 6,
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 8,
              fontFamily: 'monospace',
              color: '#71717a',
            }}
          >
            <span>INTERZONE DRIVE-IN · 1964</span>
            <a
              href="https://buymeacoffee.com/magicstatic/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#fbbf24', textDecoration: 'none' }}
            >
              ☕ Coffee Support
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
