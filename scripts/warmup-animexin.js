const { createClient } = require('@supabase/supabase-js');
const scraper = require('../src/lib/animexin-scraper');
const fs = require('fs');

// UI & COLORS
const C = {
    reset: "\x1b[0m", bright: "\x1b[1m",
    cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", magenta: "\x1b[35m", blue: "\x1b[34m", gray: "\x1b[90m",
    bgBlue: "\x1b[44m"
};

// CONFIG
const SUPABASE_URL = "https://poabpotcwqzsfzdmkezt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYWJwb3Rjd3F6c2Z6ZG1rZXp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzExNTI3MywiZXhwIjoyMDgyNjkxMjczfQ.vlO35pzk7mtDnZnAyLmBUtDgfPu_AOUfgWn8GrLz5RM";
const STATE_FILE = 'animexin-state.json';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let state = { page: 1, mode: 'home' }; 
if (fs.existsSync(STATE_FILE)) { try { state = JSON.parse(fs.readFileSync(STATE_FILE)); } catch(e){} }
const saveState = () => fs.writeFileSync(STATE_FILE, JSON.stringify(state));

async function start() {
    console.clear();
    console.log(`${C.bright}${C.cyan}🚀 ANIMEXIN SYNC WORKER (SHARED LOGIC)${C.reset}\n`);

    while(true) {
        console.log(`\n${C.bgBlue} ${state.mode.toUpperCase()} PAGE ${state.page} ${C.reset} Processing...`);
        
        try {
            // A. Ambil List (Scrape Home sesuai mode)
            const homeData = await scraper.scrapeHome(state.page);
            if (!homeData || (homeData.latest.length === 0 && homeData.popular.length === 0)) {
                console.log(`🏁 End of ${state.mode}. Switching...`);
                state.mode = state.mode === 'home' ? 'archive' : 'home';
                state.page = 1;
                saveState();
                continue;
            }

            // Gabungin semua item yang ketemu di halaman ini buat diproses
            const items = [...homeData.latest, ...homeData.popular];
            
            for (const item of items) {
                const dPath = `detail/${item.slug}`;
                const { data: cached } = await supabase.from('api_cache').select('timestamp').eq('path', dPath).single();
                const isStale = cached && (Date.now() - cached.timestamp > 1000 * 60 * 60 * 24);

                if (!cached || isStale) {
                    // Pakai Jantung Scraper buat ambil detail
                                        const detail = await scraper.scrapeDetail(item.slug);
                                        if (detail && detail.episodes_list.length > 0) {
                                            await supabase.from('api_cache').upsert({ path: dPath, data: detail, timestamp: Date.now() });
                                            console.log(`\n   ${isStale ? C.yellow+'[UPD]'+C.reset : C.green+'[NEW]'+C.reset} ${item.slug.padEnd(35)} ${C.cyan}(${detail.episodes_list.length} Eps)${C.reset}`);
                                        }
                                    } else {
                                        process.stdout.write(C.gray + '.' + C.reset); // TITIK BUAT SKIP
                                    }
                                }

            // Update cache Home khusus kalau kita di page 1
            if (state.page === 1 && state.mode === 'home') {
                await supabase.from('api_cache').upsert({ path: 'home', data: homeData, timestamp: Date.now() });
            }

            state.page++;
            saveState();
            await new Promise(r => setTimeout(r, 1000));

        } catch (e) {
            console.error(`${C.red}❌ Error: ${e.message}${C.reset}`);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

start();
