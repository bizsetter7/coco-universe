import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/requireAdmin';

/**
 * GET /api/admin/get-auth-emails
 *
 * auth.users에서 전체 회원 이메일을 가져와 userId → email 맵 반환.
 * anon client는 auth.users 접근 불가 → service_role 전용.
 *
 * 응답: { emails: { [userId]: string } }
 *
 * 용도: P2 admin 회원 상세모달에서 OAuth 회원의 실제 이메일 표시 [M-066]
 */
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: NextRequest) {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    try {
        // Supabase auth.admin.listUsers — 최대 1000명 (perPage 상한)
        const allUsers: { id: string; email?: string }[] = [];
        let page = 1;
        while (true) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
            if (error) throw error;
            if (!data?.users?.length) break;
            allUsers.push(...data.users.map(u => ({ id: u.id, email: u.email })));
            if (data.users.length < 1000) break;
            page++;
        }

        const emails: Record<string, string> = {};
        allUsers.forEach(u => {
            if (u.id && u.email) emails[u.id] = u.email;
        });

        return NextResponse.json({ emails });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
