const axios = require('axios');

const URL = "https://auratail.vip/";

async function test() {
    console.log("🚀 TESTING AXIOS VS CLOUDFLARE...\n");

    try {
        const res = await axios.get(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.google.com/',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0'
            },
            decompress: true // Handle gzip otomatis
        });

        console.log("✅ STATUS:", res.status);
        console.log("📄 CONTENT TYPE:", res.headers['content-type']);
        
        // Cek apakah dapet HTML beneran atau halaman Challenge Cloudflare
        const html = res.data;
        if (html.includes('Just a moment...') || html.includes('Enable JavaScript')) {
            console.log("❌ KENA JEBAKAN BATMAN (Cloudflare Challenge)!");
        } else {
            console.log("🎉 TEMBUS! HTML LENGTH:", html.length);
            // Cek ada judul anime gak
            if (html.includes('Soul Land') || html.includes('Donghua')) {
                console.log("😎 Valid Content Found!");
            } else {
                console.log("⚠️ HTML dapet, tapi isinya aneh.");
            }
        }

    } catch (e) {
        console.error("💀 ERROR:", e.message);
        if (e.response) {
            console.log("Status:", e.response.status);
            console.log("Data:", e.response.data.substring(0, 100));
        }
    }
}

test();
