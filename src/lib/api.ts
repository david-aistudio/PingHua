import { animexin } from './animexin';
import { supabaseAdmin } from './supabase-server';
import { DonghuaDetail, EpisodeDetail } from './types';

export * from './types';

// FUNGSI CACHE WRAPPER
async function getOrUpdateCache<T>(path: string, fetchFn: () => Promise<T | null>): Promise<T | null> {
  const cleanPath = path.replace(/^\/|\/$/g, '');
  try {
    // 1. Ambil dari Supabase
    const { data: cached } = await supabaseAdmin.from('api_cache').select('data, timestamp').eq('path', cleanPath).single();
    
    const now = Date.now();
    let ttl = 1000 * 60 * 60 * 24; // Default 24 jam buat detail/umum

    // 2. Tentukan TTL Pintar
    if (cleanPath === 'home' || cleanPath.startsWith('ongoing')) {
        ttl = 1000 * 60 * 10; // 10 Menit buat Home/Ongoing List
    } else if (cleanPath.startsWith('detail/')) {
        // Cek apakah di data cache statusnya "Completed"
        const isCompleted = cached?.data?.status?.toLowerCase().includes('completed') || cached?.data?.status?.toLowerCase().includes('tamat');
        ttl = isCompleted ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 2; // 2 Jam buat Ongoing, 7 Hari buat Tamat
    }

    if (cached && cached.data) {
        // Cek apakah sudah "Basi" (Stale)
        const isStale = (now - (cached.timestamp || 0)) > ttl;

        if (isStale) {
            console.log(`[SmartCache] 🍂 Stale detected: ${cleanPath}. Refreshing in background...`);
            // Update Background (User gak nunggu)
            fetchFn().then(fresh => { 
                if (fresh) {
                    supabaseAdmin.from('api_cache').upsert({ path: cleanPath, data: fresh, timestamp: now })
                    .then(() => console.log(`[SmartCache] ✅ Auto-Healed: ${cleanPath}`));
                }
            }).catch(() => {});
        }
        return cached.data as T;
    }

    // 3. Kalau DB Kosong Melompong (First Time)
    console.log(`[SmartCache] 💨 DB Miss: ${cleanPath}. Scraping source...`);
    const freshData = await fetchFn();
    
    // SAFETY CHECK: Jangan simpen kalau datanya ZONK / KOSONG
    const isEmpty = !freshData || 
                    (Array.isArray((freshData as any).data) && (freshData as any).data.length === 0) ||
                    (Array.isArray((freshData as any).latest_release) && (freshData as any).latest_release.length === 0) ||
                    (Array.isArray((freshData as any).episodes_list) && (freshData as any).episodes_list.length === 0);

    if (freshData && !isEmpty) {
        await supabaseAdmin.from('api_cache').upsert({
            path: cleanPath,
            data: freshData,
            timestamp: now
        });
        return freshData;
    }
    return freshData; // Balikin aja walau kosong, tapi gak masuk DB (biar diretry user berikutnya)
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
