const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const TARGET_URL = "https://auratail.vip/donghua/soul-land-2/";

async function test() {
    console.log("🕵️‍♂️  STARTING STEALTH TEST ON AURATAIL...");
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false, // Kita bikin 'false' biar lo bisa liat browsernya jalan (local only)
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        console.log(`🚀 Navigating to: ${TARGET_URL}`);
        
        // Wait longer because of Cloudflare check
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log("✅ Page Loaded!");
        const title = await page.title();
        console.log(`🎬 Title: ${title}`);

        // Extract Data
        const data = await page.evaluate(() => {
            // Ambil semua iframe
            const iframes = Array.from(document.querySelectorAll('iframe')).map(f => f.src);
            
            // Ambil list episode (Theme WP Donghua biasanya pake .eplister)
            const episodes = Array.from(document.querySelectorAll('.eplister li a')).map(el => ({
                num: el.querySelector('.epl-num')?.innerText || '',
                title: el.querySelector('.epl-title')?.innerText || '',
                slug: el.getAttribute('href')
            }));

            return { iframes, episodes };
        });

        console.log("\n📦 SCRAPED DATA:");
        console.log(`- Found ${data.iframes.length} Iframes`);
        console.log(`- Found ${data.episodes.length} Episodes`);

        if (data.episodes.length > 0) {
            console.log("\nSample Episode 1:");
            console.log(data.episodes[0]);
        }

        if (data.iframes.length > 0) {
            console.log("\nIframes found:");
            data.iframes.forEach((src, i) => console.log(`[${i+1}] ${src}`));
        }

        console.log("\n🎉 TEST COMPLETE!");

    } catch (e) {
        console.error("❌ TEST FAILED:", e.message);
    } finally {
        console.log("\nMenutup browser dalam 5 detik...");
        setTimeout(async () => {
            if (browser) await browser.close();
        }, 5000);
    }
}

test();
