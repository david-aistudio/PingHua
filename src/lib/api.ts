import { animexin } from './animexin';
import { supabaseAdmin } from './supabase-server';
import { redis } from './redis';
import { DonghuaDetail, EpisodeDetail } from './types';

export * from './types';

// FUNGSI CACHE WRAPPER (HYBRID REDIS + SUPABASE)
async function getOrUpdateCache<T>(path: string, fetchFn: () => Promise<T | null>): Promise<T | null> {
  const cleanPath = path.replace(/^\/|\/$/g, '').replace(/\//g, ':'); // Ganti / jadi : buat redis key
  try {
    // 1. LAPIS 1: Cek REDIS (RAM - Super Fast)
    const redisData = await redis.get<T>(cleanPath);
    if (redisData) {
        // console.log(`[TurboCache] 🚀 RAM HIT: ${cleanPath}`);
        return redisData;
    }

    // 2. LAPIS 2: Cek SUPABASE (DB - Backup)
    const { data: cached } = await supabaseAdmin.from('api_cache').select('data, timestamp').eq('path', cleanPath.replace(/:/g, '/')).single();
    
    const now = Date.now();
    let ttl = 1000 * 60 * 60 * 24; // Default 24 jam buat detail/umum

    // Tentukan TTL
    if (cleanPath === 'home' || cleanPath.startsWith('ongoing')) {
        ttl = 1000 * 60 * 20; // 20 Menit
    } else if (cleanPath.startsWith('detail:')) {
        const isCompleted = cached?.data?.status?.toLowerCase().includes('completed') || cached?.data?.status?.toLowerCase().includes('tamat');
        ttl = isCompleted ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 20; 
    }

    if (cached && cached.data) {
        const isStale = (now - (cached.timestamp || 0)) > ttl;
        
        // Simpan ke Redis biar next request lebih cepet
        if (!isStale) {
            redis.set(cleanPath, cached.data, Math.floor(ttl / 1000));
        } else {
            // Update Background (Stale)
            fetchFn().then(fresh => { 
                if (fresh) {
                    const freshTtl = Math.floor(ttl / 1000);
                    supabaseAdmin.from('api_cache').upsert({ path: cleanPath.replace(/:/g, '/'), data: fresh, timestamp: now }).then(() => {});
                    redis.set(cleanPath, fresh, freshTtl);
                }
            }).catch(() => {});
        }
        return cached.data as T;
    }

    // 3. LAPIS 3: SCRAPING SOURCE (First Time)
    // console.log(`[TurboCache] 💨 MISS: ${cleanPath}. Fetching source...`);
    const freshData = await fetchFn();
    
    const isEmpty = !freshData || 
                    (Array.isArray((freshData as any).data) && (freshData as any).data.length === 0) ||
                    (Array.isArray((freshData as any).latest_release) && (freshData as any).latest_release.length === 0) ||
                    (Array.isArray((freshData as any).episodes_list) && (freshData as any).episodes_list.length === 0);

    if (freshData && !isEmpty) {
        const freshTtlSeconds = Math.floor(ttl / 1000);
        await Promise.all([
            supabaseAdmin.from('api_cache').upsert({ path: cleanPath.replace(/:/g, '/'), data: freshData, timestamp: now }),
            redis.set(cleanPath, freshData, freshTtlSeconds)
        ]);
        return freshData;
    }
    return freshData;
  } catch (e) { return null; }
}

export const api = {
  // Home: Pake getHomeData khusus Animexin
  getHome: async () => getOrUpdateCache<any>('home', async () => {
      const data = await animexin.getHomeData();
      return { 
          popular: data?.popular || [], 
          latest_release: data?.latest || [], 
          recommendation: data?.recommendation || []
      };
  }),

  getOngoing: async (page: number = 1) => getOrUpdateCache<any>(`ongoing/${page}`, async () => {
      // Animexin Ongoing = Home Latest with Pagination
      const data = await animexin.getHomeData(page);
      return { ongoing_donghua: data?.latest || [] };
  }),

  getCompleted: async (page: number = 1) => getOrUpdateCache<any>(`completed/${page}`, async () => {
      const res = await animexin.search('Completed');
      return { completed_donghua: res.data };
  }),

  getDetail: async (slug: string) => getOrUpdateCache<DonghuaDetail>(`detail/${slug}`, () => animexin.getDetail(slug) as any),
  
  getEpisode: async (slug: string) => getOrUpdateCache<EpisodeDetail>(`episode/${slug}`, () => animexin.getEpisode(slug) as any),

  search: async (keyword: string) => { 
      const res = await animexin.search(keyword); 
      return { data: res.data }; 
  },

  getGenres: async () => getOrUpdateCache<any>('genres', () => animexin.getGenres()),
  
  getByGenre: async (slug: string, page: number = 1) => getOrUpdateCache<any>(`genre/${slug}/${page}`, () => animexin.getByGenre(slug, page)),
};
