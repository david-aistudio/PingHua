import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import fs from 'fs';

const SUPABASE_URL = "https://spuwbbpzwsfkwhinueuq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdXdiYnB6d3Nma3doaW51ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTQ3MTcsImV4cCI6MjA4MjQ5MDcxN30.M_IjAGI94ETG5kE7zmt-Qyg-iN3Ru86DHCH7igqOMIw";
const SANKA_BASE_URL = 'https://www.sankavollerei.com';
const STATE_FILE = 'warmup-state.json';

// Baca argumen limit page (buat GitHub Actions)
const PAGE_LIMIT = process.argv[2] ? parseInt(process.argv[2]) : 999;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const axiosConfig = {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    timeout: 25000
};

let state = { sectionIndex: 0, page: 1 };
if (fs.existsSync(STATE_FILE) && PAGE_LIMIT > 100) { 
    try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) {} 
}

const saveState = (sectionIndex, page) => {
    if (PAGE_LIMIT > 100) fs.writeFileSync(STATE_FILE, JSON.stringify({ sectionIndex, page }));
};

async function processEpisodes(episodes) {
    const batchSize = 10;
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
        await new Promise(r => setTimeout(r, 1500));
    }
}

async function processSeries(item) {
    const slug = item.href ? item.href.replace('/donghua/detail/', '').replace(/^\/|\/$/g, '') : item.slug.replace(/^\/|\/$/g, '');
    const detailPath = `anime/donghua/detail/${slug}`;
    try {
        process.stdout.write(`\n🌀 ${item.title.substring(0, 20)}.. `);
        const { data: cached } = await supabase.from('api_cache').select('data').eq('path', detailPath).single();
        let detailData = cached?.data;
        if (!detailData) {
            const res = await axios.get(`${SANKA_BASE_URL}/${detailPath}`, axiosConfig);
            detailData = res.data;
            await supabase.from('api_cache').upsert({ path: detailPath, data: detailData, timestamp: Date.now() });
            await new Promise(r => setTimeout(r, 1000));
        } else { process.stdout.write('(C) '); }
        if (detailData && detailData.episodes_list) await processEpisodes(detailData.episodes_list);
    } catch (e) { process.stdout.write('⚠️'); }
}

async function warmup() {
    console.log(`🏎️ PINGHUA BULK-WARMUP (Limit: ${PAGE_LIMIT} pages)`);
    const sections = [
        { name: 'ongoing', key: 'ongoing_donghua' },
        { name: 'completed', key: 'completed_donghua' }
    ];

    for (let i = state.sectionIndex; i < sections.length; i++) {
        const section = sections[i];
        let page = (i === state.sectionIndex) ? state.page : 1;
        let pagesProcessed = 0;

        while (pagesProcessed < PAGE_LIMIT) {
            console.log(`\n\n📄 Sector: ${section.name.toUpperCase()} | Page: ${page}`);
            saveState(i, page);
            try {
                const res = await axios.get(`${SANKA_BASE_URL}/anime/donghua/${section.name}/${page}`, axiosConfig);
                const seriesList = res.data[section.key] || [];
                if (seriesList.length === 0) break;

                for (let j = 0; j < seriesList.length; j += 2) {
                    const batch = seriesList.slice(j, j + 2);
                    await Promise.all(batch.map(item => processSeries(item)));
                }
                page++;
                pagesProcessed++;
                await new Promise(r => setTimeout(r, 3000));
            } catch (err) { console.error(`\n❌ Error hal ${page}:`, err.message); break; }
        }
    }
    console.log('\n\n✨ RITUAL SELESAI! ✨');
    if (fs.existsSync(STATE_FILE) && PAGE_LIMIT > 100) fs.unlinkSync(STATE_FILE);
}

warmup();
