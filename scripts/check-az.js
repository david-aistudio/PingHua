const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://auratail.vip";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://www.google.com/'
};

async function check() {
    const url = `${BASE_URL}/az-list/`;
    console.log(`\nInspecting: ${url}`);
    
    const { data } = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(data);
    
    // Cari Navigasi Huruf (A, B, C...)
    const letters = [];
    $('.letter-link, .letters a').each((i, el) => {
        letters.push({
            char: $(el).text().trim(),
            href: $(el).attr('href')
        });
    });

    console.log(`🔤 Found ${letters.length} Letter Links`);
    if (letters.length > 0) console.log(letters.slice(0, 5));

    // Cari List Anime (Mungkin grouping per huruf di satu halaman?)
    const groups = $('.letter-section, .group-letter');
    console.log(`📦 Found ${groups.length} Letter Groups (One Page Layout?)`);
    
    if (groups.length === 0) {
        // Coba cari list biasa
        const list = $('.soralist ul li a, .post-item a');
        console.log(`📄 Flat List Items: ${list.length}`);
        if(list.length > 0) console.log(`   Sample: ${list.first().text()}`);
    }
}

check();