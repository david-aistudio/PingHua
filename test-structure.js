const scraper = require('./src/lib/animexin-scraper');

async function test() {
    console.log("🕵️‍♂️ Testing Scraper Home...");
    const data = await scraper.scrapeHome(1);
    if (!data) {
        console.log("❌ Result is NULL");
    } else {
        console.log("✅ Result Data Keys:", Object.keys(data));
        console.log(`- Popular: ${data.popular.length}`);
        console.log(`- Latest: ${data.latest.length}`);
        if (data.latest.length > 0) {
            console.log("Sample First Item:", data.latest[0]);
        }
    }
}

test();