const axios = require('axios');
const fs = require('fs');

const URL = "https://animexin.dev/throne-of-seal/"; 
const HEADERS = { 'User-Agent': 'Mozilla/5.0' };

async function deepAudit() {
    console.log(`🕵️‍♂️ AUDITING MISSING EPISODES: ${URL}`);
    try {
        const { data } = await axios.get(URL, { headers: HEADERS });
        
        // Cari angka "192" di HTML mentah
        const index = data.indexOf('192');
        if (index > -1) {
            console.log("✅ Found '192' in HTML!");
            console.log("Snippet around '192':");
            console.log(data.substring(index - 100, index + 100));
        } else {
            console.log("❌ '192' NOT FOUND in raw HTML. It's definitely dynamic.");
        }

        // Cari string 'episodes' atau 'list' dalam script tags
        if (data.includes('var episodes')) console.log("✅ Found 'var episodes' in script tag!");
        if (data.includes('json')) console.log("✅ Found 'json' keyword in HTML!");

    } catch (e) { console.log(e.message); }
}

deepAudit();
