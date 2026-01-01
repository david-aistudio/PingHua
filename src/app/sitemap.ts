import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase-server';

const BASE_URL = 'https://pinghua.qzz.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Halaman Statis (Wajib Ada)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/ongoing`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/completed`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/genres`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 2. Ambil Halaman Dinamis dari Database Cache
  // Kita limit 5000 biar gak timeout, urutkan dari yang terbaru diupdate
  const { data: pages } = await supabaseAdmin
    .from('api_cache')
    .select('path, timestamp')
    .order('timestamp', { ascending: false })
    .limit(5000);

  const dynamicRoutes: MetadataRoute.Sitemap = (pages || []).map((page) => {
    // Path di database: 'detail/slug' atau 'episode/slug'
    const cleanPath = page.path.replace(/^\/|\/$/g, '');
    
    // Tentukan prioritas
    const isDetail = cleanPath.startsWith('detail/');
    const isEpisode = cleanPath.startsWith('episode/');
    
    if (!isDetail && !isEpisode) return null;

    return {
      url: `${BASE_URL}/${cleanPath}`,
      lastModified: new Date(page.timestamp || Date.now()),
      changeFrequency: isDetail ? 'daily' : 'weekly',
      priority: isDetail ? 0.9 : 0.6,
    };
  }).filter(Boolean) as MetadataRoute.Sitemap;

  return [...staticRoutes, ...dynamicRoutes];
}
