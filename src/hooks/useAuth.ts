import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Unified user session type
export interface UserSession {
    type: 'corporate' | 'individual' | 'admin' | 'guest';
    id: string;
    name: string;
    nickname: string;
    points: number;
    referrer?: string;
    shopId?: string;
}

// Supabase Auth 연동된 실제 인증 훅
export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserSession>({
        type: 'guest',
        id: 'guest',
        name: '게스트',
        nickname: '게스트',
        points: 0
    });

    const syncUserSession = async (session: any) => {
        if (!session?.user) {
            setUser({ type: 'guest', id: 'guest', name: '게스트', nickname: '게스트', points: 0 });
            setIsLoggedIn(false);
            setIsLoading(false);
            return;
        }

        const { user: authUser } = session;

        // profiles 테이블에서 추가 정보(닉네임, 역할 등) 가져오기
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

        const userType = profile?.role === 'admin' ? 'admin' :
            (profile?.role === 'corporate' ? 'corporate' : 'individual');

        const newUser: UserSession = {
            type: userType as UserSession['type'],
            id: authUser.id,
            name: profile?.full_name || authUser.email?.split('@')[0] || '회원',
            nickname: profile?.nickname || profile?.full_name || '닉네임',
            points: profile?.points || 0,
            referrer: profile?.referrer,
            shopId: profile?.shop_id
        };

        setUser(newUser);
        setIsLoggedIn(true);
        setIsLoading(false);
    };

    useEffect(() => {
        // 1. 초기 세션 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
            syncUserSession(session);
        });

        // 2. 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            syncUserSession(session);
        });

        // [New] Capture Referrer on landing
        if (!localStorage.getItem('user_referrer') && typeof document !== 'undefined') {
            const ref = document.referrer;
            if (ref) {
                const source = ref.includes('google') ? '구글 검색' :
                    ref.includes('naver') ? '네이버' :
                        ref.includes('daum') ? '다음' : '외부 유입';
                localStorage.setItem('user_referrer', source);
            } else {
                localStorage.setItem('user_referrer', '직접 유입');
            }
        }

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, id?: string) => {
        // 이 함수는 이전 Mock 호환성을 위해 남겨두거나, 
        // 실제 로그인 페이지에서는 supabase.auth.signInWithPassword를 직접 사용합니다.
        console.log('Centralized login called for:', email);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('adult_verified');
    };

    return {
        isLoggedIn,
        isLoading,
        user,
        login,
        logout,
        userType: user.type,
        userName: user.name,
        userNickname: user.nickname,
        userPoints: user.points,
        userReferrer: user.referrer
    };
}
