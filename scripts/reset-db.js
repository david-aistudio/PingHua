const { Client } = require('pg');

const CONNECTION_STRING = "postgresql://postgres.poabpotcwqzsfzdmkezt:ahmaddavidfajri@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function reset() {
    console.log("💣 PERSIAPAN RESET DATABASE (WIPE ALL DATA)...");
    
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("🔌 Terhubung ke Supabase.");

        // Hapus Tabel
        console.log("🔥 Menghapus tabel lama...");
        await client.query(`DROP TABLE IF EXISTS api_cache;`);
        await client.query(`DROP TABLE IF EXISTS comments;`);
        await client.query(`DROP TABLE IF EXISTS video_votes;`);
        
        // Buat Ulang Tabel
        console.log("🏗️ Membangun ulang tabel (Fresh)...");
        const schema = `
            create table api_cache (
                path text primary key,
                data jsonb,
                timestamp bigint
            );
            create table comments (
                id uuid default gen_random_uuid() primary key,
                episode_slug text not null,
                name text not null,
                content text not null,
                likes int default 0,
                parent_id uuid,
                created_at timestamptz default now()
            );
            create table video_votes (
                slug text primary key,
                likes int default 0,
                dislikes int default 0
            );
        `;
        await client.query(schema);
        
        console.log("✅ DATABASE BERSIH & SIAP DIISI!");

    } catch (e) {
        console.error("❌ Error:", e.message);
    } finally {
        await client.end();
    }
}

reset();
