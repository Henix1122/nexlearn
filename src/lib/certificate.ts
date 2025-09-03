// Simple client-side PDF certificate generator stub
// In a production setup consider using server-side rendering or a trusted service.
// dynamic import to avoid type resolution issues and allow offline fallback
// @ts-ignore
let _jsPDF: any;
async function getJsPDF() {
  if (_jsPDF) return _jsPDF;
  try {
    const mod = await import('jspdf');
    _jsPDF = mod.jsPDF || mod.default || mod;
  } catch (e) {
    throw new Error('jspdf_unavailable');
  }
  return _jsPDF;
}

export interface CertificateOptions {
  recipient: string;
  title: string;
  type: 'course' | 'learning-path';
  issued: Date;
  id?: string; // courseId or pathId
}

// Compute a short validation hash (first 12 chars of SHA-256) over stable certificate fields
async function computeCertificateHash(opts: CertificateOptions): Promise<string> {
  const base = [opts.recipient, opts.title, opts.type, opts.issued.toISOString(), opts.id || ''].join('|');
  try {
    const data = new TextEncoder().encode(base);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('');
    return hex.slice(0,12).toUpperCase();
  } catch {
    let h = 0; for (let i=0;i<base.length;i++){ h = Math.imul(31, h) + base.charCodeAt(i) | 0; }
    return ('FALLBACK' + (h>>>0).toString(16)).slice(0,12).toUpperCase();
  }
}

export { computeCertificateHash }; // allow verification page to reuse

export interface StoredCertificateRecord {
  id: string; // derived id or provided opts.id
  recipient: string;
  title: string;
  type: 'course' | 'learning-path';
  issued: string; // ISO
  hash: string; // first 12 chars
}

const CERT_STORE_KEY = 'nex_certificates';
function loadCertStore(): StoredCertificateRecord[] { try { return JSON.parse(localStorage.getItem(CERT_STORE_KEY) || '[]'); } catch { return []; } }
function saveCertStore(recs: StoredCertificateRecord[]) { try { localStorage.setItem(CERT_STORE_KEY, JSON.stringify(recs)); } catch {} }

export async function issueCertificate(opts: CertificateOptions): Promise<StoredCertificateRecord> {
  const hash = await computeCertificateHash(opts);
  const rec: StoredCertificateRecord = { id: opts.id || hash, recipient: opts.recipient, title: opts.title, type: opts.type, issued: opts.issued.toISOString(), hash };
  const store = loadCertStore();
  if (!store.find(r => r.id === rec.id)) { store.push(rec); saveCertStore(store); }
  // Attempt Supabase persistence (best-effort)
  try {
    const { supabase } = await import('./supabaseClient');
    // @ts-ignore
    await supabase.from('certificates').upsert({ id: rec.id, user_name: rec.recipient, title: rec.title, type: rec.type, issued: rec.issued, hash: rec.hash });
  } catch {}
  return rec;
}

export function findLocalCertificate(idOrHash: string): StoredCertificateRecord | undefined {
  const store = loadCertStore();
  return store.find(r => r.id === idOrHash || r.hash === idOrHash);
}

export async function generateCertificatePDF(opts: CertificateOptions): Promise<Blob> {
  const jsPDF = await getJsPDF();
  const hash = await computeCertificateHash(opts);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  doc.setFillColor('#0f172a');
  doc.rect(0,0,842,595,'F');
  doc.setFontSize(28);
  doc.setTextColor('#ffffff');
  doc.text('Certificate of Achievement', 421, 120, { align: 'center' });
  doc.setFontSize(16);
  doc.text('This certifies that', 421, 180, { align: 'center' });
  doc.setFontSize(32);
  doc.text(opts.recipient, 421, 240, { align: 'center' });
  doc.setFontSize(18);
  doc.text(`has successfully completed the ${opts.type === 'course' ? 'course' : 'learning path'}`, 421, 300, { align: 'center' });
  doc.setFontSize(26);
  doc.text(opts.title, 421, 350, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Issued: ${opts.issued.toLocaleDateString()}`, 421, 420, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`NexLearn • Validation hash: ${hash}`, 421, 460, { align: 'center' });
  return doc.output('blob');
}

export async function downloadCertificate(opts: CertificateOptions) {
  try {
  await issueCertificate(opts);
    const blob = await generateCertificatePDF(opts);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${opts.type}-certificate-${opts.id || 'nexlearn'}.pdf`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 5000);
  } catch (e: any) {
    // emit toast event for unavailable export
    try { window.dispatchEvent(new CustomEvent('app:toast', { detail: { title: 'Export unavailable', description: 'PDF library not loaded (offline).', variant: 'destructive' } })); } catch {}
  }
}
