import { useState, useCallback } from 'react';
import { computeCertificateHash, findLocalCertificate, verifyCertificateRemote } from '@/lib/certificate';

export interface VerificationInputs {
  recipient: string;
  title: string;
  type: 'course' | 'learning-path';
  issued: string; // yyyy-mm-dd
  idOrHash: string;
}

interface VerificationState {
  status: string | null;
  loading: boolean;
  error: string | null;
}

export function useCertificateVerification() {
  const [state, setState] = useState<VerificationState>({ status: null, loading: false, error: null });

  const localLookup = useCallback((idOrHash: string) => {
    const rec = findLocalCertificate(idOrHash.trim());
    if (rec) {
      setState({ status: `VALID (Local) — Hash: ${rec.hash} — Recipient: ${rec.recipient} — Title: ${rec.title} — Issued: ${rec.issued}`, loading: false, error: null });
    } else {
      setState({ status: 'No local record found.', loading: false, error: null });
    }
  }, []);

  const recompute = useCallback(async (inputs: VerificationInputs) => {
    if (!inputs.recipient || !inputs.title || !inputs.issued) {
      setState(s => ({ ...s, error: 'Recipient, title and issued date required', loading: false }));
      return;
    }
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const hash = await computeCertificateHash({ recipient: inputs.recipient, title: inputs.title, type: inputs.type, issued: new Date(inputs.issued), id: inputs.idOrHash || undefined });
      setState({ status: `Recomputed Hash: ${hash}`, loading: false, error: null });
    } catch (e:any) {
      setState({ status: null, loading: false, error: 'Recompute failed' });
    }
  }, []);

  const remoteVerify = useCallback(async (idOrHash: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    const res = await verifyCertificateRemote(idOrHash.trim());
    if (res.status === 'valid') {
      setState({ status: `VALID (Remote) — Hash: ${res.record.hash} — Recipient: ${res.record.user_name || res.record.recipient} — Title: ${res.record.title} — Issued: ${res.record.issued}`, loading: false, error: null });
    } else if (res.status === 'not_found') {
      setState({ status: 'No remote record found.', loading: false, error: null });
    } else {
      setState({ status: null, loading: false, error: 'Remote verification error: ' + (res.error || '') });
    }
  }, []);

  return { state, localLookup, recompute, remoteVerify };
}

export default useCertificateVerification;