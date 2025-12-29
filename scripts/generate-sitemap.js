import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://pinghua.qzz.io';
const SUPABASE_URL = "https://spuwbbpzwsfkwhinueuq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdXdiYnB6d3Nma3doaW51ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTQ3MTcsImV4cCI6MjA4MjQ5MDcxN30.M_IjAGI94ETG5kE7zmt-Qyg-iN3Ru86DHCH7igqOMIw";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateSitemap() {
  console.log('🗺️  Generating Sitemap from Supabase Cache...');

  // 1. Static Pages
  const staticPages = [
    '',
    '/ongoing',
    '/completed',
    '/search',
    '/genres',
    '/by-year',
  ];

  // Add Year Routes
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 2020; year--) {
    staticPages.push(`/by-year?year=${year}`);
  }

  // 2. Fetch Slugs from Supabase
  console.log('⏳ Fetching slugs from api_cache...');
  
  // Ambil semua path yang mengandung 'detail/' (Halaman Donghua)
  const { data: detailPages, error: err1 } = await supabase
    .from('api_cache')
    .select('path')
    .like('path', '%detail/%');

  // Ambil semua path yang mengandung 'episode/' (Halaman Nonton)
  const { data: episodePages, error: err2 } = await supabase
    .from('api_cache')
    .select('path')
    .like('path', '%episode/%');

  if (err1 || err2) {
    console.error('❌ Error fetching from Supabase:', err1 || err2);
    return;
  }

  const dynamicUrls = [];

  // Tambahkan link detail
  detailPages?.forEach(item => {
    const slug = item.path.replace('anime/donghua/detail/', '').replace(/^\/|\/$/g, '');
    dynamicUrls.push({ url: `/detail/${slug}`, priority: 0.9, changefreq: 'weekly' });
  });

  // Tambahkan link episode (Opsional: Kalau mau Google index tiap episode)
  episodePages?.forEach(item => {
    const slug = item.path.replace('anime/donghua/episode/', '').replace(/^\/|\/$/g, '');
    dynamicUrls.push({ url: `/episode/${slug}`, priority: 0.6, changefreq: 'monthly' });
  });

  // 3. Construct XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  ${staticPages.map(route => `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`).join('')}

  <!-- Dynamic Pages (${dynamicUrls.length} items) -->
  ${dynamicUrls.map(item => `
  <url>
    <loc>${BASE_URL}${item.url}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('')}
</urlset>`;

  // 4. Write to public/sitemap.xml
  const publicDir = path.resolve(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log(`✅ Sitemap generated with ${staticPages.length + dynamicUrls.length} URLs!`);
}

generateSitemap();