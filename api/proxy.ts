import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SANKA_BASE_URL = 'https://www.sankavollerei.com';

const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Path is required' });
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const sankaUrl = `${SANKA_BASE_URL}/${cleanPath}`;

  try {
    // 1. Coba nembak Sanka (Prioritas Real-time)
    const sankaRes = await axios.get(sankaUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
        timeout: 6000
    });

    const data = sankaRes.data;

    // 2. Simpan ke Supabase di belakang layar
    // Kita simpen aslinya, Supabase JSONB bakal kompres otomatis
    supabase.from('api_cache').upsert({
        path: cleanPath,
        data: data,
        timestamp: Date.now()
    }).then(() => console.log(`[Supabase] Cached: ${cleanPath}`))
      .catch(err => console.error('[Supabase Error]', err.message));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error(`[Proxy Error] ${error.message}. Checking Supabase Fallback...`);

    // 3. JALUR DARURAT: Ambil dari Supabase
    const { data: cached } = await supabase
        .from('api_cache')
        .select('data')
        .eq('path', cleanPath)
        .single();

    if (cached) {
        console.log(`[Fallback] Serving from Supabase: ${cleanPath}`);
        return res.status(200).json(cached.data);
    }

    return res.status(500).json({ error: 'Connection failed' });
  }
}
