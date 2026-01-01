const axios = require('axios');

const BASE_URL = "https://animexin.dev";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
};

async function testCatSlug() {
    const slug = "sword-of-coming";
    console.log(`Searching Category by Slug: ${slug}`);
    
    try {
        const catUrl = `${BASE_URL}/wp-json/wp/v2/categories?slug=${slug}`;
        const res = await axios.get(catUrl, { headers: HEADERS });
        console.log("Result:", res.data.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
    } catch (e) {
        console.error("API Error:", e.message);
    }
}

testCatSlug();