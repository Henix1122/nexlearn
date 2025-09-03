// Utility to load external scripts with Subresource Integrity (SRI) enforcement.
// Usage: loadScriptWithIntegrity({ src, integrity, crossOrigin: 'anonymous' })

export interface SRIScriptOptions {
  src: string;
  integrity: string; // SHA384 or SHA256 hash string
  crossOrigin?: 'anonymous' | 'use-credentials';
  timeoutMs?: number;
}

export function loadScriptWithIntegrity(opts: SRIScriptOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-sri='${opts.src}']`)) return resolve();
    const script = document.createElement('script');
    script.src = opts.src;
    script.integrity = opts.integrity;
    script.crossOrigin = opts.crossOrigin || 'anonymous';
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.setAttribute('data-sri', opts.src);
    const timer = setTimeout(() => {
      script.remove();
      reject(new Error('SRI load timeout'));
    }, opts.timeoutMs || 12000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); reject(new Error('SRI load error')); };
    document.head.appendChild(script);
  });
}
