const axios = require('axios');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function check() {
    console.log("Checking Genres...");
    try {
        const genreRes = await axios.get('https://www.sankavollerei.com/anime/donghua/genres', { headers: HEADERS });
        console.log("Genre Data Type:", Array.isArray(genreRes.data) ? "Array" : typeof genreRes.data);
        if (!Array.isArray(genreRes.data)) {
            console.log("Genre Keys:", Object.keys(genreRes.data));
        }
    } catch (e) { console.error("Genre Error:", e.message); }

    console.log("\nChecking Search...");
    try {
        const searchRes = await axios.get('https://www.sankavollerei.com/anime/donghua/search/soul%20land/1', { headers: HEADERS });
        console.log("Search Data Type:", Array.isArray(searchRes.data) ? "Array" : typeof searchRes.data);
        if (!Array.isArray(searchRes.data)) {
            console.log("Search Keys:", Object.keys(searchRes.data));
            if (searchRes.data.data) console.log("Has 'data' key with length:", searchRes.data.data.length);
            if (searchRes.data.search_results) console.log("Has 'search_results' key with length:", searchRes.data.search_results.length);
        }
    } catch (e) { console.error("Search Error:", e.message); }
}

check();
