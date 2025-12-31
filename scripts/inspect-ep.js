const axios = require('axios');
const cheerio = require('cheerio');

const URL = "https://animexin.dev/renegade-immortal-episode-121-indonesia-english-sub/";
const HEADERS = { 'User-Agent': 'Mozilla/5.0' };

async function check() {
    console.log(`🕵️‍♂️ INSPECTING EPISODE: ${URL}`);
    try {
        const { data } = await axios.get(URL, { headers: HEADERS });
        const $ = cheerio.load(data);
        
        console.log(`🎬 Page Title: ${$('title').text()}`);
        
        // 1. Cek Server List (Select Box)
        console.log("\n[1] Checking Select Box (.mirror)...");
        const selectCount = $('select.mirror option').length;
        console.log(`   Found ${selectCount} options.`);
        $('select.mirror option').each((i, el) => {
            console.log(`   - [${i}] ${$(el).text().trim()} (Val length: ${$(el).val().length})`);
        });

        // 2. Cek Iframe langsung (Backup)
        console.log("\n[2] Checking Raw Iframes...");
        const iframes = $('iframe').length;
        console.log(`   Found ${iframes} raw iframes.`);
        $('iframe').each((i, el) => {
            console.log(`   - [${i}] src: ${$(el).attr('src')}`);
        });

        // 3. Cek Video Player Container
        console.log("\n[3] Checking Player Containers...");
        console.log(`   .player-embed exists? ${$('.player-embed').length > 0}`);
        console.log(`   #player_embed exists? ${$('#player_embed').length > 0}`);
        console.log(`   .video-content exists? ${$('.video-content').length > 0}`);

    } catch (e) {
        console.error("❌ FAIL:", e.message);
    }
}

check();
