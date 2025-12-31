const axios = require('axios');
const cheerio = require('cheerio');

const TARGETS = [
    { name: 'KAZEFURI', url: 'https://kazefuri.top', list: '/anime-list/' },
    { name: 'ANIMEXIN', url: 'https://animexin.dev', list: '/daftar-anime/' } // Tebakan url list
];

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://google.com'
};

async function spy(target) {
    console.log(`
🕵️‍♂️ SPYING ON ${target.name}...`);
    try {
        // 1. Cek HOME
        console.log(`[1] Home: ${target.url}`);
        const homeRes = await axios.get(target.url, { headers: HEADERS });
        const $ = cheerio.load(homeRes.data);
        const updates = $('article, .post-item, .listupd li').length;
        console.log(`   ✅ OK! Found ${updates} updates on Home.`);

        // 2. Cek DETAIL & PLAYER (Ambil 1 sampel dari home)
        const sampleLink = $('article a, .post-item a').first().attr('href');
        if (sampleLink) {
            console.log(`[2] Detail: ${sampleLink}`);
            const detailRes = await axios.get(sampleLink, { headers: HEADERS });
            const $$ = cheerio.load(detailRes.data);
            
            // Cek Iframe
            const iframes = [];
            $$('iframe').each((i, el) => iframes.push($$(el).attr('src')));
            console.log(`   🎥 Iframes found: ${iframes.length}`);
            if (iframes.length > 0) console.log(`      Sample: ${iframes[0]}`);
        }

        // 3. Cek LIST (Arsip)
        // Coba cari menu list
        let listUrl = target.list;
        // Cari di menu kalau tebakan salah
        if (!listUrl) {
            $('a').each((i, el) => {
                const txt = $(el).text().toLowerCase();
                if (txt.includes('list') || txt.includes('daftar')) listUrl = $(el).attr('href');
            });
        }

        if (listUrl) {
            const fullListUrl = listUrl.startsWith('http') ? listUrl : `${target.url}${listUrl}`;
            console.log(`[3] Archive: ${fullListUrl}`);
            const listRes = await axios.get(fullListUrl, { headers: HEADERS });
            const $$$ = cheerio.load(listRes.data);
            const items = $$$('a').length; // Kasar aja
            console.log(`   ✅ OK! Page accessible. (Content length: ${listRes.data.length})`);
        } else {
            console.log(`   ❌ Archive Link Not Found.`);
        }

    } catch (e) {
        console.log(`   ❌ ERROR: ${e.message}`);
        if (e.response?.status === 403) console.log("      🛡️ CLOUDFLARE BLOCKED US!");
    }
}

async function run() {
    for (const t of TARGETS) await spy(t);
}

run();
