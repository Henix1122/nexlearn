# Shadcn-UI Template Usage Instructions

## technology stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

All shadcn/ui components have been downloaded under `@/components/ui`.

## File Structure

- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration file
- `tailwind.config.js` - Tailwind CSS configuration file
- `package.json` - NPM dependencies and scripts
- `src/app.tsx` - Root component of the project
- `src/main.tsx` - Project entry point
- `src/index.css` - Existing CSS configuration
- `src/pages/Index.tsx` - Home page logic

## Components

- All shadcn/ui components are pre-downloaded and available at `@/components/ui`

## Styling

- Add global styles to `src/index.css` or create new CSS files as needed
- Use Tailwind classes for styling components

## Development

- Import components from `@/components/ui` in your React components
- Customize the UI by modifying the Tailwind configuration

## Note

- The `@/` path alias points to the `src/` directory
- In your typescript code, don't re-export types that you're already importing

# Commands

**Install Dependencies**

```shell
pnpm i
```

**Add Dependencies**

```shell
pnpm add some_new_dependency

```

**Start Preview**

```shell
pnpm run dev
```

**To build**

```shell
pnpm run build
```

## Author

Maintained by **Henix1122** (<michaelboadiasareot@gmail.com>)

## Collaboration

Developed in collaboration with:

- **Blue Scavengers Security Company** – Strategic security research input and curriculum validation.
- **FortiFind Company** – Threat intelligence enrichment and lab scenario contributions.

These partners help ensure realistic, up-to-date defensive and offensive cybersecurity learning content.

## Environment & Supabase Configuration

Create a local `.env` (never commit) based on `.env.example`:

```bash
cp .env.example .env
```

Fill in:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

Security practices:

1. Rotate leaked anon keys immediately (Supabase Dashboard > Settings > API > Regenerate anon key).
2. Never expose the service role key to the browser—only use it in Edge Functions or backend.
3. Edge Functions automatically receive `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in their environment (don’t hardcode).
4. Restrict RLS policies to least privilege; the public anon key should only read/write allowed rows.
5. For local dev without keys, the app falls back to a benign placeholder and logs a console warning.

## Certificate Verification Flow

1. Client issues certificate (stores local + upserts Supabase `certificates`).
2. PDF embeds a truncated SHA-256 hash (first 12 hex chars).
3. Verification page supports local lookup, hash recompute, and remote Supabase check.
4. Edge Function (`verify-certificate`) enables server-side validation without exposing broad table queries in the client.

## Logging & Reliability

- `logger.ts` buffers client logs and flushes periodically or when online.
- `ErrorBoundary` captures React render errors and feeds the logger.
- Pending logs kept in `localStorage` (key `nex_log_buffer`).

## Adding External Scripts Securely

Use the SRI loader (`loadScriptWithIntegrity`) with an integrity hash and `crossorigin="anonymous"`. Example:

```ts
import { loadScriptWithIntegrity } from '@/lib/sriLoader';
await loadScriptWithIntegrity({
	src: 'https://cdn.example.com/lib.min.js',
	integrity: 'sha384-<HASH>',
});
```

## Key Rotation Checklist

1. Regenerate key in Supabase dashboard.
2. Update `.env` locally & in deployment secrets.
3. Redeploy Edge Functions if needed.
4. Invalidate cached builds (CI/CD redeploy).
5. Audit repo/PRs to ensure old key not reintroduced.

## Quick Connectivity Test & Troubleshooting

After creating or editing your `.env`, you MUST restart the Vite dev server (Vite only reads env vars at startup):

```bash
pnpm run dev
```

### 1. In-Browser Console Test

Open DevTools Console and run:

```js
import { supabase } from '/src/lib/supabaseClient';
supabase.from('certificates').select('*').limit(1).then(console.log)
```

If you see a warning about missing env vars or the network request never hits your `*.supabase.co` domain, verify the `.env` values.

### 2. Script Test

Optional script (requires `ts-node` if not already installed globally):

```bash
pnpm add -D ts-node
pnpm ts-node scripts/test-supabase.ts
```

You should see either a sample row or an empty array; failure messages indicate configuration or RLS issues.

### 3. Edge Function Deployment & Test

Deploy the verification function (from your project root with the Supabase CLI installed and logged in):

```bash
supabase functions deploy verify-certificate
```

Then test it (replace `<project-ref>`):

```bash
curl -X POST \
	https://<project-ref>.functions.supabase.co/verify-certificate \
	-H 'Content-Type: application/json' \
	-d '{"idOrHash":"test"}'
```

Expected responses:

- `{ "status": "not_found" }` when no matching certificate.
- `{ "status": "valid", "certificate": { ... } }` for a valid match.
- `{ "status": "error", "message": "..." }` on server issues.

### 4. Common Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 401 or permission error | Missing/overly strict RLS | Adjust policies to allow anon role for intended rows |
| Network call absent | Dev server not restarted or wrong env var names | Restart and confirm names: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Hash mismatch in verification | Data modified after issuance | Re-issue certificate to regenerate hash |
| Edge function 404 | Function not deployed / wrong ref | Re-run deploy and confirm project ref |

### 5. Next Hardening Steps (Optional)

- Move remote verification to always pass through the Edge Function instead of direct table queries.
- Add rate limiting (Supabase global config or custom logic) for verification requests.
- Implement structured logging pipeline forwarding Edge Function logs to an external SIEM.

## Supabase Integration & Sync Strategy

The app operates in an offline-first hybrid mode:

1. Immediate local updates (localStorage) for UX responsiveness.
2. Background + on-demand sync to Supabase (retry queue for transient failures).
3. Hydration on login to merge authoritative remote state back into local profile.

### Tables Overview

| Table | Purpose |
|-------|---------|
| users | Profile extension (membership, ctf_points) |
| enrollments | Enrollment + completion timestamp |
| module_progress | Per-module completion records |
| certificates | Issued certificates (publicly readable) |
| learning_paths | (Optional) Path metadata |
| user_learning_paths | Path enrollment/completion |

Migration file: `supabase/migrations/202509030001_full_schema.sql` (apply via CLI or dashboard SQL editor).

### Key Client Functions

| Function | Responsibility |
|----------|---------------|
| hydrateProgressFromSupabase | Pull enrollments, module progress, certificates, ctf points |
| completeCourse | Local completion + remote upsert (enrollment + certificate placeholder) |
| incrementCtfPoints | Local increment + remote users upsert |
| syncAllToSupabase | Bulk push all local state (enrollments, modules, certificates, ctf points) |
| processQueue | Retry failed individual mutations (enrollments/module progress/completions) |

### Full Sync Flow

1. User logs in → `hydrateProgressFromSupabase` merges remote.
2. User acts (enroll/toggle module/complete) → local update + immediate remote attempt → on error queued.
3. Queue processor retries with exponential backoff.
4. Manual recovery (if needed) → call `syncAllToSupabase()` from a dev console to force reconciliation.

### Manual Sync Trigger

Open dev console:

```js
import { syncAllToSupabase } from '/src/lib/auth';
syncAllToSupabase().then(console.log);
```

### RLS Notes

Policies in migration file are minimal. Harden by:
- Restricting `users` update to explicit column list (use grants + stored procedures).
- Adding rate limits (Edge Functions or WAF) for `certificates` issuance.
- Preventing deletion of completed enrollments (additional policy or trigger).

### Operational Checklist

1. Apply migration file.
2. Verify RLS policies active (`select relrowsecurity from pg_class where relname='enrollments';`).
3. Seed `courses` table optionally (IDs must match client). 
4. Run app, login, open console, call `hydrateProgressFromSupabase()` (implicit on login) to pull prior data.
5. Perform actions; observe network calls to `*.supabase.co/rest/v1/...`.
6. If mismatches → run `syncAllToSupabase()`.

### Edge Function (Optional Validation)

Move verification to Edge Function for tighter surface area; current client still does direct `certificates` selects under public read policy.

### Future Enhancements

- Differential sync (track last synced timestamp in localStorage).
- Conflict resolution strategy (server wins vs. merge) for module progress.
- Dedicated `ctf_events` audit table for point changes.
- Use channel (realtime) to push certificate issuance updates to active sessions.

## Certificate Design (Updated)

The PDF certificate now matches the dark professional style (slate panel, badge, angled gradient lines).

Key implementation details:

- Function: `generateCertificatePDF` in `src/lib/certificate.ts`.
- Registration number derives from the first 12 chars of the validation hash (format `XXXX-XXXX-XXXX`).
- Micro printed hash (anti-tamper) at bottom-left footer inside card.
- On-screen preview: `CertificatePreview` component (`src/components/CertificatePreview.tsx`).

To use preview in a page:

```tsx
import CertificatePreview from '@/components/CertificatePreview';

<CertificatePreview options={{
	recipient: user.name,
	title: currentCourse.title,
	type: 'course',
	issued: new Date(),
	id: currentCourse.id
}} />
```

To regenerate / download a certificate (unchanged API):

```ts
import { downloadCertificate } from '@/lib/certificate';
await downloadCertificate({ recipient: user.name, title: course.title, type: 'course', issued: new Date(), id: course.id });
```

Customization points:

| Aspect | Location | Notes |
|--------|----------|-------|
| Colors | `generateCertificatePDF` | Modify card, badge, gradient arrays |
| Badge Text | `generateCertificatePDF` | Adjust LEVEL / Professional lines |
| Logo | Both preview + PDF | Replace placeholder triangle with vector path |
| Disclaimer | Both | Edit disclaimer string |
| Registration Format | `formatRegistration` | Alter grouping or length |

### Logo Asset

- Primary SVG: `public/assets/logo-nexlearn.svg` (shield with gradient stroke + stylized N).
- PDF version uses a simplified vector drawn directly in `generateCertificatePDF` (no external image dependency for portability).
- To swap logo:
	1. Replace SVG file (keep viewBox similar for sizing) or adjust `<img>` dimensions in `CertificatePreview`.
	2. Update PDF drawing block (search for `Header logo & brand`) with your own vector lines or embed an image (advanced: use `doc.addImage`).
	3. Re-generate any existing certificates if you want them to reflect branding (old PDFs remain unchanged).

### Theming & Image Embedding

`generateCertificatePDF` now supports a `theme` property on options:

```ts
await downloadCertificate({
	recipient: user.name,
	title: course.title,
	type: 'course',
	issued: new Date(),
	id: course.id,
	theme: {
		cardColor: '#101820',
		badgeColor: '#23303a',
		accentLineFrom: '#00d1ff',
		accentLineTo: '#0077ff',
		gradientPolyline: ['#00d1ff','#00b5ff','#0099ff','#007dff','#0062ff']
	}
});
```

If the runtime environment can fetch `/assets/logo-nexlearn.svg`, it is rasterized in-browser and embedded as a PNG into the PDF (fallbacks to vector placeholder if blocked or offline).

### Custom Font & High Quality Export

`generateCertificatePDF` accepts:

| Option | Values | Description |
|--------|--------|-------------|
| `fontUrl` | string | Path/URL to TTF font (same-origin recommended) |
| `fontName` | string | Internal name registered in jsPDF (default `CustomFont`) |
| `quality` | `standard` | `high` | High increases background gradient fidelity & logo raster scale |

Example:

```ts
await downloadCertificate({
	recipient: user.name,
	title: course.title,
	type: 'course',
	issued: new Date(),
	id: course.id,
	fontUrl: '/assets/fonts/Inter-Regular.ttf',
	fontName: 'InterRegular',
	quality: 'high'
});
```

Font embedding falls back silently if the font fails to load; PDF generation proceeds with default font.

## Email Notifications

Implemented via Supabase Edge Functions + Resend.

### Flow

| Event | Trigger | Function | Email Type |
|-------|---------|----------|------------|
| Signup | Successful signup | `send-email` | Welcome |
| Course Started | Enrollment upsert success | `send-email` | course_started |
| Course Completed | Completion upsert success | `send-email` | course_completed |
| 3-Day Digest | Scheduled cron | `digest-email` | digest |

### Setup Steps

1. Create Resend account, verify domain (SPF & DKIM).
2. Generate API key.
3. In Supabase Dashboard → Project Settings → Secrets add:
	- `RESEND_API_KEY=...`
	- `RESEND_FROM="NexLearn <no-reply@yourdomain>"`
4. Deploy functions:
	- `supabase functions deploy send-email --no-verify-jwt`
	- `supabase functions deploy digest-email --no-verify-jwt`
5. (Optional) Add cron job (every 3 days) in Supabase: POST `/functions/v1/digest-email`.
6. Apply migrations to create `email_events` table.

### Table: email_events
Records pending/sent/failed events. Used for audit and retries (manual).

| Column | Purpose |
|--------|---------|
| type | signup / course_started / course_completed / digest |
| status | pending / sent / failed |
| payload | JSON extras (course_id, counts) |

### Customizing Templates
Edit `supabase/functions/send-email/index.ts` in `buildTemplate` switch or extend with richer HTML (consider MJML pre-render offline and inline CSS).

### Security
- Edge Functions deployed with `--no-verify-jwt` since they are invoked from client for transactional events; optionally restrict by adding validation token header.
- No public insert policy for `email_events`; functions use service role.

### Future Enhancements
- Add retry queue for failed sends.
- Digest personalization (top recommended next course).
- Unsubscribe / notification preferences table.

### Notification Preferences (Implemented)

Users can control which emails they receive via the `user_notification_prefs` table (migration adds: `marketing`, `course_started`, `course_completed`, `digest`).

Client helper:

```ts
import { updateNotificationPrefs } from '@/lib/auth';
await updateNotificationPrefs({ course_started: false, digest: true });
```

Behavior:

- `course_started=false` suppresses course start emails.
- `course_completed=false` suppresses completion emails.
- `digest=false` skips the 3‑day digest for that user.
- `marketing` reserved for future promotional campaigns (welcome still sent as transactional).

### Email Retry & Processing

Tables now include retry metadata:

| Column | Purpose |
|--------|---------|
| attempts | Number of send attempts so far |
| next_attempt | ISO timestamp scheduling next retry |

Functions updated:

- `send-email`: On failure sets `attempts=1` and `next_attempt` (+10 min).
- `digest-email`: On failure sets `attempts=1` and `next_attempt` (+30 min).
- `process-email-queue` (new): Cron-driven Edge Function that scans `email_events` where `(status in failed/pending) AND attempts < 5 AND next_attempt <= now` and re-sends with exponential backoff (`5m * 2^attempt`, capped 60m). Deploy with:

```bash
supabase functions deploy process-email-queue --no-verify-jwt
```

Suggested cron (every 10 minutes):

```
*/10 * * * * https://<project-ref>.functions.supabase.co/process-email-queue
```

Add header `x-email-token: <EMAIL_FUNCTION_TOKEN>` if token hardening enabled (see below).

### Security Hardening (Token)

All email-related functions optionally enforce a shared secret token:

1. Add secret in Supabase: `EMAIL_FUNCTION_TOKEN=superlongrandom`.
2. Redeploy functions.
3. Client calls to `/functions/v1/send-email` include the token in JSON body (`{ token: '...' }`).
4. Cron for `digest-email` and `process-email-queue` includes header `x-email-token: ...`.

If token mismatches → 401 Unauthorized.

### Operational Notes

| Concern | Mitigation |
|---------|------------|
| Excess retries on persistent failure | Attempts capped at 5 with exponential backoff |
| Preference changes mid-queue | Next retry still checks prefs before sending (skips quietly) |
| Missing token after enabling | All calls fail 401 until client / cron updated |
| Race updating event status | PATCH queries target by `id` or filtered latest (minimal risk) |

### Next Steps (Optional)

- Add JWT verification (deploy without `--no-verify-jwt`) and issue signed client calls.
- Store rendered HTML snapshot in `email_events.payload` for full audit.
- Add `last_error` column to preserve final failure reason.
- Implement digest batching to reduce Resend API calls for large user counts.




