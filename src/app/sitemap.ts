import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase-server';

const BASE_URL = 'https://pinghua.qzz.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Halaman Statis (Wajib Ada)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
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
    // Bersihin path dari 'anime/donghua/' biar jadi URL bersih
    const cleanSlug = page.path.replace('anime/donghua/', '').replace(/^\/|\/$/g, '');
    
    // Tentukan prioritas
    const isDetail = cleanSlug.includes('detail/');
    const isEpisode = cleanSlug.includes('episode/');
    
    // Filter: Cuma masukin Detail dan Episode ke sitemap
    if (!isDetail && !isEpisode) return null;

    return {
      url: `${BASE_URL}/${cleanSlug}`,
      lastModified: new Date(page.timestamp || Date.now()),
      changeFrequency: isDetail ? 'daily' : 'weekly', // Detail sering update eps baru
      priority: isDetail ? 0.9 : 0.7,
    };
  }).filter(Boolean) as MetadataRoute.Sitemap;

  return [...staticRoutes, ...dynamicRoutes];
}
