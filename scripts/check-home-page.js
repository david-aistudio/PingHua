const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://auratail.vip";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://www.google.com/'
};

async function check() {
    console.log("🕵️‍♂️ Checking HOME PAGINATION...");
    
    try {
        // Cek Halaman 2 Home
        const url = `${BASE_URL}/page/2/`;
        console.log(`
Fetching: ${url}`);
        
        const { data } = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(data);
        
        console.log("✅ Masuk Page 2!");
        
        // Cek Konten
        const items = [];
        $('article, .post-item').each((i, el) => {
            const title = $(el).find('h2').text().trim();
            if (title) items.push(title);
        });

        console.log(`📦 Found ${items.length} items.`);
        console.log(items.slice(0, 3));

    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

check();
