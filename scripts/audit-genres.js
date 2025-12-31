const axios = require('axios');
const cheerio = require('cheerio');

const URL = "https://animexin.dev/genres/";
const HEADERS = { 'User-Agent': 'Mozilla/5.0' };

async function check() {
    console.log(`🕵️‍♂️ AUDITING GENRE HTML: ${URL}`);
    try {
        const { data } = await axios.get(URL, { headers: HEADERS });
        const $ = cheerio.load(data);
        
        console.log("\n[1] Finding all <ul> and <li> classes...");
        $('ul, li').each((i, el) => {
            const cls = $(el).attr('class');
            if (cls && i < 20) console.log(`   - Found: ${$(el).prop('tagName')} class="${cls}"`);
        });

        console.log("\n[2] Searching for specific words...");
        const words = ['Action', 'Adventure', 'Fantasy'];
        words.forEach(w => {
            const el = $(`a:contains("${w}")`).first();
            if (el.length > 0) {
                console.log(`   - Word "${w}" found in: <${el.prop('tagName')} class="${el.attr('class')}" href="${el.attr('href')}">`);
                console.log(`     Parent class: ${el.parent().attr('class')}`);
                console.log(`     Grandparent class: ${el.parent().parent().attr('class')}`);
            }
        });

    } catch (e) { console.log(e.message); }
}

check();
