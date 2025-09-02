import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Secret sequence (case-insensitive)
const SEQUENCE = ['h','j','a'];
const WINDOW_MS = 5000; // max time to complete sequence

export default function AdminHotkeyListener() {
  const idx = useRef(0);
  const startTs = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (!/^[a-z]$/.test(key)) return;
      const now = Date.now();
      if (startTs.current && now - startTs.current > WINDOW_MS) {
        // timeout expired; reset
        idx.current = 0;
        startTs.current = null;
      }
      if (key === SEQUENCE[idx.current]) {
        if (idx.current === 0) startTs.current = now;
        idx.current += 1;
        if (idx.current === SEQUENCE.length) {
          idx.current = 0;
            sessionStorage.setItem('admin_seq_pass', '1');
          navigate('/admin');
          startTs.current = null;
        }
      } else {
        // mismatch; maybe this key starts sequence
        if (key === SEQUENCE[0]) {
          idx.current = 1;
          startTs.current = now;
        } else {
          idx.current = 0;
          startTs.current = null;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  return null; // no visual hint
}
