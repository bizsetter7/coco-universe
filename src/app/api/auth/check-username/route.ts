import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/auth/check-username?id=bizsetter
 * 아이디 중복확인 API
 * - Supabase email 포맷: ${id}@cocoalba.kr
 * - SUPABASE_SERVICE_ROLE_KEY 있으면 실제 DB 조회, 없으면 users.json 폴백
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim();

    if (!id) {
        return NextResponse.json({ available: false, message: '아이디를 입력해주세요.' }, { status: 400 });
    }
    if (id.length < 4 || id.length > 20) {
        return NextResponse.json({ available: false, message: '아이디는 4~20자여야 합니다.' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9]+$/.test(id)) {
        return NextResponse.json({ available: false, message: '아이디는 영문/숫자만 사용 가능합니다.' }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Service Role Key 있으면 → Supabase admin 조회
    if (serviceKey && supabaseUrl) {
        try {
            const adminClient = createClient(supabaseUrl, serviceKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            });
            const email = `${id}@cocoalba.kr`;

            // perPage: 1000으로 충분한 범위 조회 (기본값 50이면 누락 가능)
            const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
            if (error) throw error;
            const exists = data.users.some((u) => u.email === email);
            if (exists) {
                return NextResponse.json({ available: false, message: '이미 사용 중인 아이디입니다.' });
            }
            return NextResponse.json({ available: true, message: '사용 가능한 아이디입니다.' });
        } catch (err: any) {
            console.error('[check-username] Supabase Admin API 오류 (listUsers 실패):', err.message);
            // Admin API 실패 시 profiles 테이블로 fallback 조회
            try {
                const fallbackClient = createClient(supabaseUrl, serviceKey, {
                    auth: { autoRefreshToken: false, persistSession: false }
                });
                const email = `${id}@cocoalba.kr`;
                // profiles 테이블의 id(UUID)는 모르지만 auth.users를 통해 email 기반으로 확인
                // RPC 또는 직접 쿼리 불가 시, 아이디 중복확인 실패 응답 반환 (가입 시 Supabase가 최종 검증)
                return NextResponse.json({
                    available: false,
                    message: '아이디 중복확인을 현재 처리할 수 없습니다. 잠시 후 다시 시도해주세요.',
                    code: 'CHECK_FAILED'
                }, { status: 503 });
            } catch {
                return NextResponse.json({
                    available: false,
                    message: '아이디 중복확인을 현재 처리할 수 없습니다. 잠시 후 다시 시도해주세요.',
                    code: 'CHECK_FAILED'
                }, { status: 503 });
            }
        }
    }

    // 폴백 → users.json 체크
    try {
        const dataPath = path.join(process.cwd(), 'src', 'data', 'users.json');
        if (fs.existsSync(dataPath)) {
            const users = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
            const exists = Array.isArray(users) && users.some((u: any) => u.id === id);
            if (exists) {
                return NextResponse.json({ available: false, message: '이미 사용 중인 아이디입니다.' });
            }
        }
    } catch { /* ignore */ }

    // 최종 폴백 → 사용 가능 (signUp 시 Supabase가 이메일 중복 최종 검증)
    return NextResponse.json({ available: true, message: '사용 가능한 아이디입니다.' });
}
