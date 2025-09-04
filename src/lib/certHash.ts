export interface CertHashInput {
  recipient: string;
  title: string;
  type: 'course' | 'learning-path';
  issuedISO: string; // ISO string of issued date
  id?: string;
}

export async function computeCertificateHash(input: CertHashInput): Promise<string> {
  const base = [input.recipient, input.title, input.type, input.issuedISO, input.id || ''].join('|');
  try {
    const data = new TextEncoder().encode(base);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 12).toUpperCase();
  } catch {
    let h = 0; for (let i = 0; i < base.length; i++) { h = Math.imul(31, h) + base.charCodeAt(i) | 0; }
    return ('FALLBACK' + (h >>> 0).toString(16)).slice(0, 12).toUpperCase();
  }
}