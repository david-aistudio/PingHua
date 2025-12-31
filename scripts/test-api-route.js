const axios = require('axios');

const API_URL = "http://localhost:3000/api/provider/auratail";

async function test() {
    console.log("🧪 TESTING API ROUTE AURATAIL...\n");

    try {
        // 1. TEST SEARCH
        console.log("[1] Testing Search 'Soul Land'...");
        const searchRes = await axios.post(API_URL, {
            action: 'search',
            query: 'soul land'
        });
        
        console.log(`   Status: ${searchRes.status}`);
        console.log("   RAW RESPONSE:", JSON.stringify(searchRes.data, null, 2)); // Debug
        const results = searchRes.data.data;
        console.log(`   Found: ${results?.length} items`);
        
        if (results.length > 0) {
            console.log(`   Sample: ${results[0].title} -> ${results[0].url}`);
            
            // 2. TEST DETAIL (Ambil dari hasil search pertama)
            const targetSlug = results[0].url.replace('/detail/', ''); // Slug: soul-land-2
            const targetUrl = `https://auratail.vip/donghua/${targetSlug}/`; 
            
            console.log(`\n[2] Testing Detail '${targetSlug}'...`);
            const detailRes = await axios.post(API_URL, {
                action: 'detail',
                url: targetUrl
            });

            const detail = detailRes.data.data;
            if (detail) {
                console.log(`   Title: ${detail.title}`);
                console.log(`   Episodes: ${detail.episodes_list.length}`);
                console.log(`   First Ep: ${detail.episodes_list[0]?.episode}`);
                console.log("✅ API ROUTE WORKS PERFECTLY!");
            } else {
                console.log("❌ Detail Failed (Empty Data)");
            }
        }

    } catch (e) {
        console.error("❌ ERROR:", e.response?.data || e.message);
    }
}

test();
