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

  const cleanPath = path.replace(/^\/|\/$/g, '');
  const sankaUrl = `${SANKA_BASE_URL}/${cleanPath}`;

  try {
    // 1. Ambil dari Supabase (Prioritas Utama)
    const { data: cached } = await supabase
        .from('api_cache')
        .select('data, timestamp')
        .eq('path', cleanPath)
        .single();

    if (cached && cached.data) {
      // Kasih header Cache biar browser user simpen juga
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      res.status(200).json(cached.data);

      // Jalankan update di belakang layar jika sudah stale
      const now = Date.now();
      let ttl = 1000 * 60 * 30; // 30 menit
      if (cleanPath.includes('/detail/') || cleanPath.includes('/episode/')) ttl = 1000 * 60 * 60 * 24;

      if (now - (cached.timestamp || 0) > ttl) {
        // Pake async function mandiri biar TS gak komplain soal catch
        (async () => {
            try {
                const sRes = await axios.get(sankaUrl, { 
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                    timeout: 10000
                });
                await supabase.from('api_cache').upsert({ path: cleanPath, data: sRes.data, timestamp: Date.now() });
            } catch (e) {}
        })();
      }
      return;
    }

    // 2. Kalau Gak Ada di Cache, Ambil dari Sanka
    const sankaRes = await axios.get(sankaUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        timeout: 15000
    });

    const data = sankaRes.data;

    // Simpan ke Supabase tanpa nunggu (fire and forget)
    supabase.from('api_cache').upsert({
        path: cleanPath,
        data: data,
        timestamp: Date.now()
    }).then(() => {});

    return res.status(200).json(data);

  } catch (error: any) {
    console.error(`[Proxy Error] ${cleanPath}: ${error.message}`);
    return res.status(200).json({
        status: "success",
        latest_release: [],
        ongoing_donghua: [],
        completed_donghua: [],
        data: [],
        search_results: []
    });
  }
}
