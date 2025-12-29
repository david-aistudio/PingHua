import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import fs from 'fs';

const SUPABASE_URL = "https://spuwbbpzwsfkwhinueuq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdXdiYnB6d3Nma3doaW51ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTQ3MTcsImV4cCI6MjA4MjQ5MDcxN30.M_IjAGI94ETG5kE7zmt-Qyg-iN3Ru86DHCH7igqOMIw";
const SANKA_BASE_URL = 'https://www.sankavollerei.com';
const STATE_FILE = 'warmup-state.json';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const axiosConfig = {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    timeout: 20000
};

// 1. MISI PENCARIAN (Paling Dicari)
const keywords = [
    'Soul Land', 'BTTH', 'Battle Through the Heavens', 'Perfect World', 'Renegade Immortal',
    'Throne of Seal', 'Swallowed Star', 'Against the Sky Supreme', 'Martial Master', 'Supreme God Emperor',
    'Immortal King', 'Shrouding the Heavens', 'Wanmei Shijie', 'Wu Dong Qian Kun', 'Stellar Transformations'
];

let state = { missionIndex: 0, subIndex: 0, page: 1 };
if (fs.existsSync(STATE_FILE)) { try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) {} }
const saveState = (missionIndex, subIndex, page) => fs.writeFileSync(STATE_FILE, JSON.stringify({ missionIndex, subIndex, page }));

async function processEpisodes(episodes) {
    const batchSize = 12; // Mbappe Nitro
    for (let i = 0; i < episodes.length; i += batchSize) {
        const batch = episodes.slice(i, i + batchSize);
        await Promise.all(batch.map(async (ep) => {
            const epPath = `anime/donghua/episode/${ep.slug.replace(/^\/|\/$/g, '')}`;
            try {
                const { data: existing } = await supabase.from('api_cache').select('path').eq('path', epPath).single();
                if (!existing) {
                    const res = await axios.get(`${SANKA_BASE_URL}/${epPath}`, axiosConfig);
                    await supabase.from('api_cache').upsert({ path: epPath, data: res.data, timestamp: Date.now() });
                    process.stdout.write('.');
                } else { process.stdout.write('o'); }
            } catch (e) { process.stdout.write('x'); }
        }));
        await new Promise(r => setTimeout(r, 1200));
    }
}

async function processSeries(item) {
    const slug = item.href ? item.href.replace('/donghua/detail/', '').replace(/^\/|\/$/g, '') : item.slug.replace(/^\/|\/$/g, '');
    const detailPath = `anime/donghua/detail/${slug}`;
    try {
        process.stdout.write(`\n💎 ${item.title.substring(0, 20)}.. `);
        const { data: cached } = await supabase.from('api_cache').select('data').eq('path', detailPath).single();
        let detailData;
        if (!cached) {
            const res = await axios.get(`${SANKA_BASE_URL}/${detailPath}`, axiosConfig);
            detailData = res.data;
            await supabase.from('api_cache').upsert({ path: detailPath, data: detailData, timestamp: Date.now() });
            await new Promise(r => setTimeout(r, 800));
        } else { detailData = cached.data; process.stdout.write('(C) '); }
        if (detailData && detailData.episodes_list) await processEpisodes(detailData.episodes_list);
    } catch (e) { process.stdout.write('⚠️'); }
}

async function warmup() {
    console.log('🚀 ULTIMATE PINGHUA SCRAPER MACHINE ACTIVATED!');

    // MISI 1: SEARCH SNIPING
    if (state.missionIndex === 0) {
        console.log('\n🎯 MISSION 1: SEARCH SNIPING...');
        for (let i = state.subIndex; i < keywords.length; i++) {
            const kw = keywords[i];
            console.log(`\n🔎 Sniping: ${kw}`);
            saveState(0, i, 1);
            try {
                const res = await axios.get(`${SANKA_BASE_URL}/anime/donghua/search/${encodeURIComponent(kw)}/1`, axiosConfig);
                const results = res.data.data || [];
                for (const item of results) await processSeries(item);
            } catch (e) { console.log('❌ Search Error'); }
        }
        state.missionIndex = 1; state.subIndex = 0; state.page = 1;
    }

    // MISI 2: SECTOR SWEEP (Ongoing & Completed)
    const sectors = [
        { name: 'ongoing', key: 'ongoing_donghua' },
        { name: 'completed', key: 'completed_donghua' }
    ];

    for (let i = state.missionIndex - 1; i < sectors.length; i++) {
        const sector = sectors[i];
        let page = (i === state.missionIndex - 1) ? state.page : 1;
        console.log(`\n\n📂 MISSION ${i+2}: SWEEPING ${sector.name.toUpperCase()}...`);

        while (true) {
            console.log(`\n📄 Page: ${page}`);
            saveState(i + 1, 0, page);
            try {
                const res = await axios.get(`${SANKA_BASE_URL}/anime/donghua/${sector.name}/${page}`, axiosConfig);
                const seriesList = res.data[sector.key] || [];
                if (seriesList.length === 0) break;

                for (let j = 0; j < seriesList.length; j += 2) {
                    const batch = seriesList.slice(j, j + 2);
                    await Promise.all(batch.map(item => processSeries(item)));
                }
                page++;
                await new Promise(r => setTimeout(r, 2000));
            } catch (err) { console.error(`\n❌ Sector Error Page ${page}`); break; }
        }
    }

    console.log('\n\n🏁 ALL MISSIONS COMPLETED! GUDANG FULL TOTAL.');
    if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
}

warmup();