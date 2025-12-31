const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION_STRING = "postgresql://postgres.poabpotcwqzsfzdmkezt:ahmaddavidfajri@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function setup() {
    console.log("🔌 Connecting to Supabase (Direct)...");
    
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false } // Supabase butuh SSL
    });

    try {
        await client.connect();
        console.log("✅ Connected!");

        const sqlPath = path.join(__dirname, '..', 'db_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("🚀 Executing SQL Schema...");
        await client.query(sql);
        
        console.log("✅ Database Setup Complete! Tables created.");

    } catch (e) {
        console.error("❌ Error:", e.message);
    } finally {
        await client.end();
    }
}

setup();
