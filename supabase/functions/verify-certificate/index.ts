// Supabase Edge Function: verify-certificate
// Deploy with: supabase functions deploy verify-certificate --no-verify-jwt (adjust auth as needed)
// Expects JSON body: { idOrHash: string }
// Returns: { status: 'valid' | 'not_found'; record?: {...} }

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Minimal CORS helper
function cors(res: Response) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  return res;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return cors(new Response('ok'));
  try {
    const { idOrHash } = await req.json();
    if (!idOrHash) return cors(new Response(JSON.stringify({ error: 'idOrHash required' }), { status: 400 }));

    // Supabase client inside function
    // Use service role key via env var (automatically injected by Supabase)
    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const client = createClient(url, key);

    let { data, error } = await client.from('certificates').select('*').eq('id', idOrHash).limit(1);
    if (error) throw error;
    if (!data || data.length === 0) {
      const res2 = await client.from('certificates').select('*').eq('hash', idOrHash).limit(1);
      if (res2.error) throw res2.error;
      data = res2.data;
    }
    if (data && data.length > 0) {
      return cors(new Response(JSON.stringify({ status: 'valid', record: data[0] }), { status: 200 }));
    }
    return cors(new Response(JSON.stringify({ status: 'not_found' }), { status: 404 }));
  } catch (e: any) {
    return cors(new Response(JSON.stringify({ error: e?.message || 'internal error' }), { status: 500 }));
  }
});
