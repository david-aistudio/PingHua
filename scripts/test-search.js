import axios from 'axios';

async function test() {
    console.log('🧪 DIAGNOSA SEARCH PINGHUA...');
    const domain = 'https://pinghua.qzz.io';
    const keyword = 'Soul Land';
    const url = `${domain}/api/proxy?path=anime/donghua/search/${encodeURIComponent(keyword)}/1`;

    console.log(`🔗 Testing URL: ${url}`);

    try {
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });

        console.log('\n✅ RESPONSE STATUS:', res.status);
        console.log('📦 DATA KEYS:', Object.keys(res.data));
        
        if (res.data.data) {
            console.log(`🎉 FOUND ${res.data.data.length} ITEMS!`);
            console.log('Sample Title:', res.data.data[0].title);
        } else {
            console.log('❌ DATA IS EMPTY OR WRONG KEY!');
            console.log('Full Response Body:', JSON.stringify(res.data).substring(0, 200));
        }

    } catch (err) {
        console.error('\n❌ FATAL ERROR:', err.message);
        if (err.response) console.log('Status:', err.response.status);
    }
}

test();
