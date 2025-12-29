import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const SUPABASE_URL = "https://spuwbbpzwsfkwhinueuq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdXdiYnB6d3Nma3doaW51ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTQ3MTcsImV4cCI6MjA4MjQ5MDcxN30.M_IjAGI94ETG5kE7zmt-Qyg-iN3Ru86DHCH7igqOMIw";
const SANKA_BASE_URL = 'https://www.sankavollerei.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const axiosConfig = {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    timeout: 15000
};

// DAFTAR KATA KUNCI POPULER (Tambah sendiri sesuka hati bro!)
const keywords = [
    'Soul Land', 'BTTH', 'Battle Through the Heavens', 'Perfect World', 'Renegade Immortal',
    'Throne of Seal', 'Swallowed Star', 'Against the Sky Supreme', 'Martial Master', 'Supreme God Emperor',
    'The Daily Life of the Immortal King', 'A Record of a Mortals Journey', 'Shrouding the Heavens', 'Wanmei Shijie',
    'Zun Shang', 'Wu Dong Qian Kun', 'Stellar Transformations', 'Snow Eagle Lord', 'Jade Dynasty'
];

async function processEpisodes(episodes) {
    const batchSize = 15; // Kecepatan WireGuard lu nih!
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
        await new Promise(r => setTimeout(r, 1000));
    }
}

async function warmupSearch() {
    console.log('🔍 SEARCH WARMUP NITRO ACTIVATED!');
    
    for (const kw of keywords) {
        console.log(`\n\n🔎 Searching for: ${kw}`);
        try {
            const searchUrl = `${SANKA_BASE_URL}/anime/donghua/search/${encodeURIComponent(kw)}/1`;
            const sRes = await axios.get(searchUrl, axiosConfig);
            const results = sRes.data.data || [];

            if (results.length === 0) { console.log('   (No results found)'); continue; }

            for (const item of results) {
                const slug = item.href ? item.href.replace('/donghua/detail/', '').replace(/^\/|\/$/g, '') : item.slug.replace(/^\/|\/$/g, '');
                const detailPath = `anime/donghua/detail/${slug}`;
                
                process.stdout.write(`\n💎 ${item.title.substring(0, 20)}.. `);
                
                const { data: cached } = await supabase.from('api_cache').select('data').eq('path', detailPath).single();
                let detailData;
                
                if (!cached) {
                    const dRes = await axios.get(`${SANKA_BASE_URL}/${detailPath}`, axiosConfig);
                    detailData = dRes.data;
                    await supabase.from('api_cache').upsert({ path: detailPath, data: detailData, timestamp: Date.now() });
                } else {
                    detailData = cached.data;
                    process.stdout.write('(C) ');
                }

                if (detailData?.episodes_list) {
                    await processEpisodes(detailData.episodes_list);
                }
            }
        } catch (err) {
            console.error(`\n❌ Error searching ${kw}:`, err.message);
        }
    }
    console.log('\n\n✅ SEARCH WARMUP COMPLETED!');
}

warmupSearch();
