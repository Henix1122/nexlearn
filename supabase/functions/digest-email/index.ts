// Edge Function: digest-email
// Sends a 3-day digest summary to each active user summarizing enrollments & completions.
// Invoke via Supabase scheduled cron (every 3 days):
//   supabase functions deploy digest-email --no-verify-jwt
//   Add cron: POST /functions/v1/digest-email
// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const RESEND_FROM = Deno.env.get('RESEND_FROM') || 'NexLearn <no-reply@nexlearn.local>';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function fetchRows(table: string, filter = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${filter}`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  return await res.json();
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html })
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status}`);
}

function buildDigestHTML(user: any, enrollments: any[], completions: any[]) {
  return `<h2>NexLearn Digest</h2>
  <p>Hello ${user.name || 'Learner'}, here is your 3-day progress summary.</p>
  <h3>New Enrollments (${enrollments.length})</h3>
  <ul>${enrollments.map(e=>`<li>${e.course_id}</li>`).join('') || '<li>None</li>'}</ul>
  <h3>Completed Courses (${completions.length})</h3>
  <ul>${completions.map(c=>`<li>${c.course_id}</li>`).join('') || '<li>None</li>'}</ul>
  <p>Keep learning! Visit your dashboard to continue.</p>`;
}

serve(async (req) => {
  if (!RESEND_API_KEY) return new Response('Email not configured', { status: 500 });
  try {
    // Token enforcement
    const expected = Deno.env.get('EMAIL_FUNCTION_TOKEN');
    const provided = req.headers.get('x-email-token') || '';
    if (expected && provided !== expected) return new Response('Unauthorized', { status: 401 });
    const since = new Date(Date.now() - 1000*60*60*24*3).toISOString();
    const users = await fetchRows('users');
    for (const u of users) {
      // Prefs: skip if digest disabled
      try {
        const prefRes = await fetch(`${SUPABASE_URL}/rest/v1/user_notification_prefs?user_id=eq.${u.id}&select=digest`, { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } });
        if (prefRes.ok) {
          const data = await prefRes.json();
            if (data[0] && data[0].digest === false) continue;
        }
      } catch {}
      const enrollments = await fetchRows('enrollments', `?user_id=eq.${u.id}&enrolled_at=gte.${since}`);
      const completed = await fetchRows('enrollments', `?user_id=eq.${u.id}&completed_at=gte.${since}`);
      if (!enrollments.length && !completed.length) continue; // skip quiet users
      const html = buildDigestHTML(u, enrollments, completed.filter((c:any)=>c.completed_at));
      try {
        await sendEmail(u.email, 'Your NexLearn 3-Day Digest', html);
        await fetch(`${SUPABASE_URL}/rest/v1/email_events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
          body: JSON.stringify({ user_id: u.id, email: u.email, type: 'digest', status: 'sent', sent_at: new Date().toISOString(), payload: { enrollments: enrollments.length, completions: completed.length } })
        });
      } catch (e:any) {
        await fetch(`${SUPABASE_URL}/rest/v1/email_events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
          body: JSON.stringify({ user_id: u.id, email: u.email, type: 'digest', status: 'failed', error: e.message, attempts: 1, next_attempt: new Date(Date.now()+1000*60*30).toISOString() })
        });
      }
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e:any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
