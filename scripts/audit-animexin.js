const axios = require('axios');
const cheerio = require('cheerio');

const URL_DETAIL = "https://animexin.dev/anime/renegade-immortal/";
const URL_EPISODE = "https://animexin.dev/renegade-immortal-episode-121-indonesia-english-sub/";
const HEADERS = { 'User-Agent': 'Mozilla/5.0' };

async function audit() {
    console.log("🧐 AUDITING ANIMEXIN ELEMENTS...");

    try {
        // AUDIT DETAIL
        console.log(`\n[1] Auditing Detail: ${URL_DETAIL}`);
        const dRes = await axios.get(URL_DETAIL, { headers: HEADERS });
        const $ = cheerio.load(dRes.data);
        
        console.log("   --- Searching for Episode List ---");
        const listSelectors = ['#episode_list', '.eplister', '.episodes-list', '.cur-eps'];
        listSelectors.forEach(sel => {
            const count = $(sel).find('li, a').length;
            console.log(`   Selector [${sel}]: Found ${count} items.`);
        });

        // AUDIT EPISODE
        console.log(`\n[2] Auditing Episode: ${URL_EPISODE}`);
        const eRes = await axios.get(URL_EPISODE, { headers: HEADERS });
        const $$ = cheerio.load(eRes.data);
        
        const allEpsBtn = $$('.all-episodes a').attr('href') || $$('.breadcrumb a').last().attr('href');
        console.log(`   Link Induk Found: ${allEpsBtn}`);

    } catch (e) { console.log(e.message); }
}

audit();