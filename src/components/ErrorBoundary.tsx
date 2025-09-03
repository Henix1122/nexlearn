import React from 'react';
import { toast } from '@/components/ui/sonner';

interface ErrorBoundaryState { error: Error | null }
interface ErrorBoundaryProps { children: React.ReactNode }

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
    toast('An error occurred', { description: 'We logged it for review.' });
    // Attempt remote logging (Supabase) with local fallback buffer
    try {
      const payload = { message: error.message, stack: error.stack, componentStack: info.componentStack, ts: new Date().toISOString() };
      const bufferKey = 'nex_error_buffer';
      const pushLocal = () => {
        try { const arr = JSON.parse(localStorage.getItem(bufferKey) || '[]'); arr.push(payload); localStorage.setItem(bufferKey, JSON.stringify(arr.slice(-50))); } catch {}
      };
      const { supabase } = await import('@/lib/supabaseClient');
      // @ts-ignore
      const { error: supErr } = await supabase.from('client_errors').insert({ message: payload.message, stack: payload.stack, component_stack: payload.componentStack, ts: payload.ts });
      if (supErr) pushLocal();
    } catch {
      // local fallback
    }
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
