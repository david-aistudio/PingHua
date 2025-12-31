const axios = require('axios');
const cheerio = require('cheerio');

const URL = "https://animexin.dev/throne-of-seal-episode-191-indonesia-english-sub/";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://animexin.dev/'
};

async function audit() {
    console.log(`🕵️‍♂️ AUDITING BANDEL EPISODE: ${URL}`);
    try {
        const { data } = await axios.get(URL, { headers: HEADERS });
        const $ = cheerio.load(data);
        
        console.log(`✅ Title: ${$('h1').text()}`);

        // 1. Cek Breadcrumb
        console.log("\n[1] Breadcrumb Links:");
        $('.breadcrumb a').each((i, el) => {
            console.log(`   - [${i}] ${$(el).text()} -> ${$(el).attr('href')}`);
        });

        // 2. Cek Seluruh Link di Halaman
        console.log("\n[2] All links containing 'throne-of-seal' (but not episode):");
        $('a').each((i, el) => {
            const h = $(el).attr('href');
            if (h && h.includes('throne-of-seal') && !h.includes('episode')) {
                console.log(`   - ${$(el).text().trim()} -> ${h}`);
            }
        });

        // 3. Cek Script Data
        console.log("\n[3] Checking Script Tags for 'series' keyword...");
        $('script').each((i, el) => {
            const html = $(el).html();
            if (html && html.includes('series')) {
                console.log(`   - Found 'series' in script [${i}]. Snippet: ${html.substring(0, 100)}`);
            }
        });

    } catch (e) { console.log("❌ FAIL:", e.message); }
}

audit();
