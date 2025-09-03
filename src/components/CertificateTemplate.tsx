import React from 'react';
import '../styles/CertificateTemplate.css';

export interface CertificateProps {
  recipientName: string;
  courseTitle: string;
  effectiveDate: string; // preformatted date string
  certificateId: string;
}

const CertificateTemplate: React.FC<CertificateProps> = ({ recipientName, courseTitle, effectiveDate, certificateId }) => {
  return (
    <div className="certificate-container" data-certificate-id={certificateId}>
      {/* Header */}
      <div className="certificate-header">
        <div className="platform-name">NexLearn</div>
        <div className="level-info">
          <span className="level-text">LEVEL 1</span>
          <span className="cert-title">Professional Certification</span>
        </div>
      </div>

      {/* Body */}
      <div className="certificate-body">
        <h1 className="main-title">Digital Certificate in {courseTitle}</h1>
        <div className="gradient-line" />
        <p className="certify-text">This is to certify that:</p>
        <h2 className="recipient-name">{recipientName}</h2>
        <p className="effective-date">Effective from: <strong>{effectiveDate}</strong></p>
        <div className="signature-block">
          <img src="/assets/signature.png" alt="Signature" className="signature" />
          <p className="signer-name">Adam Norman, Chief Executive Officer</p>
        </div>
      </div>

      {/* Footer */}
      <div className="certificate-footer">
        <p className="disclaimer">LEVEL 1 Professional Certification and course content are registered intellectual property of NexLearn.</p>
        <span className="cert-id">{certificateId}</span>
      </div>

      {/* Geometric Design */}
      <div className="geometric-design" />
    </div>
  );
};

export default CertificateTemplate;
