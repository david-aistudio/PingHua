import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://pinghua.qzz.io';
const SUPABASE_URL = "https://spuwbbpzwsfkwhinueuq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdXdiYnB6d3Nma3doaW51ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTQ3MTcsImV4cCI6MjA4MjQ5MDcxN30.M_IjAGI94ETG5kE7zmt-Qyg-iN3Ru86DHCH7igqOMIw";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generate() {
  console.log('🛰️ Generating Static Sitemap for Production...');
  
  const staticPages = ['', '/ongoing', '/completed', '/search', '/genres', '/by-year'];
  const { data: pages } = await supabase.from('api_cache').select('path');

  const dynamicUrls = pages?.map(item => {
    const cleanPath = item.path.replace('anime/donghua/', '').replace(/^\/|\/$/g, '');
    const isDetail = cleanPath.includes('detail/');
    return `<url><loc>${BASE_URL}/${cleanPath}</loc><changefreq>${isDetail ? 'daily' : 'monthly'}</changefreq><priority>${isDetail ? '0.9' : '0.6'}</priority></url>`;
  }) || [];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(p => `<url><loc>${BASE_URL}${p}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`).join('')}
  ${dynamicUrls.join('')}
</urlset>`;

  // Tulis ke DIST biar langsung di-publish sama Vercel
  const distPath = './dist/sitemap.xml';
  const publicPath = './public/sitemap.xml';

  if (fs.existsSync('./dist')) {
      fs.writeFileSync(distPath, sitemap);
      console.log(`✅ Success! File saved at ${distPath}`);
  }
  
  fs.writeFileSync(publicPath, sitemap);
  console.log(`✅ Also saved at ${publicPath} for local development`);
}

generate();
