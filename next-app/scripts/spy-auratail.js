const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://auratail.vip";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://google.com'
};

async function spy() {
    console.log("🕵️‍♂️ AGEN RAHASIA MELUNCUR KE AURATAIL...\n");

    try {
        // 1. CEK HOME
        console.log(`[1] Ngetuk Pintu Depan (Home)...`);
        const homeRes = await axios.get(BASE_URL, { headers: HEADERS });
        
        if (homeRes.status === 200) {
            console.log("✅ Masuk Home Berhasil!");
            const $ = cheerio.load(homeRes.data);
            
            // Coba cari list update
            // (Selector ini tebakan umum, nanti kita sesuaikan dari output)
            const titles = [];
            $('article, .post-item, .entry-title').each((i, el) => {
                if (i < 5) titles.push($(el).text().trim().substring(0, 30));
            });
            
            if (titles.length > 0) {
                console.log("📦 Dapet Judul:", titles);
            } else {
                console.log("⚠️ Masuk sih, tapi gak nemu elemen judul. Struktur HTML beda.");
                // Print dikit HTML-nya buat analisa
                // console.log(homeRes.data.substring(0, 500));
            }

            // 2. CARI LINK EPISODE BUAT DIINSPECT
            // Kita coba cari link yang mengandung 'episode'
            let episodeLink = '';
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (href && href.includes('episode') && !episodeLink) {
                    episodeLink = href;
                }
            });

            if (episodeLink) {
                console.log(`\n[2] Nyerbu Kamar Episode: ${episodeLink}`);
                const epRes = await axios.get(episodeLink, { headers: HEADERS });
                const $$ = cheerio.load(epRes.data);
                
                console.log(`🎬 Judul Page: ${$$('title').text()}`);
                
                // 3. CARI PLAYER (IFRAME)
                console.log("\n[3] Mencari Harta Karun (Player)...");
                const iframes = [];
                $$('iframe').each((i, el) => {
                    const src = $$(el).attr('src');
                    if (src) iframes.push(src);
                });

                if (iframes.length > 0) {
                    console.log("🚨 KETEMU IFRAME:", iframes);
                    if (iframes.some(url => url.includes('blogger') || url.includes('google'))) {
                        console.log("✅ Good News: Player kayaknya pake Google/Blogger (Biasanya bersih/cepet).");
                    } else {
                        console.log("⚠️ Warning: Player pake host aneh-aneh (Rawan Iklan).");
                    }
                } else {
                    console.log("❌ Gak nemu iframe. Mungkin pake video tag atau script custom.");
                }

            } else {
                console.log("❌ Gagal nyari link episode di Home.");
            }

        }

    } catch (e) {
        console.error("\n💀 MISI GAGAL!");
        console.error(`Status: ${e.response?.status || 'Unknown'}`);
        console.error("Penyebab:", e.message);
        
        if (e.response?.status === 403) {
            console.error("\n🛡️ TERHALANG CLOUDFLARE!");
            console.error("Server Vercel/Local kita diblokir. Butuh strategi 'Puppeteer' atau 'FlareSolverr'.");
        }
    }
}

spy();
