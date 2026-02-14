const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('🚀 Starting migration of shops.json to Supabase...');

    const filePath = path.join(process.cwd(), 'src', 'lib', 'data', 'shops.json');
    if (!fs.existsSync(filePath)) {
        console.error('❌ shops.json not found at:', filePath);
        process.exit(1);
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const shops = JSON.parse(rawData);
    console.log(`📦 Loaded ${shops.length} shops from local JSON.`);

    // Map fields to match Supabase schema (snake_case)
    const mappedShops = shops.map(shop => ({
        id: shop.id,
        name: shop.name,
        region: shop.region,
        phone: shop.phone,
        kakao: shop.kakao,
        telegram: shop.telegram,
        pay: shop.pay,
        work_type: shop.workType || shop.work_type,
        url: shop.url,
        site: shop.site,
        is_premium: shop.is_premium,
        is_verified: shop.is_verified,
        is_placeholder: shop.is_placeholder,
        tier: shop.tier,
        title: shop.title,
        pay_type: shop.payType || shop.pay_type,
        ad_no: shop.adNo || shop.ad_no,
        options: shop.options,
        updated_at: shop.updatedAt || new Date().toISOString()
    }));

    // Chunk size for batched upsert
    const CHUNK_SIZE = 100;
    let successCount = 0;

    for (let i = 0; i < mappedShops.length; i += CHUNK_SIZE) {
        const chunk = mappedShops.slice(i, i + CHUNK_SIZE);
        const { error } = await supabase
            .from('shops')
            .upsert(chunk, { onConflict: 'id' });

        if (error) {
            console.error(`❌ Error migrating chunk ${i / CHUNK_SIZE + 1}:`, error.message);
        } else {
            successCount += chunk.length;
            console.log(`✅ Progress: ${successCount} / ${mappedShops.length} migrated...`);
        }
    }

    console.log('✨ Migration completed successfully!');
    console.log(`🎉 Total migrated: ${successCount} items.`);
}

migrate();
