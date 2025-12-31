const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://auratail.vip";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://www.google.com/'
};

async function check() {
    console.log("🕵️‍♂️ Checking GENRE PATHS...");
    
    const targets = [
        '/genre/action/',
        '/genres/action/',
        '/category/action/',
        '/anime-genre/action/',
        '/donghua-genre/action/'
    ];

    for (const path of targets) {
        const url = `${BASE_URL}${path}`;
        process.stdout.write(`Testing: ${path.padEnd(30)} `);
        
        try {
            const { data } = await axios.get(url, { headers: HEADERS });
            const $ = cheerio.load(data);
            const items = $('article, .post-item').length;
            
            if (items > 0) {
                console.log(`✅ OK! Found ${items} items.`);
            } else {
                console.log(`⚠️ 200 OK but Empty.`);
            }
        } catch (e) {
            console.log(`❌ ${e.response?.status || e.message}`);
        }
    }
}

check();