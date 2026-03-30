require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findKnockdsPosts() {
    console.log('🔍 "나나나나난" 님이 작성한 모든 글 추적 중...');

    // 1. nickname 기반으로 먼저 찾기 (db의 author, author_name, author_nickname)
    const { data: byName, error: nameErr } = await supabase
        .from('community_posts')
        .select('id, title, author, author_id, created_at')
        .or('author.eq.나나나나난,author_name.eq.나나나나난,author_nickname.eq.나나나나난')
        .order('created_at', { ascending: false });

    if (nameErr) console.error(nameErr);

    console.log('\n[결과 1] 닉네임(나나나나난)으로 검색된 전체 글:');
    if (byName && byName.length > 0) {
         console.table(byName);
    } else {
         console.log('  ❌ 닉네임으로 작성된 글이 단 한 건도 없습니다! (DB에 아예 안 들어감)');
    }

    // 2. 혹시 몰라서 전체 테이블 중 최근 15개 싹다 긁어오기 (다른 이름으로 들어갔는지 방어적 체크)
    const { data: latest, error: latErr } = await supabase
        .from('community_posts')
        .select('id, title, author, author_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
        
    console.log('\n[참고] 현재 DB에 가장 마지막으로 들어온 최신 글 10개 (실제 시간 확인용):');
    console.table(latest);
}

findKnockdsPosts();
