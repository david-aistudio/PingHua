const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://auratail.vip";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://www.google.com/'
};

async function mapSite() {
    console.log(`🗺️  MAPPING AURATAIL STRUCTURE...\n`);
    
    try {
        const { data } = await axios.get(BASE_URL, { headers: HEADERS });
        const $ = cheerio.load(data);

        // 1. NAVIGASI
        console.log(`[1] NAVIGASI UTAMA`);
        $('.menu li a').each((i, el) => {
            console.log(`   - ${$(el).text().trim()} => ${$(el).attr('href')}`);
        });

        // 2. WIDGETS / SECTIONS
        console.log(`\n[2] HOME WIDGETS (Sections)`);
        // Cari elemen yang punya judul (h2/h3) dan list di bawahnya
        $('.bixbox').each((i, el) => {
            const title = $(el).find('.releases h3, .section-title, h2').text().trim();
            const items = $(el).find('article, .post-item, .listupd li').length;
            if (title) {
                console.log(`   📦 Section: "${title}" (Isi: ${items} items)`);
                // Print contoh item pertama
                const first = $(el).find('a').first().attr('href');
                if (first) console.log(`      Example -> ${first}`);
            }
        });

        // 3. SIDEBAR (Biasanya ada Popular)
        console.log(`\n[3] SIDEBAR WIDGETS`);
        $('#sidebar .section, .sidebar .widget').each((i, el) => {
            const title = $(el).find('h3').text().trim();
            if (title) console.log(`   📌 Widget: "${title}"`);
        });

    } catch (e) {
        console.error("❌ Gagal:", e.message);
    }
}

mapSite();
