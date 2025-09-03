interface LogEvent {
	level: 'error' | 'warn' | 'info';
	message: string;
	meta?: any;
	ts: string;
}

const BUFFER_KEY = 'nex_log_buffer';
const MAX_BUFFER = 100;

function loadBuffer(): LogEvent[] { try { return JSON.parse(localStorage.getItem(BUFFER_KEY) || '[]'); } catch { return []; } }
function saveBuffer(arr: LogEvent[]) { try { localStorage.setItem(BUFFER_KEY, JSON.stringify(arr.slice(-MAX_BUFFER))); } catch {} }

export function logEvent(level: LogEvent['level'], message: string, meta?: any) {
	const entry: LogEvent = { level, message, meta, ts: new Date().toISOString() };
	const buf = loadBuffer();
	buf.push(entry); saveBuffer(buf);
	if (level === 'error') scheduleFlush(1500); // quick flush after error
}

let flushing = false;
let flushTimer: any;

function scheduleFlush(delay = 5000) {
	if (flushTimer) clearTimeout(flushTimer);
	flushTimer = setTimeout(() => flushLogs(), delay);
}

export async function flushLogs() {
	if (flushing) return; flushing = true;
	const buf = loadBuffer();
	if (!buf.length) { flushing = false; return; }
	try {
		const { supabase } = await import('./supabaseClient');
		// @ts-ignore
		const payload = buf.map(b => ({ level: b.level, message: b.message, meta: JSON.stringify(b.meta || {}), ts: b.ts }));
		// @ts-ignore
		const { error } = await supabase.from('client_logs').insert(payload);
		if (!error) {
			saveBuffer([]); // clear
		}
	} catch {
		// leave buffer intact
	} finally {
		flushing = false;
	}
}

// Periodic & online flush
if (typeof window !== 'undefined') {
	setInterval(() => flushLogs(), 20000);
	window.addEventListener('online', () => flushLogs());
}

// Convenience wrappers
export const logError = (msg: string, meta?: any) => logEvent('error', msg, meta);
export const logWarn = (msg: string, meta?: any) => logEvent('warn', msg, meta);
export const logInfo = (msg: string, meta?: any) => logEvent('info', msg, meta);
