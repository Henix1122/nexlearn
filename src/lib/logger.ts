import { toast } from '@/components/ui/sonner';

interface ClientLogRecord {
  id: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context?: any;
  ts: string;
}

const BUFFER_KEY = 'nex_error_buffer';
const MAX_BUFFER = 100;

function loadBuffer(): ClientLogRecord[] { try { return JSON.parse(localStorage.getItem(BUFFER_KEY) || '[]'); } catch { return []; } }
function saveBuffer(arr: ClientLogRecord[]) { try { localStorage.setItem(BUFFER_KEY, JSON.stringify(arr.slice(-MAX_BUFFER))); } catch {} }

export function logClientError(err: Error, context?: any) {
  toast('An error occurred', { description: err.message });
  const rec: ClientLogRecord = { id: crypto.randomUUID(), level: 'error', message: err.message, stack: err.stack, context, ts: new Date().toISOString() };
  const buf = loadBuffer();
  buf.push(rec); saveBuffer(buf);
  flushErrors();
}

let flushing = false;
export async function flushErrors() {
  if (flushing) return; flushing = true;
  try {
    const buf = loadBuffer();
    if (!buf.length) return;
    const { supabase } = await import('./supabaseClient');
    // @ts-ignore
    const payload = buf.map(r => ({ id: r.id, level: r.level, message: r.message, stack: r.stack, context: JSON.stringify(r.context||null), ts: r.ts }));
    // @ts-ignore
    const { error } = await supabase.from('client_errors').upsert(payload);
    if (!error) {
      saveBuffer([]); // clear
    }
  } catch {
    // keep buffer
  } finally {
    flushing = false;
  }
}

// Initialize periodic + online flush listeners
export function initClientLogging() {
  try {
    window.addEventListener('online', () => flushErrors());
    setInterval(() => flushErrors(), 15000);
  } catch {}
}
