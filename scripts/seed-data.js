import pg from 'pg';

const dbConnectionString = 'postgresql://postgres.spuwbbpzwsfkwhinueuq:ahmaddavidfajri@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

const client = new pg.Client({
  connectionString: dbConnectionString,
  ssl: { rejectUnauthorized: false }
});

const wibuNames = [
  'Kultivator Garis Keras', 'Wibu Sejati', 'Pencari Qi', 'Sobat PingHua', 'Sang Kaisar Abadi', 
  'Murid Sekte Dalam', 'Penikmat Donghua 3D', 'Raja Reinkarnasi', 'Xianxia Lover', 'Pendekar Mabuk', 
  'Anonim Kece', 'David Fans', 'Luo Feng Simp', 'Xiao Yan Brother', 'Suhu Kultivasi',
  'Penunggu Episode Baru', 'Kuli Donghua', 'Maratoner Garis Keras', 'Pemuja MC Dingin', 'Dewa Spoiler',
  'Istri Simp Luo Feng', 'Anak Senja Kultivasi', 'Bocah Afk Nonton', 'Mbah Donghua', 'Sekte PingHua Member'
];

const wibuComments = [
  'Anjay, MC-nya makin OP aja! Gak ada obat.', 'Min, kapan eps selanjutnya keluar? Gak sabar nih!',
  'Gila visualnya makin kesini makin mantap cuy.', 'Server di sini emang paling kenceng, gak nge-lag sama sekali. Approved!',
  'Nabung eps dulu lah biar puas maratonnya wkwk.', 'Baru nemu web donghua sebersih ini, gak ada iklan sampah. Respect min!',
  'Luo Feng emang paling gg, lawan semuanya!', 'Teori gw bener kan, si X itu sebenernya mata-mata.',
  'Mantap min, sub indonya rapi banget, gak kayak web sebelah.', 'Ada yang tau judul lagu endingnya? Enak bgt parah.',
  'Gak rugi nunggu seminggu kalo eps-nya kayak gini 🔥', 'Wibu wajib bookmark web ini sih, kenceng parah.',
  'Semangat min update-nya! Sehat selalu buat admin.', 'Anjir lah, kaget gw pas bagian itu muncul wkwkwk.',
  'Kultivasi gw terganggu gara-gara eps ini terlalu seru 😂', 'Streaming tersmooth yang pernah gw coba, asli!',
  'Makin seru aja ceritanya, gak sabar minggu depan.', 'Jangan lupa like sama share biar mimin semangat!',
  'Liat visualnya aja udah berasa premium banget ini web.', 'BTTH emang gak pernah mengecewakan sih.',
  'Soul Land 2 makin menggila, mantap min subnya!', 'Gila ini web cepet bgt updatenya, mantap!',
  'Gak butuh web lain kalo udah ada PingHua. Top!', 'Sekte PingHua emang beda, bersih dan cepet.',
  'Ada yang tau info novelnya? Penasaran bgt sama kelanjutannya.'
];

async function seedData() {
  try {
    await client.connect();
    console.log('🔗 Connected to the Great Sect Database...');

    // Kita ambil dari 5 halaman (Sekitar 100 series)
    for (let page = 1; page <= 5; page++) {
      console.log(`
📡 Crawling Page ${page}...`);
      const response = await fetch(`https://www.sankavollerei.com/anime/donghua/home/${page}`);
      const data = await response.json();
      const latestRelease = data.latest_release || [];

      if (latestRelease.length === 0) continue;

      for (const item of latestRelease) {
        const slug = item.slug.replace(/^\/|\/$/g, '');
        
        // A. Seed Video Votes (Likes 500 - 3200 biar lebih gokil)
        const likes = Math.floor(Math.random() * (3200 - 500 + 1)) + 500;
        const dislikes = Math.floor(Math.random() * (30 - 2 + 1)) + 2;

        await client.query(`
          INSERT INTO public.video_votes (slug, likes, dislikes)
          VALUES ($1, $2, $3)
          ON CONFLICT (slug) DO UPDATE SET likes = $2, dislikes = $3
        `, [slug, likes, dislikes]);

        // B. Seed Comments (3-7 komen per series biar rame bgt)
        const numComments = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < numComments; i++) {
          const name = wibuNames[Math.floor(Math.random() * wibuNames.length)];
          const content = wibuComments[Math.floor(Math.random() * wibuComments.length)];
          
          await client.query(`
            INSERT INTO public.comments (name, content, episode_slug)
            VALUES ($1, $2, $3)
          `, [name, content, slug]);
        }

        process.stdout.write('.'); // Indikator progress
      }
    }

    console.log('\n\n🌊 TSUNAMI DATA SELESAI! 🌊');
    console.log('Web lu sekarang udah kayak pusat keramaian wibu se-Indonesia!');

  } catch (err) {
    console.error('❌ Error pas lagi "nandurin" data:', err.message);
  } finally {
    await client.end();
  }
}

seedData();