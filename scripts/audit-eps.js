const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://animexin.dev";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
};

async function checkDetailSlugs() {
    try {
        const url = `${BASE_URL}/anime/sword-of-coming/`;
        const { data } = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(data);
        $('.eplister li a').each((i, el) => {
            const href = $(el).attr('href');
            const num = $(el).find('.epl-num').text().trim();
            console.log(`Ep ${num}: ${href}`);
        });
    } catch (e) {
        console.error(e.message);
    }
}

checkDetailSlugs();