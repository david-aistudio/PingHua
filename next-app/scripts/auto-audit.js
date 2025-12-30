const axios = require('axios');

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };
const TARGET_KEYWORD = "Martial Master"; // Kasus paling susah

async function audit() {
    console.log(`🕵️‍♂️ AUTO AUDIT START: Target "${TARGET_KEYWORD}"
`);

    // 1. SEARCH PHASE
    console.log(`[1] SEARCHING...`);
    const searchUrl = `https://www.sankavollerei.com/anime/donghua/search/${encodeURIComponent(TARGET_KEYWORD)}/1`;
    try {
        const sRes = await axios.get(searchUrl, { headers: HEADERS });
        const results = sRes.data.data || [];
        console.log(`✅ Found ${results.length} results.`);
        
        if (results.length === 0) return;

        // Ambil hasil pertama
        const target = results[0];
        const slug = target.slug ? target.slug.replace(/^\/|\/$/g, '') : target.href.replace('/donghua/detail/', '').replace(/^\/|\/$/g, '');
        console.log(`👉 Target Series: ${target.title} (Slug: ${slug})
`);

        // 2. DETAIL PHASE
        console.log(`[2] INSPECTING DETAIL...`);
        const dRes = await axios.get(`https://www.sankavollerei.com/anime/donghua/detail/${slug}`, { headers: HEADERS });
        const detail = dRes.data;
        
        const total = parseInt(detail.episodes_count);
        const listCount = detail.episodes_list.length;
        console.log(`📊 Stats: Total ${total} | List ${listCount} | Missing: ${total - listCount}`);

        if (detail.episodes_list.length > 0) {
            // 3. PATTERN ANALYSIS
            console.log(`
[3] PATTERN RECOGNITION...`);
            // Ambil sampel slug
            const sample1 = detail.episodes_list[0].slug; // Paling baru
            const sample2 = detail.episodes_list[detail.episodes_list.length - 1].slug; // Paling lama di list
            
            console.log(`Sample 1 (New): ${sample1}`);
            console.log(`Sample 2 (Old): ${sample2}`);

            // Coba ekstrak pola
            // Asumsi: martial-master-episode-123-sub-indo
            const epNum1 = parseInt(detail.episodes_list[0].episode.replace(/\D/g, ''));
            const epNum2 = parseInt(detail.episodes_list[detail.episodes_list.length - 1].episode.replace(/\D/g, ''));
            
            console.log(`Detected Numbers: ${epNum1} & ${epNum2}`);

            // Generate Pola
            const pattern = sample1.replace(String(epNum1), '{NO}');
            console.log(`🔓 UNLOCKED PATTERN: ${pattern}`);

            // 4. PROOF OF CONCEPT (Tes Tembak)
            if (epNum2 > 1) {
                const targetTest = epNum2 - 1; // Coba ambil 1 episode sebelum yang terakhir ada
                const testSlug = pattern.replace('{NO}', targetTest);
                console.log(`
[4] TEST SHOOTING (Eps ${targetTest})...
`);
                console.log(`🔫 Target: ${testSlug}`);
                
                try {
                    const tRes = await axios.get(`https://www.sankavollerei.com/anime/donghua/episode/${testSlug}`, { headers: HEADERS });
                    if (tRes.data) {
                        console.log(`✅ HIT! Data Found. (Title: ${tRes.data.donghua_details?.title})`);
                        console.log(`🔥 CONCLUSION: Pattern Logic is VALID.`);
                    }
                } catch (e) {
                    console.log(`❌ MISS. (Status: ${e.response?.status || e.message})`);
                    console.log(`⚠️ CONCLUSION: Pattern might be slightly different (e.g. leading zero '01' or 'season' keyword).`);
                }
            }
        }

    } catch (e) {
        console.error("❌ CRITICAL ERROR:", e.message);
    }
}

audit();
