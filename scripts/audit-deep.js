const axios = require('axios');
const cheerio = require('cheerio');

const URL = "https://animexin.dev/renegade-immortal/"; 
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://animexin.dev/'
};

async function audit() {
    console.log(`🕵️‍♂️ DEEP INSPECTION: ${URL}`);
    try {
        const { data } = await axios.get(URL, { headers: HEADERS });
        
        // Cari string "Episode" di seluruh HTML
        const index = data.indexOf('epl-num');
        console.log(`\n🔍 String 'epl-num' found at index: ${index}`);
        
        if (index > -1) {
            console.log("Snippet around 'epl-num':");
            console.log(data.substring(index - 50, index + 200));
        } else {
            console.log("❌ String 'epl-num' NOT FOUND in raw HTML.");
            console.log("Checking if data is in a script tag...");
            if (data.includes('var episodes')) console.log("✅ Found 'var episodes' in script!");
        }

        const $ = cheerio.load(data);
        console.log(`\n📊 Total <li> inside .eplister: ${$('.eplister li').length}`);
        
    } catch (e) { console.log(e.message); }
}

audit();