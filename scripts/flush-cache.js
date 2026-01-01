const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manual Load .env.local biar gak butuh library 'dotenv'
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env.local');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envFile.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                env[key.trim()] = values.join('=').trim();
            }
        });
        return env;
    } catch (e) {
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Gak nemu credential Supabase di .env.local!");
    console.log("Pastikan file .env.local ada di root folder.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function flush() {
    console.log("🧹 Sedang membersihkan cache 'detail' DAN 'episode' yang basi...");

    // Hapus cache DETAIL
    const { error: errDetail } = await supabase
        .from('api_cache')
        .delete()
        .like('path', 'detail/%');

    // Hapus cache EPISODE (Penting biar list di player update)
    const { error: errEpisode } = await supabase
        .from('api_cache')
        .delete()
        .like('path', 'episode/%');

    if (errDetail || errEpisode) {
        console.error("❌ Gagal hapus cache:", errDetail?.message || errEpisode?.message);
    } else {
        console.log("✅ SUKSES! Cache detail & episode udah bersih kinclong.");
        console.log("👉 Sekarang coba refresh halaman player. Harusnya list di tab 'Episode' udah sinkron sama detail.");
    }
}

flush();
