import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE = path.join(__dirname, '..', 'warmup-state.json');

const C = { reset: "\x1b[0m", bright: "\x1b[1m", cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", magenta: "\x1b[35m", blue: "\x1b[34m", gray: "\x1b[90m" };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://spuwbbpzwsfkwhinueuq.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdXdiYnB6d3Nma3doaW51ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTQ3MTcsImV4cCI6MjA4MjQ5MDcxN30.M_IjAGI94ETG5kE7zmt-Qyg-iN3Ru86DHCH7igqOMIw";
const SANKA_BASE_URL = 'https://www.sankavollerei.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const axiosConfig = {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    timeout: 30000
};

const keywords = [
    'Soul Land', 'BTTH', 'Battle Through the Heavens', 'Perfect World', 'Renegade Immortal',
    'Throne of Seal', 'Swallowed Star', 'Against the Sky Supreme', 'Martial Master', 'Supreme God Emperor',
    'Immortal King', 'Shrouding the Heavens', 'Wu Dong Qian Kun', 'Stellar Transformations',
    'A Will Eternal', 'Big Brother', 'Demon Hunter', 'Jade Dynasty', 'Peerless Martial Spirit'
];

let state = { missionIndex: 0, subIndex: 0, page: 1 };
let stats = { new: 0, cached: 0, failed: 0, patched: 0 };

function loadState() { try { if (fs.existsSync(STATE_FILE)) state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) {} }
const saveState = (m, s, p) => { try { fs.writeFileSync(STATE_FILE, JSON.stringify({ missionIndex: m, subIndex: s, page: p })); } catch (e) {} };

async function fetchAndSave(path, type = 'normal') {
    try {
        const cleanPath = path.replace(/^\/|\/$/g, '');
        const { data: existing } = await supabase.from('api_cache').select('path').eq('path', cleanPath).single();
        if (!existing) {
            const res = await axios.get(`${SANKA_BASE_URL}/${cleanPath}`, axiosConfig);
            if (res.data) {
                await supabase.from('api_cache').upsert({ path: cleanPath, data: res.data, timestamp: Date.now() });
                if (type === 'patch') stats.patched++; else stats.new++;
                return 'new';
            }
        } else { stats.cached++; return 'cached'; }
    } catch (e) { stats.failed++; return 'error'; }
    return 'error';
}

// --- GATLING GUN PATTERN GENERATOR ---
function generateAttackPatterns(baseSlug, targetEp) {
    const patterns = [];
    
    // Pattern 1: Standard (martial-master-episode-100-...)
    // Kita coba tebak base slug bersihnya dulu
    // misal: martial-master-episode-300-subtitle-indonesia -> martial-master
    let cleanBase = baseSlug.replace(/-episode-\d+-.*/, '');
    
    // Peluru 1: Standar
    patterns.push(`${cleanBase}-episode-${targetEp}-subtitle-indonesia`);
    
    // Peluru 2: Season 1
    patterns.push(`${cleanBase}-season-1-episode-${targetEp}-subtitle-indonesia`);
    
    // Peluru 3: Pake 0 di depan (01, 02) kalau angka < 100
    if (targetEp < 100) {
        const padded = targetEp.toString().padStart(2, '0');
        patterns.push(`${cleanBase}-episode-${padded}-subtitle-indonesia`);
    } else if (targetEp < 1000) {
        const padded = targetEp.toString().padStart(3, '0');
        patterns.push(`${cleanBase}-episode-${padded}-subtitle-indonesia`);
    }

    // Peluru 4: Kadang pake "sub-indo" doang
    patterns.push(`${cleanBase}-episode-${targetEp}-sub-indo`);

    return patterns;
}

async function gatlingGapFiller(slug, list, total) {
    if (!list || list.length === 0) return;

    const episodes = list.map(ep => {
        const match = ep.slug.match(/episode-(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }).filter(n => n > 0).sort((a, b) => a - b);

    const minEp = episodes[0];

    if (minEp > 1 && total > list.length) {
        console.log(`\n   ${C.yellow}🛠️  GAP DETECTED!${C.reset} MissingEps 1 to ${minEp-1}. Launching Gatling Attack...`);
        process.stdout.write(`   [Gatling] `);

        let attempts = 0;
        // Kita coba ambil mundur dari minEp - 1 sampai 1
        for (let i = minEp - 1; i >= 1; i--) {
            if (attempts > 50) { process.stdout.write(` ${C.red}(Cooldown)${C.reset}`); break; }
            
            const patterns = generateAttackPatterns(list[0].slug, i);
            let success = false;

            // TEMBAK SEMUA POLA
            for (const pSlug of patterns) {
                const path = `anime/donghua/episode/${pSlug}`;
                const res = await fetchAndSave(path, 'patch');
                if (res === 'new' || res === 'cached') {
                    success = true;
                    break; // Kena satu, lanjut ke episode berikutnya
                }
            }
            
            if (success) process.stdout.write(`${C.cyan}+${C.reset}`);
            else process.stdout.write(`${C.gray}-${C.reset}`);
            
            attempts++;
            await new Promise(r => setTimeout(r, 100));
        }
        console.log("");
    }
}

async function processSeries(item) {
    if (!item.title) return;
    const slug = item.href ? item.href.replace('/donghua/detail/', '').replace(/^\/|\/$/g, '') : item.slug.replace(/^\/|\/$/g, '');
    const detailPath = `anime/donghua/detail/${slug}`;
    
    console.log(`\n${C.blue}────────────────────────────────────────────────────────────${C.reset}`);
    console.log(`${C.bright}💎 ${C.magenta}${item.title}${C.reset}`);
    
    try {
        let detailData;
        const { data: cached } = await supabase.from('api_cache').select('data').eq('path', detailPath).single();
        if (!cached) {
            const res = await axios.get(`${SANKA_BASE_URL}/${detailPath}`, axiosConfig);
            detailData = res.data;
            await supabase.from('api_cache').upsert({ path: detailPath, data: detailData, timestamp: Date.now() });
            console.log(`${C.cyan}📦 Source:${C.reset} ${C.green}New Download${C.reset}`);
        } else { 
            detailData = cached.data; 
            console.log(`${C.cyan}📦 Source:${C.reset} ${C.gray}Database Cache${C.reset}`);
        }
        
        if (detailData && detailData.episodes_list) {
            const total = parseInt(detailData.episodes_count) || 0;
            const listSize = detailData.episodes_list.length;
            console.log(`${C.cyan}🔢 Episodes:${C.reset} [${listSize}/${total}] Available in List`);
            process.stdout.write(`   [Normal] `);
            
            // Normal Fetch
            const batchSize = 5; 
            for (let i = 0; i < detailData.episodes_list.length; i += batchSize) {
                const batch = detailData.episodes_list.slice(i, i + batchSize);
                await Promise.all(batch.map(ep => fetchAndSave(`anime/donghua/episode/${ep.slug}`)));
                process.stdout.write(`${C.green}●${C.reset}`);
            }

            // GATLING ATTACK
            if (listSize < total) {
                await gatlingGapFiller(slug, detailData.episodes_list, total);
            }
        }
    } catch (e) { console.log(`${C.red}❌ Error${C.reset}`); }
}

async function warmupRound() {
    loadState();
    console.log(`\n${C.yellow}🚀 ZOMBIE SCRAPER V6.0 (GATLING ATTACK)${C.reset}`);

    if (state.missionIndex === 0) {
        console.log(`\n${C.magenta}🎯 MISSION 1: TARGETED SNIPING${C.reset}`);
        for (let i = state.subIndex; i < keywords.length; i++) {
            const kw = keywords[i];
            console.log(`\n🔍 Searching: ${kw}`);
            saveState(0, i, 1);
            try {
                for(let p = 1; p <= 3; p++) {
                    const res = await axios.get(`${SANKA_BASE_URL}/anime/donghua/search/${encodeURIComponent(kw)}/${p}`, axiosConfig);
                    const results = res.data.data || [];
                    if(results.length === 0) break;
                    for (const item of results) {
                        if (item.title.toLowerCase().includes(kw.toLowerCase().split(' ')[0])) await processSeries(item);
                    }
                }
            } catch (e) {}
        }
        state.missionIndex = 1; state.subIndex = 0; state.page = 1;
        saveState(1, 0, 1);
    }

    const sectors = [{ name: 'ongoing', key: 'ongoing_donghua', mission: 2 }, { name: 'completed', key: 'completed_donghua', mission: 3 }];
    for (let i = state.missionIndex - 1; i < sectors.length; i++) {
        const sector = sectors[i];
        let page = (i === state.missionIndex - 1) ? state.page : 1;
        while (true) {
            console.log(`\n${C.blue}📄 ${sector.name.toUpperCase()} PAGE ${page}${C.reset}`);
            saveState(i + 1, 0, page);
            try {
                const res = await axios.get(`${SANKA_BASE_URL}/anime/donghua/${sector.name}/${page}`, axiosConfig);
                const seriesList = res.data[sector.key] || [];
                if (seriesList.length === 0) break;
                for (const item of seriesList) await processSeries(item);
                page++;
                if (page % 3 === 0) await new Promise(r => setTimeout(r, 2000));
            } catch (err) { 
                console.error(`Retry...`); 
                await new Promise(r => setTimeout(r, 5000)); 
            } 
        }
    }
}

(async () => {
    console.clear();
    while(true) {
        try {
            await warmupRound();
            if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
            state = { missionIndex: 0, subIndex: 0, page: 1 };
            await new Promise(r => setTimeout(r, 30000));
        } catch (e) {
            console.error(`Crash:`, e.message);
            await new Promise(r => setTimeout(r, 10000));
        }
    }
})();