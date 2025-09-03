import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useCertificateVerification from '@/hooks/useCertificateVerification';

const VerifyCertificate: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'course' | 'learning-path'>('course');
  const [issued, setIssued] = useState('');
  const [idOrHash, setIdOrHash] = useState('');
  const { state, localLookup, recompute, remoteVerify } = useCertificateVerification();

  const handleLocalLookup = () => localLookup(idOrHash);
  const handleRecompute = () => recompute({ recipient, title, type, issued, idOrHash });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Certificate Verification</h1>
      <p className="text-sm text-gray-600">Enter either a certificate ID / hash to lookup locally, or provide full fields to recompute a hash and compare to a printed one.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Certificate ID or Hash</label>
          <Input value={idOrHash} onChange={e=>setIdOrHash(e.target.value)} placeholder="Paste ID or hash" />
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button variant="secondary" onClick={handleLocalLookup}>Local Lookup</Button>
            <Button disabled={!idOrHash || state.loading} onClick={()=>remoteVerify(idOrHash)}>Remote Verify</Button>
          </div>
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
        <Button disabled={state.loading} onClick={handleRecompute}>Recompute Hash</Button>
      </div>
      {state.error && <div className="p-3 rounded bg-red-100 text-red-700 text-sm">{state.error}</div>}
      {state.status && <div className="p-4 rounded bg-gray-100 text-sm whitespace-pre-wrap">{state.status}</div>}
      {state.loading && <div className="text-sm text-gray-500">Processing...</div>}
    </div>
  );
};

export default VerifyCertificate;
