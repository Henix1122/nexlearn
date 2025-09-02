import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// New secret sequence: H + J + A (case-insensitive)
const SEQUENCE = ['h','j','a'];
const TIMEOUT_MS = 3500; // how long to show progress after inactivity

export default function AdminHotkeyGate() {
  const idx = useRef(0);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0); // 0..SEQUENCE.length-1
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    const scheduleHide = () => {
      clearTimer();
      timeoutRef.current = window.setTimeout(() => {
        idx.current = 0;
        setProgress(0);
      }, TIMEOUT_MS);
    };
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return; // ignore combos
      const key = e.key.toLowerCase();
      if (!/^[a-z]$/.test(key)) return; // letters only
      if (key === SEQUENCE[idx.current]) {
        idx.current += 1;
        setProgress(idx.current);
        scheduleHide();
        if (idx.current === SEQUENCE.length) {
          // success
            sessionStorage.setItem('admin_seq_pass', '1');
          idx.current = 0;
          setProgress(SEQUENCE.length); // show full briefly
          navigate('/admin');
          // hide soon after
          clearTimer();
          timeoutRef.current = window.setTimeout(() => setProgress(0), 1200);
        }
      } else {
        // mismatch - restart logic
        if (key === SEQUENCE[0]) {
          idx.current = 1;
          setProgress(1);
          scheduleHide();
        } else {
          idx.current = 0;
          setProgress(0);
          clearTimer();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimer();
    };
  }, [navigate]);

  if (progress === 0) return null;

  return (
    <div className="fixed bottom-3 right-3 z-50 select-none">
      <div className="px-3 py-2 rounded-md text-xs font-medium shadow bg-slate-900/80 backdrop-blur border border-slate-700 text-slate-200 flex items-center space-x-2">
        <span className="opacity-70">Admin sequence</span>
        <div className="flex space-x-1">
          {SEQUENCE.map((char, i) => (
            <span
              key={char+ i}
              className={`w-6 h-6 rounded-sm grid place-items-center text-[10px] font-bold uppercase border transition-colors duration-200 ${
                progress > i ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'
              }`}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
