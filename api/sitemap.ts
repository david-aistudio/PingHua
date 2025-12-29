import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://pinghua.qzz.io';
const SUPABASE_URL = "https://spuwbbpzwsfkwhinueuq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdXdiYnB6d3Nma3doaW51ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTQ3MTcsImV4cCI6MjA4MjQ5MDcxN30.M_IjAGI94ETG5kE7zmt-Qyg-iN3Ru86DHCH7igqOMIw";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const staticPages = ['', '/ongoing', '/completed', '/search', '/genres', '/by-year'];
    
    // Ambil data dari Supabase
    const { data: pages } = await supabase.from('api_cache').select('path');

    const dynamicUrls = pages?.map(item => {
      const cleanPath = item.path.replace('anime/donghua/', '').replace(/^\/|\/$/g, '');
      const isDetail = cleanPath.includes('detail/');
      return `
  <url>
    <loc>${BASE_URL}/${cleanPath}</loc>
    <changefreq>${isDetail ? 'daily' : 'monthly'}</changefreq>
    <priority>${isDetail ? '0.9' : '0.6'}</priority>
  </url>`;
    }).join('') || '';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(p => `
  <url>
    <loc>${BASE_URL}${p}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`).join('')}
  ${dynamicUrls}
</urlset>`;

    // SET HEADER XML (Ini kuncinya!)
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    
    return res.status(200).send(xml);

  } catch (error) {
    return res.status(500).send('Error generating sitemap');
  }
}
