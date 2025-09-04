// @ts-nocheck
// Edge Function: process-email-queue
// Scans email_events for failed or pending items whose next_attempt <= now and attempts < max.
// Re-sends via Resend with exponential backoff. Intended to be triggered by a cron every 10 minutes.
// Secrets: RESEND_API_KEY, RESEND_FROM, EMAIL_FUNCTION_TOKEN (optional), SUPABASE_SERVICE_ROLE_KEY
// Deploy: supabase functions deploy process-email-queue --no-verify-jwt
// Cron suggestion: every 10 minutes POST /functions/v1/process-email-queue with header x-email-token

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const RESEND_FROM = Deno.env.get('RESEND_FROM') || 'NexLearn <no-reply@nexlearn.local>';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MAX_ATTEMPTS = 5;

async function query(sql: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/raw_sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify({ query: sql })
  });
  if (!res.ok) throw new Error('raw_sql failed');
  return await res.json();
}

async function fetchEvents() {
  const now = new Date().toISOString();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/email_events?or=(status.eq.failed,status.eq.pending)&next_attempt=lte.${now}&attempts=lt.${MAX_ATTEMPTS}&select=*`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  if (!res.ok) throw new Error('fetch events failed');
  return await res.json();
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html })
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status}`);
  return await res.json();
}

function rebuildTemplate(ev: any) {
  const t = ev.type;
  if (t === 'signup') return { subject: 'Welcome to NexLearn! 🎓', html: `<h1>Welcome!</h1><p>Your account has been created. Start your first course today.</p>` };
  if (t === 'course_started') return { subject: `You started ${ev.payload?.course_title||'a course'}`, html: `<p>Keep momentum going in <strong>${ev.payload?.course_title||'your course'}</strong>.</p>` };
  if (t === 'course_completed') return { subject: `You completed ${ev.payload?.course_title||'a course'}! ✅`, html: `<p>Congratulations on finishing <strong>${ev.payload?.course_title||'your course'}</strong>.</p>` };
  if (t === 'digest') return { subject: 'Your NexLearn 3-Day Digest', html: `<p>This is a retry of your digest summary.</p>` };
  return { subject: 'NexLearn Update', html: '<p>Status update.</p>' };
}

function nextBackoff(attempts: number) {
  // attempts is current attempts count before increment
  const base = Math.min(60, Math.pow(2, attempts) * 5); // cap 60 min
  return new Date(Date.now() + base * 60 * 1000).toISOString();
}

serve(async (req) => {
  if (!RESEND_API_KEY) return new Response('Email not configured', { status: 500 });
  const expected = Deno.env.get('EMAIL_FUNCTION_TOKEN');
  const provided = req.headers.get('x-email-token') || '';
  if (expected && provided !== expected) return new Response('Unauthorized', { status: 401 });
  try {
    const events = await fetchEvents();
    const results: any[] = [];
    for (const ev of events) {
      const attemptNum = (ev.attempts || 0) + 1;
      const { subject, html } = rebuildTemplate(ev);
      try {
        const sent = await sendEmail(ev.email, subject, html);
        await fetch(`${SUPABASE_URL}/rest/v1/email_events?id=eq.${ev.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
          body: JSON.stringify({ status: 'sent', sent_at: new Date().toISOString(), attempts: attemptNum, payload: { ...(ev.payload||{}), retry_id: sent.id } })
        });
        results.push({ id: ev.id, status: 'sent' });
      } catch (e: any) {
        const next = nextBackoff(attemptNum);
        const final = attemptNum >= MAX_ATTEMPTS;
        await fetch(`${SUPABASE_URL}/rest/v1/email_events?id=eq.${ev.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
          body: JSON.stringify({ status: final ? 'failed' : 'failed', error: e.message, attempts: attemptNum, next_attempt: final ? null : next })
        });
        results.push({ id: ev.id, status: 'failed', attempt: attemptNum });
      }
    }
    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
