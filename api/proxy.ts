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
    // 1. PRIORITAS UTAMA: Ambil dari Supabase (JAKARTA SPEED ⚡)
    const { data: cached } = await supabase
        .from('api_cache')
        .select('data, timestamp')
        .eq('path', cleanPath)
        .single();

    // Kalau ada di cache, langsung kasih ke user (INSTAN!)
    if (cached) {
      console.log(`[Cache Hit] Fast delivery for: ${cleanPath}`);
      // Tambah header biar browser simpan cache selama 5 menit
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      res.status(200).json(cached.data);

      // JANGAN BERHENTI: Cek apakah perlu update dari Sanka di belakang layar (Background Sync)
      // Kita update kalau data sudah lebih dari 30 menit (buat Home) atau 12 jam (buat Detail)
      const now = Date.now();
      let staleThreshold = 1000 * 60 * 30; // 30 menit
      if (cleanPath.includes('/detail/') || cleanPath.includes('/episode/')) {
        staleThreshold = 1000 * 60 * 60 * 12; // 12 jam
      }

      if (now - cached.timestamp > staleThreshold) {
        console.log(`[Background Sync] Refreshing stale data: ${cleanPath}`);
        // Kita nembak Sanka tanpa 'await' biar gak nungguin
        axios.get(sankaUrl, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        }).then(res => {
            supabase.from('api_cache').upsert({
                path: cleanPath,
                data: res.data,
                timestamp: Date.now()
            }).then(() => console.log(`[Cache] Background Update Success: ${cleanPath}`))
              .catch(e => console.error('[Cache Update Error]', e.message));
        }).catch(() => {});
      }
      return; // Selesai buat user
    }

    // 2. JALUR CADANGAN: Kalau belum ada di Supabase, ambil dari Sanka
    console.log(`[Cache Miss] Direct fetch from Sanka: ${cleanPath}`);
    const sankaRes = await axios.get(sankaUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        timeout: 10000
    });

    const data = sankaRes.data;

    // Simpan hasil ke Supabase buat kunjungan berikutnya
    supabase.from('api_cache').upsert({
        path: cleanPath,
        data: data,
        timestamp: Date.now()
    }).catch(e => console.error('[Initial Cache Error]', e.message));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error(`[Fatal Proxy Error] ${error.message}`);
    return res.status(500).json({ error: 'Data currently unavailable' });
  }
}