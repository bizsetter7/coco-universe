require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectLatestPostAndResume() {
    console.log("🔍 방금 작성하신 'dddd...' 커뮤니티 글 해부 결과:");
    const { data: postData } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (postData && postData.length > 0) {
        console.log(`▶ 제목: ${postData[0].title}`);
        console.log(`▶ 닉네임: ${postData[0].author_nickname}`);
        console.log(`▶ author_id (핵심):`, postData[0].author_id, `(타입: ${typeof postData[0].author_id})`);
    }

    console.log("\n🔍 방금 작성하신 '23살입니당' 이력서 해부 결과:");
    const { data: resumeData } = await supabase
        .from('resumes') // (테이블명 예상, 다를 수 있음 주의)
        .select('id, user_id, title')
        .eq('title', '23살입니당')
        .limit(1);
        
    if (resumeData && resumeData.length > 0) {
        console.log(`▶ 이력서 제목: ${resumeData[0].title}`);
        console.log(`▶ user_id (핵심):`, resumeData[0].user_id);
        console.log(`💡 인재정보 페이지에 뜨려면 이 이력서의 노출상태(status)나 user_id가 정상이어야 합니다.`);
    } else {
        // 혹시 resumes 테이블이 아니거나 조회 안된 경우 전체 내역
        const { data: allResumes } = await supabase.from('resumes').select('id, user_id, title').order('created_at', { ascending: false }).limit(2);
        console.log("최신 이력서 디버그:", allResumes);
    }
}

inspectLatestPostAndResume();
