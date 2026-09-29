// src/components/ErrorBoundary.jsx
// Industrial Strangelet Error Boundary fallback

import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught runtime exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#040406',
            color: '#e2e8f0',
            fontFamily: "'Courier New', Courier, monospace",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            boxSizing: 'border-box',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: 720,
              width: '100%',
              backgroundColor: '#0d0d14',
              border: '2px solid #ef4444',
              borderRadius: 6,
              padding: 24,
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
            }}
          >
            <h1
              style={{
                color: '#ef4444',
                fontSize: 18,
                letterSpacing: 2,
                textTransform: 'uppercase',
                margin: '0 0 12px',
              }}
            >
              ⚠ INTERZONE CORE EXCEPTION
            </h1>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
              A runtime error occurred in the multimedia engine pipeline:
            </p>
            <pre
              style={{
                backgroundColor: '#040406',
                border: '1px solid #1e293b',
                color: '#f87171',
                padding: 12,
                borderRadius: 4,
                fontSize: 11,
                textAlign: 'left',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: 220,
              }}
            >
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
            <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#ff6b00',
                  border: 'none',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 12,
                  padding: '8px 16px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  letterSpacing: 1,
                }}
              >
                ↺ RELOAD WORKSPACE
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
