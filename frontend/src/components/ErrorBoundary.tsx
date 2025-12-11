import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 9999,
          backgroundColor: 'white',
          pointerEvents: 'auto'
        }}>
          <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>Something went wrong</h1>
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '600px',
            marginBottom: '20px',
          }}>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <details style={{ marginTop: '10px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#3498db' }}>Error Details</summary>
              <pre style={{
                marginTop: '10px',
                padding: '10px',
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
              }}>
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
          <button
            onClick={() => {
              window.location.href = '/login';
              localStorage.clear();
            }}
            style={{
              padding: '10px 20px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Return to Login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

