const axios = require('axios');
const cheerio = require('cheerio');

const URL = "https://animexin.dev/genres/";
const HEADERS = { 'User-Agent': 'Mozilla/5.0' };

async function getGenres() {
    console.log("🧬 FETCHING ANIMEXIN GENRES...");
    try {
        const { data } = await axios.get(URL, { headers: HEADERS });
        const $ = cheerio.load(data);
        
        const genres = [];
        $('.genres li a').each((i, el) => {
            const name = $(el).text().trim().split('(')[0].trim(); // Buang angka dalam kurung
            const href = $(el).attr('href');
            if (href) {
                const slug = href.replace('https://animexin.dev', '').replace('genres/', '').replace(/^\/|\/$/g, '');
                genres.push({ name, slug });
            }
        });

        console.log(JSON.stringify(genres, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

getGenres();
