import { useState, useEffect, useRef } from 'react';
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
    isSimulated?: boolean;
    isAdultVerified?: boolean; // [New] 성인인증 여부 (DB 연동)
    email?: string; // [New] 이메일 필드 추가
}

// Supabase Auth 연동된 실제 인증 훅
export function useAuth() {
    // State definitions with 'State' suffix for internal setters
    const [isLoggedIn, setIsLoggedInState] = useState(false);
    const [isLoading, setIsLoadingState] = useState(true);
    const [user, setUserState] = useState<UserSession>({
        type: 'guest',
        id: 'guest',
        name: '게스트',
        nickname: '게스트',
        points: 0
    });

    const isMounted = useRef(true);

    // Guarded Setters
    const setIsLoggedIn = (value: boolean) => {
        if (isMounted.current) setIsLoggedInState(value);
    };

    const setIsLoading = (value: boolean) => {
        if (isMounted.current) setIsLoadingState(value);
    };

    const setUser = (value: UserSession) => {
        if (isMounted.current) setUserState(value);
    };

    const syncUserSession = async (session: any) => {
        // [Safety] 이미 Mock 세션으로 로그인된 상태라면, Supabase 연동 정보가 명확하지 않을 때 덮어쓰지 않음
        const savedMock = typeof window !== 'undefined' ? localStorage.getItem('coco_mock_session') : null;
        let mockData = null;
        if (savedMock) {
            try { mockData = JSON.parse(savedMock); } catch (e) { }
        }

        // 1. Supabase 실제 세션이 있는 경우 (UUID 기반 실제 회원)
        if (session?.user) {
            try {
                const { user: authUser } = session;
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (profile) {
                    const userType = profile.role === 'admin' ? 'admin' :
                        (profile.role === 'corporate' ? 'corporate' : 'individual');

                    let newUser: UserSession = {
                        type: userType as UserSession['type'],
                        id: authUser.id,
                        name: profile.full_name || authUser.email?.split('@')[0] || '회원',
                        nickname: profile.nickname || profile.full_name || '닉네임',
                        points: profile.points || 0,
                        isAdultVerified: !!profile.is_adult_verified, // [New] DB 성인인증 여부 반영
                        email: authUser.email
                    };

                    // [Simulation Check] 어드민인 경우 유지된 시뮬레이션 상태 확인
                    if (newUser.type === 'admin') {
                        const simType = typeof window !== 'undefined' ? localStorage.getItem('coco_sim_mode') : null;
                        if (simType === 'corporate' || simType === 'individual') {
                            newUser = {
                                ...newUser,
                                type: simType,
                                id: `${authUser.id}_sim_${simType}`, // [Fix] 행위 주체 ID를 시뮬레이션 역할에 맞게 분리
                                isSimulated: true
                            };
                        }
                    }

                    setUser(newUser);
                    setIsLoggedIn(true);
                    setIsLoading(false);
                    return;
                }
            } catch (err) {
                console.warn('Real profile fetch failed, checking mock...', err);
            }
        }

        // 2. Mock 세션 복구 (Supabase 세션이 없거나 익명 상태일 때)
        if (mockData) {
            setUser(mockData);
            setIsLoggedIn(true);
            setIsLoading(false);

            return;
        }

        // 3. 비로그인 상태 (완전한 게스트)
        setUser({ type: 'guest', id: 'guest', name: '게스트', nickname: '게스트', points: 0 });
        setIsLoggedIn(false);
        setIsLoading(false);
    };

    useEffect(() => {
        isMounted.current = true;

        // [Critical] 마운트 즉시 Mock 세션부터 체크하여 UI 동기화 (Flicker 방지)
        const savedMock = typeof window !== 'undefined' ? localStorage.getItem('coco_mock_session') : null;
        if (savedMock) {
            try {
                const mockData = JSON.parse(savedMock);
                if (mockData && mockData.type) {
                    setUser(mockData);
                    setIsLoggedIn(true);
                    setIsLoading(false); // 로딩 즉시 종료
                }
            } catch (e) { }
        }

        // Supabase 세션 감지 시작
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) syncUserSession(session);
            else if (!savedMock) setIsLoading(false); // Mock도 없으면 로딩 종료
        }).catch((err) => {
            // [Fix] Ignore AbortError to prevent UI overlay
            if (err.name === 'AbortError' || err.message?.includes('aborted')) return;

            console.warn("Auth session check failed:", err);
            // 에러 발생 시에도 로딩은 종료해야 함
            if (!savedMock) setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
                syncUserSession(session).catch(() => { });
            }
        });

        // [New] Capture Referrer on landing
        if (typeof window !== 'undefined' && !localStorage.getItem('user_referrer')) {
            const ref = document.referrer;
            const source = ref ? (
                ref.includes('google') ? '구글 검색' :
                    ref.includes('naver') ? '네이버' :
                        ref.includes('daum') ? '다음' : '외부 유입'
            ) : '직접 유입';
            localStorage.setItem('user_referrer', source);
        }

        return () => {
            isMounted.current = false;
            subscription.unsubscribe();
        };
    }, []);

    const login = (type: 'admin' | 'shop' | 'personal', id?: string, name?: string, nickname?: string) => {
        // [Exclusive] Mock Login for Development
        const mockUser: UserSession = {
            type: type === 'shop' ? 'corporate' : (type === 'personal' ? 'individual' : 'admin'),
            id: id || `mock_${Math.random().toString(36).substr(2, 9)}`,
            name: name || (type === 'admin' ? '관리자' : '테스트회원'),
            nickname: nickname || (type === 'admin' ? '운영마스터' : '테스트닉네임'),
            points: 1000,
            email: type === 'admin' ? 'admin_user@example.com' : 'test@example.com'
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem('coco_mock_session', JSON.stringify(mockUser));
        }
        setUser(mockUser);
        setIsLoggedIn(true);
        setIsLoading(false);

    };

    const logout = async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('coco_mock_session');
            localStorage.removeItem('adult_verified');
            localStorage.removeItem('coco_sim_mode');
        }

        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.warn("SignOut failed (ignoring):", e);
        }

        setIsLoggedIn(false);
        setUser({ type: 'guest', id: 'guest', name: '게스트', nickname: '게스트', points: 0 });

        window.location.href = '/';
    };

    /**
     * [New] 실서비스용 실제 Supabase 로그인
     */
    const signIn = async (email: string, pw: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pw
        });
        if (error) throw error;
        return data;
    };

    /**
     * [New] 실서비스용 실제 Supabase 회원가입
     */
    const signUp = async (email: string, pw: string, metadata: any) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pw,
            options: {
                data: {
                    full_name: metadata.name,
                    nickname: metadata.nickname,
                    role: metadata.role || 'individual'
                }
            }
        });
        if (error) throw error;
        return data;
    };

    return {
        isLoggedIn,
        isLoading,
        user,
        login, // 이관용 Mock 유지
        signIn,
        signUp,
        logout,
        userType: user.type,
        userName: user.name,
        userNickname: user.nickname,
        userPoints: user.points,
        userReferrer: user.referrer,
        isSimulated: user.isSimulated,
        isAdultVerified: user.isAdultVerified
    };
}
