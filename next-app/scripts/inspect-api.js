const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

const ask = (q) => new Promise(r => rl.question(q, r));

async function inspect() {
    console.clear();
    console.log("🕵️‍♂️  SANKA API INSPECTOR TOOL  🕵️‍♂️");
    console.log("-------------------------------------");
    console.log("1. Inspect DETAIL Series (List Eps)");
    console.log("2. Inspect SEARCH Result (Raw Data)");
    console.log("3. Inspect GENRE List");
    
    const choice = await ask("\nPilih Mode (1/2/3): ");
    let url = '';

    if (choice === '1') {
        const slug = await ask("Masukkan Slug Series (cth: martial-master): ");
        url = `https://www.sankavollerei.com/anime/donghua/detail/${slug}`;
    } else if (choice === '2') {
        const kw = await ask("Masukkan Keyword (cth: soul land): ");
        url = `https://www.sankavollerei.com/anime/donghua/search/${encodeURIComponent(kw)}/1`;
    } else if (choice === '3') {
        url = `https://www.sankavollerei.com/anime/donghua/genres`;
    } else {
        console.log("Salah pilih bos."); process.exit();
    }

    console.log(`\n🚀 Fetching: ${url}...`);
    
    try {
        const res = await axios.get(url, { headers: HEADERS });
        const data = res.data;

        console.log("\n✅ STATUS: SUCCESS");
        console.log("🔑 TOP LEVEL KEYS:", Object.keys(data));

        if (choice === '1') {
            console.log(`\n🎬 JUDUL: ${data.title}`);
            console.log(`🔢 COUNT: ${data.episodes_count}`);
            if (data.episodes_list) {
                console.log(`📋 LIST LENGTH: ${data.episodes_list.length}`);
                if (data.episodes_list.length > 0) {
                    console.log("\n--- CONTOH EPISODE TERATAS ---");
                    console.log(data.episodes_list[0]);
                    console.log("\n--- CONTOH EPISODE TERBAWAH ---");
                    console.log(data.episodes_list[data.episodes_list.length - 1]);
                    
                    // Pattern Analysis
                    const sample = data.episodes_list[0].slug;
                    console.log(`\n🧠 PATTERN ANALYSIS:`);
                    console.log(`Sample Slug: ${sample}`);
                    console.log(`Possible Pattern: ${sample.replace(/\d+/g, '{NO}')}`);
                }
            }
        } else if (choice === '2') {
            const list = data.data || [];
            console.log(`\n🔍 FOUND: ${list.length} items`);
            if (list.length > 0) {
                console.log("--- SAMPLE ITEM 1 ---");
                console.log(list[0]);
            }
        } else {
            console.log(data);
        }

    } catch (e) {
        console.error("❌ ERROR:", e.message);
        if (e.response) console.log("Response Status:", e.response.status);
    }
    
    rl.close();
}

inspect();
