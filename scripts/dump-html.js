const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://auratail.vip/az-list/";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://www.google.com/'
};

async function dump() {
    try {
        const { data } = await axios.get(BASE_URL, { headers: HEADERS });
        console.log("HTML Preview (Search for 'ul' or 'li'):\n");
        
        // Cari bagian list
        const listStart = data.indexOf('<ul');
        if (listStart > -1) {
            console.log(data.substring(listStart, listStart + 1000));
        } else {
            console.log(data.substring(0, 1000));
        }
    } catch(e) { console.log("Error"); }
}

dump();
