import pg from 'pg';

const dbConnectionString = 'postgresql://postgres.spuwbbpzwsfkwhinueuq:ahmaddavidfajri@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

const client = new pg.Client({
  connectionString: dbConnectionString,
  ssl: { rejectUnauthorized: false }
});

const wibuNames = [
  '_ahmdvaid', 'v.shxx', 'lxrd_07', 'kyy.z', 'd.prazz', 'nayla.a', 'rzk_rmdn', 'clara.v', 'm.iqball', 'snt.sh',
  'fly.high', 'dark_shadow', 'skyy_0', 'r.fadhil', 'z.axl', 'tasy.a', 'b.stwn', 'a.ngroho', 'ctr_l', 'dim.prak',
  'el.sa', 'fsl.r', 'glng_h', 'hana.ap', 'indr.j', 'jess.v', 'kvn_s', 'x.void', 'cloud.x', 'moon.child',
  'vibe.only', 'stray.dog', 'lone_wolf', 'zen.ox', 'y.yanto'
];

const wibuComments = [
  'mc nya makin op aja sih ini parah',
  'eps depan kapan ya keluarnya? gasabar',
  'visualnya mantap bgt parah anichin emang jago',
  'server kenceng bgt, nyaman nontonnya tanpa buffer',
  'nabung eps dulu deh biar puas maraton',
  'webnya bersih bgt, enak diliatnya minimalis',
  'luo feng emang ga ada lawan, mc terbaik',
  'teori gua sih si x itu mata-mata sekte sebelah',
  'subnya rapi bgt, makasih banyak min',
  'lagu endingnya enak bgt, judulnya apa ya?',
  'nunggu seminggu terbayar sih ama eps ini gokil',
  'web favorit buat nonton donghua, bookmark!',
  'sehat selalu min, lanjut terus update nya ditunggu',
  'kaget pas bagian itu muncul wkwk ga nyangka',
  'ceritanya makin seru aja sih asli',
  'streaming paling lancar yang pernah gua coba di hp',
  'makin seru ceritanya, ditunggu minggu depan gess',
  'mimin semangat ya update-nya moga lancar',
  'premium bgt nih web visualnya berasa nonton di netflix',
  'btth emang ga pernah ngecewain grafiknya',
  'soul land 2 makin gila subnya rapi bgt',
  'cepet bgt updatenya gila baru rilis langsung ada',
  'udah ga butuh web lain kalo udah ada pinghua lengkap bgt',
  'bersih dan kenceng bgt sekte pinghua idaman',
  'info novelnya dong penasaran kelanjutannya gantung bgt',
  'eps kali ini sedih bgt sih asli',
  'pertarungannya gila bgt, koreografinya mantap',
  'tumben mc nya agak bego di eps ini wkwk',
  'akhirnya yang ditunggu-tunggu muncul juga',
  'ada yang tau nama studio yang garap ini?',
  'kualitas hd nya beneran hd bukan kaleng-kaleng',
  'makasih min udah di update cepet bgt',
  'kok gua ngerasa durasinya makin pendek ya?',
  'animasi 3d nya makin halus aja euy',
  'fix ini jadi donghua terbaik tahun ini menurut gua'
];

async function seedData() {
  try {
    await client.connect();
    console.log('🔗 Connected to Supabase Postgres...');

    // Ambil list episode terbaru buat diisi komennya
    const response = await fetch('https://www.sankavollerei.com/anime/donghua/home/1');
    const data = await response.json();
    const latestRelease = data.latest_release || [];

    if (latestRelease.length === 0) throw new Error("Gak dapet data dari Sanka.");

    console.log(`📡 Seeding comments for ${latestRelease.length} series...`);

    for (const item of latestRelease) {
      const slug = item.slug.replace(/^\/|\/$/g, '');
      
      // Seed Komentar (3-6 per series)
      const numComments = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < numComments; i++) {
          const name = wibuNames[Math.floor(Math.random() * wibuNames.length)];
          const content = wibuComments[Math.floor(Math.random() * wibuComments.length)];
          
          await client.query(
            'INSERT INTO public.comments (name, content, episode_slug)\n            VALUES ($1, $2, $3)'
          , [name, content, slug]);
      }
      process.stdout.write('.');
    }

    console.log('\n\n✅ OPERASI SEEDING ELEGAN SELESAI!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

seedData();
