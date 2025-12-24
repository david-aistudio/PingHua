import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://pinghua.qzz.io'; // Your production domain
const API_URL = 'https://www.sankavollerei.com/anime/donghua';

async function fetchFromApi(endpoint) {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

async function generateSitemap() {
  console.log('🗺️  Generating Sitemap...');

  // 1. Static Pages
  const staticPages = [
    '',
    '/ongoing',
    '/completed',
    '/search',
    '/genres',
    '/by-year',
  ];

  // 2. Fetch Dynamic Content (Home, Ongoing, Completed)
  // We fetch page 1 of each to get the latest/trending items for the sitemap
  const [homeData, ongoingData, completedData] = await Promise.all([
    fetchFromApi('home/1'),
    fetchFromApi('ongoing/1'),
    fetchFromApi('completed/1'),
  ]);

  let dynamicUrls = [];

  // Helper to add anime detail links
  const addAnimeLinks = (list) => {
    if (!list) return;
    list.forEach(item => {
      if (item.slug) {
        // Clean slug (sometimes it has slashes)
        const cleanSlug = item.slug.replace(/^\/|\/$/g, '');
        // Priority high for detail pages
        dynamicUrls.push({ url: `/detail/${cleanSlug}`, priority: 0.8, changefreq: 'daily' });
      }
    });
  };

  // Add from Home (Latest Release)
  if (homeData?.latest_release) addAnimeLinks(homeData.latest_release);
  
  // Add from Ongoing
  if (ongoingData?.ongoing_donghua) addAnimeLinks(ongoingData.ongoing_donghua);

  // Add from Completed
  if (completedData?.completed_donghua) addAnimeLinks(completedData.completed_donghua);

  // Remove duplicates
  const uniqueUrls = new Map();
  dynamicUrls.forEach(item => uniqueUrls.set(item.url, item));

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

  <!-- Dynamic Anime Pages (${uniqueUrls.size} items) -->
  ${Array.from(uniqueUrls.values()).map(item => `
  <url>
    <loc>${BASE_URL}${item.url}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('')}
</urlset>`;

  // 4. Write to public/sitemap.xml
  const publicDir = path.resolve(__dirname, '..', 'public');
  // Ensure public dir exists (it should in Vite project)
  if (!fs.existsSync(publicDir)) {
      console.error('❌ Public directory not found at:', publicDir);
      return;
  }
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log(`✅ Sitemap generated with ${staticPages.length + uniqueUrls.size} URLs!`);
}

generateSitemap();
