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

  // Gunakan path mentah tanpa pembersihan berlebih untuk menghindari double encoding
  const sankaUrl = `${SANKA_BASE_URL}/${path}`;

  try {
    // 1. Cek Cache Supabase dulu
    const { data: cached } = await supabase
        .from('api_cache')
        .select('data, timestamp')
        .eq('path', path)
        .single();

    if (cached) {
      console.log(`[Proxy] Cache Hit: ${path}`);
      return res.status(200).json(cached.data);
    }

    // 2. Kalau gak ada, baru nembak Sanka
    console.log(`[Proxy] Fetching: ${sankaUrl}`);
    const sankaRes = await axios.get(sankaUrl, {
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        },
        timeout: 12000
    });

    const data = sankaRes.data;

    // 3. Simpan ke Supabase (Jangan di-await biar cepet)
    supabase.from('api_cache').upsert({
        path: path,
        data: data,
        timestamp: Date.now()
    }).catch(e => console.error('[Cache Save Error]', e.message));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error(`[Fatal Proxy Error] path: ${path} | error: ${error.message}`);
    
    // Kalau Sanka nge-block (403/429/500), coba cari apa aja di DB yang mirip
    return res.status(200).json({ 
        status: "error", 
        message: "Sanka busy, please try again",
        data: [] 
    });
  }
}
