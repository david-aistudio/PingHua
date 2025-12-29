import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const SUPABASE_URL = "https://spuwbbpzwsfkwhinueuq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdXdiYnB6d3Nma3doaW51ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTQ3MTcsImV4cCI6MjA4MjQ5MDcxN30.M_IjAGI94ETG5kE7zmt-Qyg-iN3Ru86DHCH7igqOMIw";
const SANKA_BASE_URL = 'https://www.sankavollerei.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const axiosConfig = {
    headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.sankavollerei.com/'
    },
    timeout: 20000
};

async function processEpisodeBatch(episodes) {
    const batchSize = 6; 
    for (let i = 0; i < episodes.length; i += batchSize) {
        const batch = episodes.slice(i, i + batchSize);
        await Promise.all(batch.map(async (ep) => {
            const epSlug = ep.slug.replace(/^\/|\/$/g, '');
            const epPath = `anime/donghua/episode/${epSlug}`;
            try {
                const { data: existing } = await supabase.from('api_cache').select('path').eq('path', epPath).single();
                if (!existing) {
                    const res = await axios.get(`${SANKA_BASE_URL}/${epPath}`, axiosConfig);
                    await supabase.from('api_cache').upsert({ path: epPath, data: res.data, timestamp: Date.now() });
                    process.stdout.write('.');
                    await new Promise(r => setTimeout(r, 600)); 
                } else { process.stdout.write('o'); }
            } catch (e) { process.stdout.write('x'); }
        }));
    }
}

async function processSeries(item) {
    const slug = item.slug.replace(/^\/|\/$/g, '');
    const detailPath = `anime/donghua/detail/${slug}`;
    try {
        console.log(`\n🌀 Series: ${item.title}`);
        const { data: cached } = await supabase.from('api_cache').select('data').eq('path', detailPath).single();
        let detailData = cached?.data;
        if (!detailData) {
            const res = await axios.get(`${SANKA_BASE_URL}/${detailPath}`, axiosConfig);
            detailData = res.data;
            await supabase.from('api_cache').upsert({ path: detailPath, data: detailData, timestamp: Date.now() });
        }
        if (detailData && detailData.episodes_list) await processEpisodeBatch(detailData.episodes_list);
    } catch (e) { console.log(`\n⚠️ Fail: ${item.title}`); }
}

async function warmup() {
    console.log('🌌 PINGHUA SILENT-ASSASSIN ACTIVATED 🌌');
    const sections = [
        { name: 'ongoing', key: 'ongoing_donghua' },
        { name: 'completed', key: 'completed_donghua' }
    ];
    
    for (const section of sections) {
        let page = 1;
        while (true) {
            console.log(`\n\n📄 Sector: ${section.name.toUpperCase()} | Page: ${page}`);
            try {
                const res = await axios.get(`${SANKA_BASE_URL}/anime/donghua/${section.name}/${page}`, axiosConfig);
                const seriesList = res.data[section.key] || [];
                if (seriesList.length === 0) break;

                for (const item of seriesList) {
                    await processSeries(item);
                }
                page++;
                await new Promise(r => setTimeout(r, 2000));
            } catch (err) {
                console.log(`\n❌ Error: ${err.message}`);
                if (err.response?.status === 429) {
                    console.log('🛑 Limit Sanka! Istirahat 30 detik...');
                    await new Promise(r => setTimeout(r, 30000));
                } else {
                    break;
                }
            }
        }
    }
    console.log('\n\n✨ MISSION ACCOMPLISHED! ✨');
}
warmup();
