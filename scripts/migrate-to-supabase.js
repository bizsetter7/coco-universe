const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Supabase environment variables are missing in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateShops() {
    console.log('--- Migrating Shops ---');
    const shopsPath = path.join(__dirname, '../src/lib/data/shops.json');
    const shopsData = JSON.parse(fs.readFileSync(shopsPath, 'utf8'));

    console.log(`Found ${shopsData.length} shops. Starting upload...`);

    // Transform data to match schema if necessary
    const transformedShops = shopsData.map(shop => ({
        id: shop.id,
        name: shop.name,
        region: shop.region,
        phone: shop.phone,
        kakao: shop.kakao,
        telegram: shop.telegram || null,
        pay: shop.pay,
        work_type: shop.workType,
        url: shop.url,
        site: shop.site,
        is_premium: shop.is_premium || false,
        is_verified: shop.is_verified || false,
        is_placeholder: shop.is_placeholder || false,
        tier: shop.tier,
        title: shop.title || null,
        pay_type: shop.payType || null,
        ad_no: shop.adNo || null,
        options: shop.options || {},
        updated_at: shop.updatedAt || new Date().toISOString()
    }));

    // Chunking to avoid payload size limits
    const chunkSize = 100;
    for (let i = 0; i < transformedShops.length; i += chunkSize) {
        const chunk = transformedShops.slice(i, i + chunkSize);
        const { error } = await supabase.from('shops').upsert(chunk, { onConflict: 'id' });
        if (error) {
            console.error(`Error uploading chunk ${i / chunkSize}:`, error);
        } else {
            console.log(`Uploaded chunk ${i / chunkSize + 1} (${chunk.length} records)`);
        }
    }
}

async function migratePosts() {
    console.log('--- Migrating Community Posts ---');
    // Since MOCK_POSTS is in a .ts file, we might need to hardcode a sample or read it via a temp file if needed.
    // For simplicity, let's just use the mock data indices.
    const mockPosts = [
        { category: '밤 문화 Talk', title: '언니들 오늘 손님 진상 썰 푼다...ㅠㅠ', content: '진짜 오늘 역대급이었어.. 들어보실? 술도 안 마시고 계속 말만 거는데 진짜 기빨려 죽는 줄..', author: '익명123' },
        { category: '꿀팁 & 노하우', title: '초보 언니들을 위한 면접 꿀팁 (복장/멘트)', content: '처음 시작할 때 긴장되죠? 제가 정리한 면접 필승 공략집 공유합니다.', author: '베테랑언니' },
        { category: '자유게시판', title: '오늘 날씨 너무 좋네요~ 산책 가고 싶다', content: '출근하기 전에 잠깐 공원 들렀는데 꽃이 많이 폈더라고요.', author: '봄날의꽃' }
    ];

    const { error } = await supabase.from('community_posts').insert(mockPosts);
    if (error) {
        console.error('Error migrating posts:', error);
    } else {
        console.log('Community posts migrated successfully.');
    }
}

async function main() {
    await migrateShops();
    await migratePosts();
    console.log('Migration complete! 🎉');
}

main();
