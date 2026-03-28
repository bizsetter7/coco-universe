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
        const { email, password, name, nickname, role, phone, birthdate, gender } = await req.json();

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
                phone: phone || '',
                birthdate: birthdate || '',
                gender: gender || '',
            },
        });

        if (error) {
            // 이미 등록된 이메일(아이디) 중복 처리 → 한국어 메시지 반환
            const isAlreadyRegistered =
                error.message?.toLowerCase().includes('already registered') ||
                error.message?.toLowerCase().includes('already exists') ||
                error.message?.toLowerCase().includes('duplicate');
            return NextResponse.json(
                {
                    success: false,
                    code: isAlreadyRegistered ? 'ALREADY_REGISTERED' : 'SIGNUP_ERROR',
                    message: isAlreadyRegistered
                        ? '이미 사용 중인 아이디입니다. 다른 아이디를 선택해주세요.'
                        : error.message,
                },
                { status: isAlreadyRegistered ? 409 : 400 }
            );
        }

        // [이중보장] email_confirm: true가 키 권한 문제로 미적용될 경우를 대비해
        // updateUserById로 한 번 더 이메일 확인 처리
        if (data.user?.id && !data.user?.email_confirmed_at) {
            try {
                await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
                    email_confirm: true,
                });

            } catch (updateErr) {
                console.warn('[signup] updateUserById 실패 (무시):', updateErr);
            }
        }

        // profiles 테이블에 직접 upsert (트리거 보완 — phone/birthdate/gender 포함)
        // null 처리: 빈 문자열 대신 null 사용 (DATE 타입 컬럼에 '' 삽입 시 오류 방지)
        if (data.user?.id) {
            try {
                const { error: upsertError } = await supabaseAdmin.from('profiles').upsert({
                    id: data.user.id,
                    username: email.split('@')[0],   // 로그인 아이디 저장 (중복확인용)
                    full_name: name || '',
                    nickname: nickname || name || '',
                    role: role || 'individual',
                    phone: phone || null,
                    birth_date: birthdate || null,
                    gender: gender || null,
                    points: 100,  // 가입 보너스 100P
                }, { onConflict: 'id' });
                if (upsertError) {
                    console.error('[signup] profiles upsert 실패:', upsertError.message);
                }
            } catch (profileErr) {
                console.warn('[signup] profiles upsert 예외:', profileErr);
            }

            // 가입 보너스 100P 포인트 로그 기록
            try {
                await supabaseAdmin.from('point_logs').insert({
                    user_id: data.user.id,
                    amount: 100,
                    reason: 'JOIN',
                    note: '[COCO] 회원가입 축하 보너스',
                });
            } catch (logErr) {
                console.warn('[signup] point_logs insert 예외 (무시):', logErr);
            }
        }

        return NextResponse.json({ success: true, userId: data.user?.id });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '서버 오류';
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}
