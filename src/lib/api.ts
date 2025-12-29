import axios from 'axios';
import { supabaseAdmin } from './supabase-server';
import { DonghuaDetail, EpisodeDetail } from './types';

export * from './types';

const SANKA_BASE_URL = 'https://www.sankavollerei.com';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function fetchFromSanka(path: string) {
    const url = `${SANKA_BASE_URL}/${path}`;
    console.log(`\x1b[33m[SANKA FETCH]\x1b[0m 🚀 Requesting: ${url}`);
    try {
        const response = await axios.get(url, {
            headers: HEADERS,
            timeout: 15000 
        });
        console.log(`\x1b[32m[SANKA SUCCESS]\x1b[0m ✅ Got data for: ${path}`);
        return response.data;
    } catch (error: any) {
        console.error(`\x1b[31m[SANKA ERROR]\x1b[0m ❌ Failed: ${path} | ${error.message}`);
        return null;
    }
}

async function getOrUpdateCache<T>(path: string): Promise<T | null> {
  // Debugging credentials
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) console.error("⚠️ SUPABASE URL MISSING");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) console.error("⚠️ SERVICE ROLE KEY MISSING");

  const cleanPath = path.replace(/^\/|\/$/g, '');
  console.log(`\x1b[36m[CACHE CHECK]\x1b[0m 🔍 Looking for: ${cleanPath}`);
  
  try {
    const { data: cached, error } = await supabaseAdmin
        .from('api_cache')
        .select('data, timestamp')
        .eq('path', cleanPath)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error(`\x1b[31m[DB ERROR]\x1b[0m ⚠️ Supabase error: ${error.message}`);
    }

    if (cached && cached.data) {
        const now = Date.now();
        let ttl = 1000 * 60 * 30; // 30 menit
        if (cleanPath.includes('detail/') || cleanPath.includes('episode/')) {
            ttl = 1000 * 60 * 60 * 24; // 24 Jam
        }

        const isStale = now - (cached.timestamp || 0) > ttl;

        if (isStale) {
            console.log(`\x1b[33m[CACHE STALE]\x1b[0m 🍂 Data old. Refreshing bg...`);
            fetchFromSanka(cleanPath).then(freshData => {
                if (freshData) {
                    supabaseAdmin.from('api_cache').upsert({
                        path: cleanPath,
                        data: freshData,
                        timestamp: Date.now()
                    }).then(() => console.log(`\x1b[32m[CACHE UPDATED]\x1b[0m 💾 Saved fresh data: ${cleanPath}`));
                }
            });
        } else {
            console.log(`\x1b[32m[CACHE HIT]\x1b[0m ⚡ Data found in DB!`);
        }

        return cached.data as T;
    }

    console.log(`\x1b[35m[CACHE MISS]\x1b[0m 💨 Not in DB. Fetching Sanka...`);
    const freshData = await fetchFromSanka(cleanPath);

    if (freshData) {
        supabaseAdmin.from('api_cache').upsert({
            path: cleanPath,
            data: freshData,
            timestamp: Date.now()
        }).then(() => console.log(`\x1b[32m[NEW CACHE]\x1b[0m 💾 Saved new data`));
        
        return freshData as T;
    }

    return null;

  } catch (e: any) {
    console.error(`\x1b[31m[FATAL ERROR]\x1b[0m ☠️ Logic Crash:`, e.message);
    return null;
  }
}

export const api = {
  getHome: async (page: number = 1) => getOrUpdateCache<any>(`anime/donghua/home/${page}`),
  getOngoing: async (page: number = 1) => getOrUpdateCache<any>(`anime/donghua/ongoing/${page}`),
  getCompleted: async (page: number = 1) => getOrUpdateCache<any>(`anime/donghua/completed/${page}`),
  getDetail: async (slug: string) => getOrUpdateCache<DonghuaDetail>(`anime/donghua/detail/${slug}`),
  getEpisode: async (slug: string) => getOrUpdateCache<EpisodeDetail>(`anime/donghua/episode/${slug}`),
  search: async (keyword: string, page: number = 1) => {
    const encodedKeyword = encodeURIComponent(keyword);
    return getOrUpdateCache<any>(`anime/donghua/search/${encodedKeyword}/${page}`);
  },
  getGenres: async () => getOrUpdateCache<any>(`anime/donghua/genres`),
  getByGenre: async (slug: string, page: number = 1) => getOrUpdateCache<any>(`anime/donghua/genres/${slug}/${page}`),
};
