import React from 'react';
import { computeCertificateHash, CertificateOptions } from '@/lib/certificate';

interface Props {
  options: CertificateOptions;
  className?: string;
}

// Lightweight visual approximation of the PDF design for on-screen preview
export const CertificatePreview: React.FC<Props> = ({ options, className }) => {
  const [hash, setHash] = React.useState('');
  React.useEffect(() => {
    computeCertificateHash(options).then(setHash).catch(()=>{});
  }, [options]);
  const reg = hash ? `${hash.slice(0,4)}-${hash.slice(4,8)}-${hash.slice(8,12)}` : '---- ---- ----';
  const issued = options.issued.toLocaleDateString('en-GB');
  return (
    <div className={className} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{
        background: 'linear-gradient(135deg,#eef2f3,#d6dde0)',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ position: 'relative', background: '#1a242e', color: '#fff', width: 900, padding: '3.5rem 4rem 3rem', boxShadow: '0 22px 40px -12px rgba(0,0,0,0.45)', overflow: 'hidden' }}>
          {/* Badge */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: 210, height: 130, background: '#37414b', padding: '1.1rem 1.2rem' }}>
            <div style={{ fontSize: 11, letterSpacing: 1 }}>LEVEL 1</div>
            <div style={{ fontSize: 19, fontWeight: 600, marginTop: 6 }}>Professional</div>
            <div style={{ fontSize: 11, opacity: .85, marginTop: 6 }}>{options.type === 'course' ? 'Course' : 'Learning Path'} Certification</div>
          </div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', marginBottom: '3rem' }}>
            <img src="/assets/logo-nexlearn.svg" width={60} height={60} alt="NexLearn Logo" style={{ display: 'block' }} />
            <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: 0.5 }}>NEXLEARN</div>
          </div>
          {/* Title */}
          <h1 style={{ fontSize: 30, lineHeight: 1.25, fontWeight: 600, maxWidth: 560 }}>Digital Certificate in {options.title}</h1>
          <div style={{ height: 18 }} />
          <div style={{ width: 70, height: 3, background: 'linear-gradient(90deg,#ffd22e,#ff4800)' }} />
          <div style={{ height: 40 }} />
          <div style={{ display: 'flex', gap: '5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, color: '#b5c2cc', marginBottom: 6 }}>This is to certify that:</div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>{options.recipient}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#b5c2cc', marginBottom: 6 }}>Effective from:</div>
              <div style={{ fontSize: 18 }}>{issued}</div>
            </div>
          </div>
          <div style={{ height: 90 }} />
          <div>
            <div style={{ width: 150, height: 1, background: '#fff', marginBottom: 8 }} />
            <div style={{ fontSize: 11, color: '#b5c2cc' }}>Authorized Signatory</div>
          </div>
          {/* Registration */}
          <div style={{ position: 'absolute', right: 250, bottom: 70, textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#b5c2cc' }}>Registration number:</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{reg}</div>
          </div>
          {/* Gradient Angled Lines */}
          <svg width={420} height={320} style={{ position: 'absolute', right: -40, bottom: -40 }} viewBox="0 0 420 320" fill="none">
            <polyline points="420,0 180,320" stroke="#ff6e40" strokeWidth={9} />
            <polyline points="420,30 150,320" stroke="#ff7840" strokeWidth={9} />
            <polyline points="420,60 120,320" stroke="#ff8640" strokeWidth={9} />
            <polyline points="420,90 90,320" stroke="#ff9540" strokeWidth={9} />
            <polyline points="420,120 60,320" stroke="#ffa440" strokeWidth={9} />
          </svg>
          {/* Disclaimers */}
          <div style={{ position: 'absolute', left: 64, bottom: 26, fontSize: 9, color: '#7a8791' }}>
            NexLearn and related marks are trademarks of NexLearn Inc. Unauthorized reproduction prohibited.
          </div>
          <div style={{ position: 'absolute', left: 64, bottom: 14, fontSize: 7, color: '#53616b' }}>Hash:{hash}</div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
