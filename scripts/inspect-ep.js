const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://animexin.dev";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
};

async function testGetEp() {
    const slug = "sword-of-coming-episode-26-end-indonesia-english-sub";
    const url = `${BASE_URL}/${slug}/`;
    
    try {
        const { data } = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(data);
        
        const title = $('.entry-title').text().trim();
        const animeTitle = title.split(' Episode')[0].trim();
        console.log(`Anime Title: ${animeTitle}`);

        let seriesLink = '';
        $('a').each((i, el) => {
            const txt = $(el).text().trim();
            const href = $(el).attr('href');
            if (href && (txt.includes(animeTitle) || txt.toLowerCase().includes('all episodes')) && !href.includes('episode')) {
                console.log(`Detected Series Link: ${href} (from text: ${txt})`);
                seriesLink = href;
                return false;
            }
        });

        if (!seriesLink) {
            const base = slug.replace(/-episode-\d+.*/, '');
            seriesLink = `${BASE_URL}/${base}/`;
            console.log(`Fallback Series Link: ${seriesLink}`);
        }
        
        const seriesSlug = seriesLink.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
        console.log(`Final Series Slug: ${seriesSlug}`);

    } catch (e) {
        console.error(e.message);
    }
}

testGetEp();