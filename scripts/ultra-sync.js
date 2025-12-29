import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const SUPABASE_URL = "https://spuwbbpzwsfkwhinueuq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdXdiYnB6d3Nma3doaW51ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTQ3MTcsImV4cCI6MjA4MjQ5MDcxN30.M_IjAGI94ETG5kE7zmt-Qyg-iN3Ru86DHCH7igqOMIw";
const SANKA_BASE_URL = 'https://www.sankavollerei.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const axiosConfig = {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    timeout: 10000
};

async function processEpisodes(episodes) {
    // KITA HAJAR 15 EPISODE SEKALIGUS (MAX SPEED)
    const batchSize = 15;
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
    }
}

async function sync() {
    console.log('⚡ ULTRA-SYNC MONSTER MODE STARTING...');
    // Kita cek 3 halaman home (Latest Updates)
    for (let page = 1; page <= 3; page++) {
        console.log(`\n📄 Checking Home Page ${page}...`);
        try {
            const res = await axios.get(`${SANKA_BASE_URL}/anime/donghua/home/${page}`, axiosConfig);
            const latest = res.data.latest_release || [];
            
            for (const item of latest) {
                const slug = item.slug.replace(/^\/|\/$/g, '');
                const detailPath = `anime/donghua/detail/${slug}`;
                
                process.stdout.write(`\n🔍 ${item.title.substring(0, 20)}: `);
                
                const { data: cached } = await supabase.from('api_cache').select('data').eq('path', detailPath).single();
                let detailData = cached?.data;
                
                if (!detailData) {
                    try {
                        const dRes = await axios.get(`${SANKA_BASE_URL}/${detailPath}`, axiosConfig);
                        detailData = dRes.data;
                        await supabase.from('api_cache').upsert({ path: detailPath, data: detailData, timestamp: Date.now() });
                    } catch (e) { process.stdout.write('⚠️'); continue; }
                } else { process.stdout.write('(Cache) '); }

                if (detailData?.episodes_list) {
                    await processEpisodes(detailData.episodes_list);
                }
            }
        } catch (err) { console.error(`\n❌ Error Page ${page}: ${err.message}`); }
    }
    console.log('\n\n✅ SYNC COMPLETED!');
}

sync();
