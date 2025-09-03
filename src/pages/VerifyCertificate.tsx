import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { computeCertificateHash, findLocalCertificate, validateCertificateRemote } from '@/lib/certificate';

const VerifyCertificate: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'course' | 'learning-path'>('course');
  const [issued, setIssued] = useState('');
  const [idOrHash, setIdOrHash] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [remoteStatus, setRemoteStatus] = useState<string | null>(null);

  const handleLocalLookup = () => {
    const rec = findLocalCertificate(idOrHash.trim());
    if (rec) {
      setResult(`VALID (Local) — Hash: ${rec.hash} — Recipient: ${rec.recipient} — Title: ${rec.title} — Issued: ${rec.issued}`);
    } else {
      setResult('No local record found for that ID or hash.');
    }
  };

  const handleRecompute = async () => {
    try {
      if (!recipient || !title || !issued) { setResult('Provide recipient, title, issued date.'); return; }
      const hash = await computeCertificateHash({ recipient, title, type, issued: new Date(issued), id: idOrHash || undefined });
      setResult(`Recomputed Hash: ${hash}`);
    } catch (e:any) {
      setResult('Error computing hash');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Certificate Verification</h1>
      <p className="text-sm text-gray-600">Enter either a certificate ID / hash to lookup locally, or provide full fields to recompute a hash and compare to a printed one.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Certificate ID or Hash</label>
          <Input value={idOrHash} onChange={e=>setIdOrHash(e.target.value)} placeholder="Paste ID or hash" />
          <Button className="mt-2" variant="secondary" onClick={handleLocalLookup}>Lookup Local Record</Button>
        </div>
        <hr />
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Name</label>
            <Input value={recipient} onChange={e=>setRecipient(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Course / Path Title</label>
            <Input value={title} onChange={e=>setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select className="border rounded px-2 py-2 w-full" value={type} onChange={e=>setType(e.target.value as any)}>
              <option value="course">Course</option>
              <option value="learning-path">Learning Path</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Issued Date</label>
            <Input type="date" value={issued} onChange={e=>setIssued(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleRecompute}>Recompute Hash</Button>
        <div className="pt-4 border-t">
          <h2 className="text-lg font-semibold mb-2">Remote Validation</h2>
          <p className="text-xs text-gray-500 mb-2">Checks against server-side certificate store (Supabase).</p>
          <Button variant="outline" onClick={async () => { setRemoteStatus('Validating...'); const res = await validateCertificateRemote(idOrHash.trim()); setRemoteStatus(res.valid ? `VALID (Remote) — Hash: ${res.record.hash}` : `INVALID: ${res.reason}`); }}>Validate Remote</Button>
          {remoteStatus && <div className="mt-2 text-sm" data-testid="remote-status">{remoteStatus}</div>}
        </div>
      </div>
      {result && (
        <div className="p-4 rounded bg-gray-100 text-sm whitespace-pre-wrap">{result}</div>
      )}
    </div>
  );
};

export default VerifyCertificate;
