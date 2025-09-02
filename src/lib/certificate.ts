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

export async function generateCertificatePDF(opts: CertificateOptions): Promise<Blob> {
  const jsPDF = await getJsPDF();
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
  doc.text('NexLearn • Validation hash: DEMO-HASH', 421, 460, { align: 'center' });
  return doc.output('blob');
}

export async function downloadCertificate(opts: CertificateOptions) {
  try {
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
