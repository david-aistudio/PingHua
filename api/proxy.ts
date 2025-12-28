import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import clientPromise from './lib/mongodb.js';

const SANKA_BASE_URL = 'https://www.sankavollerei.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Path is required' });
  }

  // Path pembersihan biar gak double slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const sankaUrl = `${SANKA_BASE_URL}/${cleanPath}`;

  try {
    // 1. Coba nembak Sanka dulu (Biar Real-time sesuai mau lu)
    console.log(`[Proxy] Fetching REALTIME from Sanka: ${cleanPath}`);
    
    const sankaRes = await axios.get(sankaUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
        timeout: 5000 // 5 detik aja biar gak kelamaan nunggu kalau Sanka lemot
    });

    const data = sankaRes.data;

    // 2. Simpan/Update ke MongoDB di belakang layar (Async)
    // Kita gak pake 'await' biar user gak nungguin MongoDB kelar save
    clientPromise.then(async (client) => {
        const db = client.db('pinghua');
        await db.collection('api_cache').updateOne(
            { path: cleanPath },
            { $set: { data, timestamp: Date.now() } },
            { upsert: true }
        );
        console.log(`[Cache] Updated MongoDB for: ${cleanPath}`);
    }).catch(err => console.error('[Cache Error] MongoDB update failed:', err.message));

    return res.status(200).json(data);

  } catch (sankaError: any) {
    console.error(`[Sanka Error] ${sankaError.message}. Trying MongoDB Fallback...`);

    // 3. JALUR DARURAT: Kalau Sanka Limit/Error, ambil dari MongoDB
    try {
        const client = await clientPromise;
        const db = client.db('pinghua');
        const cachedData = await db.collection('api_cache').findOne({ path: cleanPath });

        if (cachedData) {
            console.log(`[Fallback] Serving cached data for: ${cleanPath}`);
            return res.status(200).json(cachedData.data);
        }
    } catch (mongoError: any) {
        console.error('[Fatal] MongoDB also failed:', mongoError.message);
    }

    return res.status(500).json({ error: 'All data sources failed' });
  }
}