const axios = require('axios');
const URL = "https://animexin.dev/genres/";
const HEADERS = { 'User-Agent': 'Mozilla/5.0' };

async function dump() {
    try {
        const { data } = await axios.get(URL, { headers: HEADERS });
        console.log(data.substring(data.indexOf('<ul class="genre"'), data.indexOf('<ul class="genre"') + 1000));
    } catch(e) {}
}
dump();
