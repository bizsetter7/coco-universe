import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role key — RLS 완전 우회
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
    try {
        const { action, resumeData, resumeId } = await request.json();

        if (!resumeData?.user_id) {
            return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
        }

        if (action === 'update' && resumeId) {
            // 수정: ID, created_at, updated_at 제거 후 업데이트 (resumes 테이블엔 updated_at 없음)
            const { id: _, created_at: __, updated_at: ___, ...updateFields } = resumeData as any;
            const { error } = await supabaseAdmin
                .from('resumes')
                .update(updateFields)
                .eq('id', resumeId);

            if (error) {
                console.error('[resume-save] Update error:', error.message, error.code);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true });

        } else {
            // 신규 등록: mock ID 제거 후 insert
            const { id: _, ...insertFields } = resumeData;
            const { data, error } = await supabaseAdmin
                .from('resumes')
                .insert([insertFields])
                .select()
                .single();

            if (error) {
                console.error('[resume-save] Insert error:', error.message, error.code);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true, data });
        }

    } catch (err: any) {
        console.error('[resume-save] Unexpected error:', err.message);
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}
