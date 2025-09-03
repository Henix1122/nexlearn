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

