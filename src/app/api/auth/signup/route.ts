import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/auth/signup
 * Supabase Admin API로 가입 처리 → email_confirm: true 설정으로 이메일 확인 없이 즉시 로그인 가능
 */
export async function POST(req: NextRequest) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // SERVICE_ROLE_KEY가 없으면 클라이언트 SDK fallback 안내
    if (!serviceRoleKey || !supabaseUrl) {
        return NextResponse.json(
            { success: false, code: 'NO_ADMIN_KEY', message: 'SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.' },
            { status: 501 }
        );
    }

    try {
        const { email, password, name, nickname, role } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: '이메일과 비밀번호는 필수입니다.' },
                { status: 400 }
            );
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        // Admin API로 가입: email_confirm: true → 이메일 확인 없이 즉시 로그인 가능
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: name,
                nickname: nickname || '',
                role: role || 'individual',
            },
        });

        if (error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, userId: data.user?.id });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '서버 오류';
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}
