import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import clientPromise from './lib/mongodb.js';

const SANKA_BASE_URL = 'https://www.sankavollerei.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Path is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('pinghua');
    const collection = db.collection('api_cache');

    // 1. Cek di Cache MongoDB
    const cachedData = await collection.findOne({ path });

    // Tentukan waktu kadaluarsa (TTL)
    // Home/Ongoing/Search: 15 menit
    // Detail/Episode/Genres: 7 hari (karena jarang berubah)
    let ttl = 1000 * 60 * 15; // default 15 menit
    if (path.includes('/detail/') || path.includes('/episode/') || path.includes('/genres')) {
        ttl = 1000 * 60 * 60 * 24 * 7; // 7 hari
    }

    const now = Date.now();

    if (cachedData && (now - cachedData.timestamp < ttl)) {
      console.log(`[Cache Hit] Serving from MongoDB: ${path}`);
      return res.status(200).json(cachedData.data);
    }

    // 2. Kalau Gak Ada atau Kadaluarsa, Fetch dari Sanka
    console.log(`[Cache Miss] Fetching from Sanka: ${path}`);
    const sankaUrl = `${SANKA_BASE_URL}/${path}`;
    
    try {
        const response = await axios.get(sankaUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        const data = response.data;

        // 3. Simpan/Update ke MongoDB
        await collection.updateOne(
            { path },
            { $set: { data, timestamp: now } },
            { upsert: true }
        );

        return res.status(200).json(data);
    } catch (fetchError: any) {
        // Kalau Sanka Error (Limit/Down), tapi kita punya data lama di Cache, kasih aja data lama
        if (cachedData) {
            console.log(`[Sanka Error] Serving STALE data for: ${path}`);
            return res.status(200).json(cachedData.data);
        }
        return res.status(fetchError.response?.status || 500).json({ error: 'Sanka API Error' });
    }

  } catch (error: any) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
