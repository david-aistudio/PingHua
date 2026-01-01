const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://animexin.dev";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
};

async function findEp() {
    try {
        const { data } = await axios.get(`${BASE_URL}/?s=Sword+of+Coming`, { headers: HEADERS });
        const $ = cheerio.load(data);
        $('.listupd article').each((i, el) => {
            console.log($(el).find('.tt').text().trim(), $(el).find('a').attr('href'));
        });
    } catch (e) {
        console.error(e.message);
    }
}

findEp();
