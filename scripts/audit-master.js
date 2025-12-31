const axios = require('axios');
const fs = require('fs');

const URL = "https://animexin.dev/renegade-immortal-episode-121-indonesia-english-sub/";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://animexin.dev/'
};

async function deepAudit() {
    console.log(`🕵️‍♂️ DOWNLOADING RAW HTML: ${URL}`);
    try {
        const { data } = await axios.get(URL, { headers: HEADERS });
        
        // Simpan buat lo liat kalau penasaran
        fs.writeFileSync('raw_episode.html', data);
        console.log("✅ HTML Downloaded to 'raw_episode.html'");

        // 1. Cari tau apakah ada 'eplister' di halaman episode
        const hasEplister = data.includes('eplister');
        console.log(`
🔍 Does HTML have 'eplister'? ${hasEplister}`);

        // 2. Cari semua link yang mengandung kata 'anime' atau 'series'
        console.log("\n🔍 Looking for Series/Induk indicators:");
        const pattern = /href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
        let match;
        let foundLinks = [];
        while ((match = pattern.exec(data)) !== null) {
            const href = match[1];
            const text = match[2].trim();
            if (href.includes('animexin.dev') && !href.includes('episode') && href.length < 60) {
                foundLinks.push({ text, href });
            }
        }
        console.log(foundLinks.slice(0, 10));

        // 3. Cek apakah ada DATA JSON tersembunyi (biasanya buat list eps)
        if (data.includes('var episodes') || data.includes('window.episodes')) {
            console.log("\n✅ ALERT: Found dynamic episodes data in script tags!");
        }

    } catch (e) { console.log("❌ ERROR:", e.message); }
}

deepAudit();
