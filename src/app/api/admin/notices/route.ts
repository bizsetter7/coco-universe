import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/requireAdmin';

function getAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

/** GET — 전체 공지 목록 (어드민용, 미발행 포함) */
export async function GET(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const svc = getAdmin();
    const { data, error } = await svc
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notices: data ?? [] });
}

/** POST — 공지 신규 작성 */
export async function POST(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const body = await req.json();
    const { badge, title, content, platforms, is_pinned, is_published, expires_at } = body;

    if (!title?.trim() || !content?.trim()) {
        return NextResponse.json({ error: '제목과 내용은 필수입니다' }, { status: 400 });
    }

    const svc = getAdmin();
    const { data, error } = await svc
        .from('notices')
        .insert({
            badge: badge || '공지',
            title: title.trim(),
            content: content.trim(),
            platforms: platforms || ['cocoalba', 'waiterzone', 'sunsuzone', 'yasajang', 'bamgil'],
            is_pinned: is_pinned ?? false,
            is_published: is_published ?? true,
            published_at: new Date().toISOString(),
            expires_at: expires_at || null,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notice: data });
}

/** PATCH — 공지 수정 */
export async function PATCH(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) return NextResponse.json({ error: 'id 필수' }, { status: 400 });

    const svc = getAdmin();
    const { data, error } = await svc
        .from('notices')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notice: data });
}

/** DELETE — 공지 삭제 */
export async function DELETE(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: 'id 필수' }, { status: 400 });

    const svc = getAdmin();
    const { error } = await svc.from('notices').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
