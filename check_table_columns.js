require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableSchema() {
    console.log("🔍 community_posts 테이블 컬럼 검사 중...");
    
    // 테이블의 첫 1개 데이터를 가져와서 실제 들어가 있는 컬럼 키값을 확인합니다.
    const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .limit(1);

    if (error) {
        console.error("오류 발생:", error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log("✅ community_posts 테이블의 실제 컬럼 목록:");
        console.log(Object.keys(data[0]).join(', '));
    } else {
        console.log("데이터가 없습니다.");
    }
}

checkTableSchema();
