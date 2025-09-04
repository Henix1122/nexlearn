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
  theme?: Partial<CertificateTheme>; // optional color overrides
  fontUrl?: string; // optional TTF font URL (same-origin or CORS enabled)
  fontName?: string; // internal font name
  quality?: 'standard' | 'high'; // high increases gradient steps & logo scale
}
// Theme definition for color customization
export interface CertificateTheme {
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  cardColor: string;
  badgeColor: string;
  accentLineFrom: string;
  accentLineTo: string;
  gradientPolyline: string[]; // list of stroke colors
  textPrimary: string;
  textSecondary: string;
  disclaimer: string;
  microHash: string;
}

const defaultTheme: CertificateTheme = {
  backgroundGradientFrom: '#eef2f3',
  backgroundGradientTo: '#d6dde0',
  cardColor: '#1a242e',
  badgeColor: '#37414b',
  accentLineFrom: '#ffd22e',
  accentLineTo: '#ff4800',
  gradientPolyline: ['#ff6e40','#ff7840','#ff8640','#ff9540','#ffa440'],
  textPrimary: '#ffffff',
  textSecondary: '#b5c2cc',
  disclaimer: '#7a8791',
  microHash: '#53616b'
};

async function loadLogoImageData(): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    // Fetch SVG and convert to PNG data URL via canvas for jsPDF compatibility
    const svgResp = await fetch('/assets/logo-nexlearn.svg');
    const svgText = await svgResp.text();
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const img: HTMLImageElement = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const canvas = document.createElement('canvas');
    const scale = 0.6; // scale down for PDF
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    URL.revokeObjectURL(url);
    return { dataUrl, width: canvas.width, height: canvas.height };
  } catch {
    return null; // fallback to vector placeholder
  }
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

export async function verifyCertificateRemote(idOrHash: string): Promise<{ status: 'valid' | 'not_found' | 'error'; record?: any; error?: string }> {
  try {
    // Prefer Edge Function
    const fnUrl = `${import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')}/functions/v1/verify-certificate`;
    try {
      const resp = await fetch(fnUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idOrHash }) });
      if (resp.ok) {
        const json = await resp.json();
        if (json.status === 'valid') return { status: 'valid', record: json.record };
        if (json.status === 'not_found') return { status: 'not_found' };
      } else if (resp.status === 404) {
        return { status: 'not_found' };
      }
    } catch {
      // Edge function unreachable -> fallback to direct table (if allowed by RLS)
    }
    const { supabase } = await import('./supabaseClient');
    // Fallback direct query
    // @ts-ignore
    let { data, error } = await supabase.from('certificates').select('*').eq('id', idOrHash).limit(1);
    if (error) throw error;
    if (!data || data.length === 0) {
      // @ts-ignore
      const res2 = await supabase.from('certificates').select('*').eq('hash', idOrHash).limit(1);
      if (res2.error) throw res2.error;
      data = res2.data;
    }
    if (data && data.length > 0) return { status: 'valid', record: data[0] };
    return { status: 'not_found' };
  } catch (e:any) {
    return { status: 'error', error: e?.message || 'verification failed' };
  }
}

// Format hash-derived registration number: take first 12 chars -> XXXX-XXXX-XXXX
function formatRegistration(hash: string): string {
  const clean = hash.replace(/[^A-Z0-9]/gi, '').toUpperCase().padEnd(12, '0').slice(0,12);
  return `${clean.slice(0,4)}-${clean.slice(4,8)}-${clean.slice(8,12)}`;
}

export async function generateCertificatePDF(opts: CertificateOptions): Promise<Blob> {
  const jsPDF = await getJsPDF();
  const hash = await computeCertificateHash(opts);
  const reg = formatRegistration(hash);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // Optional font embedding
  if (opts.fontUrl) {
    try {
      const resp = await fetch(opts.fontUrl);
      const buf = await resp.arrayBuffer();
      // Convert to base64
      const bytes = new Uint8Array(buf);
      let binary = '';
      for (let i=0;i<bytes.length;i++){ binary += String.fromCharCode(bytes[i]); }
      const base64 = btoa(binary);
      const internalName = opts.fontName || 'CustomFont';
      // @ts-ignore
      doc.addFileToVFS(`${internalName}.ttf`, base64);
      // @ts-ignore
      doc.addFont(`${internalName}.ttf`, internalName, 'normal');
      // @ts-ignore
      doc.setFont(internalName);
    } catch {
      // ignore failure, fallback to default font
    }
  }

  // Background gradient simulation (soft light) by drawing bands
  const width = 842; const height = 595;
  const high = opts.quality === 'high';
  const bgSteps = high ? 120 : 40;
  const theme: CertificateTheme = { ...defaultTheme, ...(opts.theme || {}) };
  const fromRGB = theme.backgroundGradientFrom;
  const toRGB = theme.backgroundGradientTo;
  // simple interpolate between two hex colors
  const hexToRgb = (h: string) => {
    const m = h.replace('#','');
    return [parseInt(m.substring(0,2),16), parseInt(m.substring(2,4),16), parseInt(m.substring(4,6),16)];
  };
  const [fr,fg,fb] = hexToRgb(fromRGB); const [tr,tg,tb] = hexToRgb(toRGB);
  for (let i=0;i<bgSteps;i++) {
    const ratio = i/(bgSteps-1);
    const r = Math.round(fr + (tr-fr)*ratio);
    const g = Math.round(fg + (tg-fg)*ratio);
    const b = Math.round(fb + (tb-fb)*ratio);
    doc.setFillColor(r,g,b);
    doc.rect(0, (height/bgSteps)*i, width, (height/bgSteps)+1, 'F');
  }

  // Main dark slate card
  const cardX = 110; const cardY = 60; const cardW = width - 220; const cardH = height - 120;
  // Main dark slate card
  // Parse card color
  const cc = theme.cardColor;
  const hex = (c:string)=>c.replace('#','');
  const hc = hex(cc); const cr = parseInt(hc.slice(0,2),16), cg = parseInt(hc.slice(2,4),16), cb = parseInt(hc.slice(4,6),16);
  doc.setFillColor(cr,cg,cb);
  doc.rect(cardX, cardY, cardW, cardH, 'F');
  // Shadow (simple offset transparent rectangle simulation)
  doc.setGState && doc.setGState(doc.GState && doc.GState({ opacity: 0.15 }));
  doc.setFillColor(0,0,0);
  doc.rect(cardX+6, cardY+6, cardW, cardH, 'F');
  // Reset opacity (if available)
  doc.setGState && doc.setGState(doc.GState && doc.GState({ opacity: 1 }));

  // Header logo & brand (simplified shield + stylized N)
  // Shield outline
  doc.setDrawColor(255,140,0); // retain brand accent for outline
  doc.setLineWidth(2);
  const lx = cardX + 20; const ly = cardY + 20;
  doc.line(lx + 30, ly, lx + 60, ly + 12); // top edge
  doc.line(lx + 60, ly + 12, lx + 60, ly + 52); // right
  doc.line(lx + 60, ly + 52, lx + 30, ly + 70); // bottom right diag
  doc.line(lx + 30, ly + 70, lx, ly + 52); // bottom left diag
  doc.line(lx, ly + 52, lx, ly + 12); // left
  doc.line(lx, ly + 12, lx + 30, ly); // top left diag
  // Inner N
  doc.setDrawColor(255,180,40);
  doc.setLineWidth(3);
  doc.line(lx + 12, ly + 52, lx + 12, ly + 18);
  doc.line(lx + 48, ly + 18, lx + 48, ly + 52);
  doc.setDrawColor(255,140,0);
  doc.line(lx + 12, ly + 18, lx + 48, ly + 52);
  // Brand text
  doc.setTextColor(theme.textPrimary);
  doc.setFontSize(26);
  doc.text('NEXLEARN', cardX + 100, cardY + 60);

  // Right-side badge block
  const badgeW = 200; const badgeH = 120;
  const badgeX = cardX + cardW - badgeW; const badgeY = cardY;
  // Badge
  const bc = hex(theme.badgeColor); const br = parseInt(bc.slice(0,2),16), bg = parseInt(bc.slice(2,4),16), bb = parseInt(bc.slice(4,6),16);
  doc.setFillColor(br,bg,bb);
  doc.rect(badgeX, badgeY, badgeW, badgeH, 'F');
  doc.setTextColor(theme.textPrimary);
  doc.setFontSize(9);
  doc.text('LEVEL 1', badgeX + 20, badgeY + 28);
  doc.setFontSize(16);
  doc.text('Professional', badgeX + 20, badgeY + 52);
  doc.setFontSize(10);
  doc.text(`${opts.type === 'course' ? 'Course' : 'Learning Path'} Certification`, badgeX + 20, badgeY + 72);

  // Main title (multi-line)
  const title = `Digital Certificate in ${opts.title}`;
  doc.setFontSize(26);
  doc.setTextColor(theme.textPrimary);
  const titleMaxWidth = cardW - 260;
  let cursorY = cardY + 140;
  const split = doc.splitTextToSize(title, titleMaxWidth);
  split.forEach((line: string) => { doc.text(line, cardX + 60, cursorY); cursorY += 32; });

  // Accent short line under title
  // Accent line gradient approx by selecting first color (could expand to gradient fill using canvas but keep simple)
  const accent = theme.accentLineFrom;
  const ac = hex(accent); const ar=parseInt(ac.slice(0,2),16), ag=parseInt(ac.slice(2,4),16), ab=parseInt(ac.slice(4,6),16);
  doc.setDrawColor(ar,ag,ab);
  doc.setLineWidth(2);
  doc.line(cardX + 60, cursorY - 20, cardX + 120, cursorY - 20);

  // Two-column meta section
  doc.setFontSize(10);
  doc.setTextColor(theme.textSecondary);
  const leftColX = cardX + 60; const rightColX = cardX + cardW/2 + 20;
  const metaTop = cursorY + 20;
  doc.text('This is to certify that:', leftColX, metaTop);
  doc.text('Effective from:', rightColX, metaTop);
  doc.setFontSize(14);
  doc.setTextColor(theme.textPrimary);
  doc.text(opts.recipient, leftColX, metaTop + 24);
  const dateStr = `${opts.issued.getDate().toString().padStart(2,'0')}/${(opts.issued.getMonth()+1).toString().padStart(2,'0')}/${opts.issued.getFullYear()}`;
  doc.text(dateStr, rightColX, metaTop + 24);

  // Signature placeholder
  const sigY = metaTop + 120;
  doc.setDrawColor(255,255,255);
  doc.setLineWidth(1);
  doc.line(leftColX, sigY, leftColX + 140, sigY);
  doc.setFontSize(10); doc.setTextColor(theme.textSecondary);
  doc.text('Authorized Signatory', leftColX, sigY + 14);

  // Registration number bottom-right inside card
  doc.setFontSize(8); doc.setTextColor(theme.textSecondary);
  doc.text('Registration number:', badgeX - 40, cardY + cardH - 50, { align: 'right' });
  doc.setFontSize(10); doc.setTextColor(theme.textPrimary);
  doc.text(reg, badgeX - 40, cardY + cardH - 34, { align: 'right' });

  // Gradient geometric angled lines (approx reproduction)
  // We'll draw two stroked poly-lines with progressive color shift
  const polyBaseX = badgeX - 10; const polyBaseY = cardY + cardH/2 - 60;
  const colors = theme.gradientPolyline.map(c => {
    const hc = hex(c); return [parseInt(hc.slice(0,2),16), parseInt(hc.slice(2,4),16), parseInt(hc.slice(4,6),16)];
  });
  let offset = 0;
  colors.forEach((c) => {
    doc.setDrawColor(c[0], c[1], c[2]);
    doc.setLineWidth(3);
    doc.line(polyBaseX - offset, polyBaseY + offset, polyBaseX - 220 - offset, polyBaseY + 140 + offset);
    offset += 12;
  });

  // Disclaimers (very small)
  doc.setFontSize(6); doc.setTextColor(theme.disclaimer);
  const disclaimer = 'NexLearn and related marks © NexLearn Inc. All Rights Reserved.';
  doc.text(disclaimer, cardX + 60, cardY + cardH - 30);

  // Hidden (not visually emphasized) validation hash printed micro top-left of footer for anti-tamper
  doc.setFontSize(5); doc.setTextColor(theme.microHash);
  doc.text(`Hash:${hash}`, cardX + 60, cardY + cardH - 18);

  // Attempt to embed rasterized logo image (best effort)
  try {
    const logo = await loadLogoImageData();
    if (logo) {
        const scale = high ? 1.0 : 0.8;
        doc.addImage(logo.dataUrl, 'PNG', cardX + 20, cardY + 15, logo.width * scale, logo.height * scale);
    }
  } catch {}

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
