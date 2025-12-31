const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://auratail.vip/az-lists/";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
};

async function check() {
    console.log(`Checking ${BASE_URL}...`);
    const { data } = await axios.get(BASE_URL, { headers: HEADERS });
    const $ = cheerio.load(data);
    
    // Cari huruf
    const letters = $('.letter-section h3, .letter-section ul');
    console.log(`Found ${letters.length} letter sections.`);
    
    // Cari Item
    const items = $('.letter-section li a');
    console.log(`Found ${items.length} Total Series in A-Z List.`);
    
    if (items.length > 0) {
        console.log("Sample:", items.first().text(), "->", items.first().attr('href'));
    }
}

check();
