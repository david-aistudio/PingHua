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
  console.log('🗺️  Generating Sitemap directly to DIST folder...');

  const staticPages = ['', '/ongoing', '/completed', '/search', '/genres', '/by-year'];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 2020; year--) {
    staticPages.push(`/by-year?year=${year}`);
  }

  console.log('⏳ Fetching dynamic links from Supabase...');
  const { data: pages } = await supabase.from('api_cache').select('path');

  const dynamicUrls = pages?.map(item => {
    const cleanPath = item.path.replace('anime/donghua/', '').replace(/^\/|\/$/g, '');
    const isDetail = cleanPath.includes('detail/');
    return {
        url: `/${cleanPath}`,
        priority: isDetail ? 0.9 : 0.6,
        changefreq: isDetail ? 'weekly' : 'monthly'
    };
  }) || [];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(route => `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`).join('')}
  ${dynamicUrls.map(item => `
  <url>
    <loc>${BASE_URL}${item.url}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('')}
</urlset>`;

  // Tulis ke DIST dan PUBLIC buat jaga-jaga
  const dirs = ['./dist', './public'];
  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        const outputPath = path.join(dir, 'sitemap.xml');
        fs.writeFileSync(outputPath, sitemap);
        console.log(`✅ Saved to ${outputPath}`);
    }
  });
}

generateSitemap();
