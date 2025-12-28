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

  // Add Year Routes (Last 6 years)
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 5; year--) {
    staticPages.push(`/by-year?year=${year}`);
  }

  // 2. Fetch Dynamic Content
  console.log('⏳ Fetching dynamic data...');
  
  // Fetch Genres
  const genresData = await fetchFromApi('genres');
  
  // Helper to fetch multiple pages
  const fetchPages = async (endpoint, maxPage) => {
    const promises = [];
    for (let i = 1; i <= maxPage; i++) {
      promises.push(fetchFromApi(`${endpoint}/${i}`));
    }
    return Promise.all(promises);
  };

  // Fetch Home (Just page 1 is enough for latest)
  const homeData = await fetchFromApi('home/1');
  
  // Fetch Ongoing (Deep crawl: 3 pages)
  const ongoingPages = await fetchPages('ongoing', 3);
  
  // Fetch Completed (Deep crawl: 3 pages)
  const completedPages = await fetchPages('completed', 3);

  let dynamicUrls = [];

  // Helper to add anime detail links
  const addAnimeLinks = (list, priority = 0.8, changefreq = 'daily') => {
    if (!list) return;
    list.forEach(item => {
      if (item.slug) {
        const cleanSlug = item.slug.replace(/^\/|\/$/g, '');
        dynamicUrls.push({ 
          url: `/detail/${cleanSlug}`, 
          priority, 
          changefreq 
        });
      }
    });
  };

  // Process Genres
  if (genresData?.data) {
    genresData.data.forEach(genre => {
        dynamicUrls.push({ 
            url: `/genre/${genre.slug}`, 
            priority: 0.9, 
            changefreq: 'weekly' 
        });
    });
  }

  // Process Home
  if (homeData?.latest_release) addAnimeLinks(homeData.latest_release, 1.0, 'always'); // Latest is HOT

  // Process Ongoing Pages
  ongoingPages.forEach(page => {
      if (page?.ongoing_donghua) addAnimeLinks(page.ongoing_donghua, 0.9, 'daily');
  });

  // Process Completed Pages
  completedPages.forEach(page => {
      if (page?.completed_donghua) addAnimeLinks(page.completed_donghua, 0.7, 'monthly');
  });

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
