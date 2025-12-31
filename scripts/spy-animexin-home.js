const axios = require('axios');
const cheerio = require('cheerio');

async function spy() {
    console.log("🕵️‍♂️ SPYING ANIMEXIN HOME WIDGETS...");
    try {
        const { data } = await axios.get('https://animexin.dev', { 
            headers: { 'User-Agent': 'Mozilla/5.0' } 
        });
        const $ = cheerio.load(data);

        // Cari Widget dengan judul "Popular"
        $('h2, h3, .section-title').each((i, el) => {
            const title = $(el).text().trim();
            console.log(`\n📦 Section: "${title}"`);
            
            // Cek item di bawahnya
            const container = $(el).closest('.bixbox, .section, .widget');
            const items = container.find('li, article, .post-item');
            
            if (items.length > 0) {
                console.log(`   Found ${items.length} items.`);
                console.log(`   First: ${items.first().find('h4, .title').text().trim()}`);
            }
        });

        // Cek Sidebar (Biasanya popular ada di sini)
        console.log("\n[SIDEBAR CHECK]");
        $('#sidebar .widget').each((i, el) => {
            console.log(`📌 Widget: ${$(el).find('h3').text().trim()}`);
        });

    } catch(e) { console.log(e.message); }
}

spy();
