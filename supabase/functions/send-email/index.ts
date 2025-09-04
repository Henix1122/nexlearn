// @ts-nocheck
// Supabase Edge Function: send-email
// Sends transactional email via Resend and records status in email_events table.
// Environment secrets (set in Supabase project): RESEND_API_KEY, RESEND_FROM

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

interface SendPayload {
  user_id?: string;
  email: string;
  type: 'signup' | 'course_started' | 'course_completed';
  course_id?: string;
  course_title?: string;
  token?: string; // simple shared secret for hardening
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const RESEND_FROM = Deno.env.get('RESEND_FROM') || 'NexLearn <no-reply@nexlearn.local>';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function insertEvent(row: any) {
  return await fetch(`${SUPABASE_URL}/rest/v1/email_events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    },
    body: JSON.stringify(row)
  });
}

function buildTemplate(p: SendPayload) {
  if (p.type === 'signup') {
    return {
      subject: 'Welcome to NexLearn! 🎓',
      html: `<h1>Welcome!</h1><p>Your account has been created. Start your first course today.</p>`
    };
  }
  if (p.type === 'course_started') {
    return {
      subject: `You started ${p.course_title}`,
      html: `<p>Great choice! Keep momentum going in <strong>${p.course_title}</strong>.</p>`
    };
  }
  if (p.type === 'course_completed') {
    return {
      subject: `You completed ${p.course_title}! ✅`,
      html: `<p>Congratulations on finishing <strong>${p.course_title}</strong>. Your certificate is ready in your dashboard.</p>`
    };
  }
  return { subject: 'NexLearn Update', html: '<p>Status update.</p>' };
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html })
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status}`);
  return await res.json();
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!RESEND_API_KEY) return new Response('Email not configured', { status: 500 });
  try {
    const payload: SendPayload = await req.json();
    // Shared token hardening (optional secret added as project secret EMAIL_FUNCTION_TOKEN)
    const expected = Deno.env.get('EMAIL_FUNCTION_TOKEN');
    if (expected && payload.token !== expected) {
      return new Response('Unauthorized', { status: 401 });
    }
    const { subject, html } = buildTemplate(payload);
    // Check notification prefs if user id provided
    if (payload.user_id) {
      try {
        const prefRes = await fetch(`${SUPABASE_URL}/rest/v1/user_notification_prefs?user_id=eq.${payload.user_id}&select=*`, { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } });
        if (prefRes.ok) {
          const prefData = await prefRes.json();
          const prefs = prefData[0];
          if (prefs) {
            if (payload.type === 'course_started' && prefs.course_started === false) return new Response(JSON.stringify({ skipped: true, reason: 'pref_course_started' }), { status: 200 });
            if (payload.type === 'course_completed' && prefs.course_completed === false) return new Response(JSON.stringify({ skipped: true, reason: 'pref_course_completed' }), { status: 200 });
            if (payload.type === 'signup' && prefs.marketing === false) { /* still send transactional welcome */ }
          }
        }
      } catch {}
    }
    await insertEvent({ email: payload.email, user_id: payload.user_id, type: payload.type, payload: { course_id: payload.course_id, course_title: payload.course_title }, status: 'pending' });
    try {
      const r = await sendEmail(payload.email, subject, html);
      // Update status
      await fetch(`${SUPABASE_URL}/rest/v1/email_events?email=eq.${encodeURIComponent(payload.email)}&type=eq.${payload.type}&order=created_at.desc&limit=1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({ status: 'sent', sent_at: new Date().toISOString(), payload: { id: r.id } })
      });
    } catch (e) {
      await fetch(`${SUPABASE_URL}/rest/v1/email_events?email=eq.${encodeURIComponent(payload.email)}&type=eq.${payload.type}&order=created_at.desc&limit=1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({ status: 'failed', error: (e as Error).message, attempts: 1, next_attempt: new Date(Date.now()+1000*60*10).toISOString() })
      });
      throw e;
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e:any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
});
