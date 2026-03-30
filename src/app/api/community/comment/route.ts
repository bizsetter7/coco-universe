import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role key — RLS 완전 우회
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

/** POST /api/community/comment — 댓글 등록 */
export async function POST(request: NextRequest) {
    try {
        const { post_id, author_id, author, content } = await request.json();

        if (!post_id || !content?.trim()) {
            return NextResponse.json({ error: 'post_id와 content는 필수입니다.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('community_comments')
            .insert([{
                post_id,
                author_id: author_id || null,
                author: author || '익명',
                content: content.trim(),
                created_at: new Date().toISOString(),
            }])
            .select()
            .single();

        if (error) {
            console.error('[community/comment] Insert error:', error.message, error.code);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (err: any) {
        console.error('[community/comment] Unexpected error:', err.message);
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}
