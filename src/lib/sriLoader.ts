// Dynamic script loader with Subresource Integrity (SRI) enforcement.
// Usage: loadScriptWithIntegrity({ src, integrity, crossOrigin: 'anonymous' })
// Returns a promise that resolves when the script loads or rejects on error/ integrity mismatch.

export interface SRIOptions {
	src: string;
	integrity: string; // sha384-... etc.
	crossOrigin?: string; // typically 'anonymous'
	referrerPolicy?: string;
	timeoutMs?: number;
}

export function loadScriptWithIntegrity(opts: SRIOptions): Promise<void> {
	return new Promise((resolve, reject) => {
		if (document.querySelector(`script[data-sri-src="${opts.src}"]`)) { resolve(); return; }
		const s = document.createElement('script');
		s.src = opts.src;
		s.integrity = opts.integrity;
		s.crossOrigin = opts.crossOrigin || 'anonymous';
		if (opts.referrerPolicy) s.referrerPolicy = opts.referrerPolicy;
		s.defer = true;
		s.async = true;
		s.setAttribute('data-sri-src', opts.src);
		const timer = setTimeout(() => { reject(new Error('sri_load_timeout')); s.remove(); }, opts.timeoutMs || 15000);
		s.onload = () => { clearTimeout(timer); resolve(); };
		s.onerror = () => { clearTimeout(timer); reject(new Error('sri_load_error')); };
		document.head.appendChild(s);
	});
}

// Example placeholder list for future external assets; kept here for reference.
export const EXTERNAL_ASSETS: { name: string; src: string; integrity: string }[] = [
	// { name: 'some-lib', src: 'https://cdn.example.com/some-lib.min.js', integrity: 'sha384-...' }
];
