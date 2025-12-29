import { MongoClient } from 'mongodb';
import axios from 'axios';

const MONGODB_URI = "mongodb+srv://david:david2009@cluster0.6nydub7.mongodb.net/?appName=Cluster0";
const SANKA_BASE_URL = 'https://www.sankavollerei.com';

const client = new MongoClient(MONGODB_URI);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function warmup() {
  try {
    await client.connect();
    console.log('🏛️ Connected to MongoDB Jakarta...');
    const db = client.db('pinghua');
    const collection = db.collection('api_cache');

    const config = [
      { section: 'ongoing', key: 'ongoing_donghua' },
      { section: 'completed', key: 'completed_donghua' }
    ];
    
    for (const conf of config) {
      console.log(`
📂 SEKSI: ${conf.section.toUpperCase()}`);
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        console.log(`
📄 Crawling ${conf.section} - Halaman ${page}...`);
        const listUrl = `${SANKA_BASE_URL}/anime/donghua/${conf.section}/${page}`;
        
        try {
          const res = await axios.get(listUrl);
          const seriesList = res.data[conf.key] || [];

          if (seriesList.length === 0) {
            hasMore = false;
            console.log(`✅ Selesai di ${conf.section}.`);
            break;
          }

          for (const item of seriesList) {
            const seriesSlug = item.slug.replace(/^\/|\/$/g, '');
            const detailPath = `anime/donghua/detail/${seriesSlug}`;

            console.log(`
🔍 Memproses: ${item.title}`);

            try {
              const detailRes = await axios.get(`${SANKA_BASE_URL}/${detailPath}`);
              await collection.updateOne(
                { path: detailPath },
                { $set: { data: detailRes.data, timestamp: Date.now() } },
                { upsert: true }
              );
              await delay(1200);

              const episodes = detailRes.data.episodes_list || [];
              console.log(`   - Menyimpan ${episodes.length} episode...`);
              
              for (const ep of episodes) {
                const epSlug = ep.slug.replace(/^\/|\/$/g, '');
                const epPath = `anime/donghua/episode/${epSlug}`;

                const existing = await collection.findOne({ path: epPath });
                if (!existing) {
                  try {
                    const epRes = await axios.get(`${SANKA_BASE_URL}/${epPath}`);
                    await collection.updateOne(
                      { path: epPath },
                      { $set: { data: epRes.data, timestamp: Date.now() } },
                      { upsert: true }
                    );
                    process.stdout.write(`.`);
                    await delay(1000);
                  } catch (e) {
                    process.stdout.write(`x`);
                  }
                } else {
                  process.stdout.write(`o`);
                }
              }
            } catch (err) {
              console.log(`   ⚠️ Gagal ambil detail series: ${seriesSlug}`);
            }
          }
          page++;
          if (page > 100) break;
        } catch (err) {
          console.error(`
❌ Error hal ${page}:`, err.message);
          hasMore = false;
        }
      }
    }
    console.log('\n\n✨ PEMBANGUNAN GUDANG SELESAI! ✨');
  } catch (err) {
    console.error('❌ Fatal:', err);
  } finally {
    await client.close();
  }
}

warmup();