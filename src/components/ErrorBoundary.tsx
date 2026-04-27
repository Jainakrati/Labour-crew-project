import React, { Component, ErrorInfo, ReactNode } from 'react';

export class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="error-boundary-container" className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div id="error-boundary-card" className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
            <h1 id="error-title" className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p id="error-message" className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              id="error-reload-btn"
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
