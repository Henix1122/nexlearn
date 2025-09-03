import React from 'react';
import { toast } from '@/components/ui/sonner';
import { logError } from '@/lib/logger';

interface ErrorBoundaryState { error: Error | null }
interface ErrorBoundaryProps { children: React.ReactNode }

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
  toast('An error occurred', { description: 'We logged it for review.' });
  logError('react_error_boundary', { message: error.message, stack: error.stack, componentStack: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-8 max-w-xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-sm text-gray-600 mb-6">Our team has been notified. Try refreshing the page.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
