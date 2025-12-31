const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// CONFIG
const SUPABASE_URL = "https://poabpotcwqzsfzdmkezt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYWJwb3Rjd3F6c2Z6ZG1rZXp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzExNTI3MywiZXhwIjoyMDgyNjkxMjczfQ.vlO35pzk7mtDnZnAyLmBUtDgfPu_AOUfgWn8GrLz5RM";
const BASE_URL = "https://auratail.vip";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.google.com/'
};
const STATE_FILE = 'auratail-state.json';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// COLORS
const C = { reset: "\x1b[0m", bright: "\x1b[1m", cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", magenta: "\x1b[35m", blue: "\x1b[34m", gray: "\x1b[90m" };

let state = { page: 1, mode: 'home' }; // mode: 'home' -> 'archive'
if (fs.existsSync(STATE_FILE)) { 
    try { 
        const loaded = JSON.parse(fs.readFileSync(STATE_FILE));
        // Pastikan properti penting ada
        if (loaded.page) state.page = loaded.page;
        if (loaded.mode) state.mode = loaded.mode;
    } catch(e){} 
}
const saveState = () => fs.writeFileSync(STATE_FILE, JSON.stringify(state));

async function scrapeDetail(url) {
    try {
        const { data } = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(data);
        const title = $('h1.entry-title').text().trim();
        let poster = $('.thumb img').attr('src');
        if (poster?.includes('data:image')) poster = $('.thumb img').attr('data-src');
        const synopsis = $('.entry-content p').first().text().trim();
        const status = $('.info-content .status').text().trim().replace('Status:', '').trim() || 'Ongoing';
        
        const episodes_list = [];
        $('#episode_list li a').each((i, el) => {
            const num = $(el).find('.epl-num').text().trim();
            const link = $(el).attr('href');
            if (link) {
                const slug = link.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                episodes_list.push({ episode: `Episode ${num}`, slug, url: `/episode/${slug}` });
            }
        });

        return { title, poster, synopsis, status, type: 'Donghua', episodes_list, episodes_count: episodes_list.length.toString() };
    } catch(e) { return null; }
}

async function startCrawling() {
    console.clear();
    console.log(`${C.bright}${C.magenta}🚀 MULTI-TRACK CRAWLER (${state.mode.toUpperCase()} - Page ${state.page})...${C.reset}\n`);

    while(true) {
        // LOGIKA PINDAH JALUR (Multi-Track)
        let url;
        if (state.mode === 'home') {
            url = state.page === 1 ? BASE_URL : `${BASE_URL}/page/${state.page}/`;
        } else {
            // Kalau Home abis, pindah ke Arsip Donghua (List semua)
            url = `${BASE_URL}/donghua/page/${state.page}/`;
        }

        console.log(`\n📄 ${state.mode.toUpperCase()} PAGE ${state.page} Scanning... (${url})`);
        
        try {
            const { data } = await axios.get(url, { headers: HEADERS });
            const $ = cheerio.load(data);
            const items = [];

            // Selector dinamis (Home pake article, Archive mungkin beda)
            $('article, .post-item, .listupd .bs').each((i, el) => {
                const link = $(el).find('a').first().attr('href');
                if (link) items.push(link);
            });

            if (items.length === 0) { 
                console.log("🏁 End of list."); 
                // Kalau mode Home abis, pindah ke Archive
                if (state.mode === 'home') {
                    console.log("🔄 Switching track to ARCHIVE mode...");
                    state.mode = 'archive';
                    state.page = 1;
                    saveState();
                    continue; // Lanjut loop dengan mode baru
                } else {
                    break; // Beneran abis
                }
            }

            console.log(`   Found ${items.length} items.`);

            for (const link of items) {
                // Logic Scrape Detail
                let detailUrl = link;
                
                // Kalau linknya episode, cari detailnya
                if (link.includes('episode')) {
                    const slugGuess = link.replace(BASE_URL, '').replace(/-episode-\d+.*/, '').replace(/\//g, '');
                    // Kita coba cari via Search API dulu (simulasi) atau tebak URL
                    // Disini kita pake tebakan URL detail aja biar cepet
                    detailUrl = `${BASE_URL}/donghua/${slugGuess}/`;
                }

                const slug = detailUrl.replace(BASE_URL, '').replace(/^\/|\/$/g, '').replace('donghua/', '');
                
                // Filter slug sampah
                if (!slug || slug.includes('page') || slug.includes('status')) continue;

                const detailPath = `detail/${slug}`;
                const { data: cached } = await supabase.from('api_cache').select('timestamp').eq('path', detailPath).single();
                
                // Kalau mode Archive, kita cuma ambil yang BELUM ADA (titik). Gak usah update (hemat waktu).
                const shouldScrape = !cached || (state.mode === 'home' && Date.now() - cached.timestamp > 1000 * 60 * 60 * 24);

                if (shouldScrape) {
                    const detail = await scrapeDetail(detailUrl);
                    if (detail && detail.episodes_list.length > 0) {
                        await supabase.from('api_cache').upsert({ path: detailPath, data: detail, timestamp: Date.now() });
                        process.stdout.write(C.green + '●' + C.reset);
                    } else { process.stdout.write(C.red + 'x' + C.reset); }
                } else { process.stdout.write(C.gray + '.' + C.reset); }
            }

            state.page++;
            saveState();
            await new Promise(r => setTimeout(r, 1000));

        } catch (e) {
            console.error("❌ Error:", e.response?.status || e.message);
            
            // Kalau 404 di Home, pindah ke Archive
            if (e.response?.status === 404 && state.mode === 'home') {
                console.log("🔄 Home end reached (404). Switching to ARCHIVE...");
                state.mode = 'archive';
                state.page = 1;
                saveState();
            } else if (state.mode === 'archive' && e.response?.status === 404) {
                console.log("🏁 Archive end reached. MISSION COMPLETE.");
                break;
            } else {
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }
}

startCrawling();