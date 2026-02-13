import { useState, useEffect } from 'react';

// Unified user session type
export interface UserSession {
    type: 'shop' | 'personal' | 'admin' | 'guest';
    name: string;
    points: number;
    id?: string;
    referrer?: string; // [New] Inflow Source
}

// Simple event-based auth hook for client-side demo
export function useAuth() {
    const [isLoggedIn, setIsLoggedInState] = useState(false);
    const [user, setUser] = useState<UserSession>({
        type: 'guest',
        name: '게스트',
        points: 0
    });

    const updateAuthStatus = () => {
        try {
            const sessionStr = localStorage.getItem('user_session');
            const referrer = localStorage.getItem('user_referrer') || undefined;
            let session = null;
            if (sessionStr) {
                if (sessionStr.startsWith('{')) {
                    try {
                        session = JSON.parse(sessionStr);
                    } catch (e) {
                        console.error('Session JSON parse error:', e);
                    }
                } else if (sessionStr.startsWith('active_')) {
                    session = { type: localStorage.getItem('user_type') || 'guest', name: localStorage.getItem('user_name') || '회원' };
                }
            }

            const type = (localStorage.getItem('user_type') || session?.type || 'guest') as UserSession['type'];
            const name = session?.name || localStorage.getItem('user_name') || (type === 'guest' ? '로그인이 필요합니다' : '회원');

            const loggedIn = !!sessionStr;
            setIsLoggedInState(loggedIn);

            if (loggedIn && session) {
                setUser({
                    type: (session.type === 'admin' ? 'admin' : (session.type === 'shop' ? 'shop' : (session.type === 'personal' ? 'personal' : 'guest'))) as UserSession['type'],
                    name: name,
                    points: session.points || 50000,
                    id: session.id,
                    referrer: session.referrer || referrer
                });
            } else {
                setUser({ type: 'guest', name: '게스트', points: 0 });
                if (loggedIn) setIsLoggedInState(false);
            }
        } catch (e) {
            console.error('Auth status sync error:', e);
            setUser({ type: 'guest', name: '게스트', points: 0 });
            setIsLoggedInState(false);
        }
    };

    useEffect(() => {
        // [New] Capture Referrer on landing if not set
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

        updateAuthStatus();

        const handleAuthChange = () => {
            updateAuthStatus();
        };

        window.addEventListener('storage', handleAuthChange);
        window.addEventListener('auth-change', handleAuthChange);

        return () => {
            window.removeEventListener('storage', handleAuthChange);
            window.removeEventListener('auth-change', handleAuthChange);
        };
    }, []);

    const login = (type: 'shop' | 'personal' | 'admin') => {
        const mockSession = {
            type,
            name: type === 'admin' ? '시스템 최고 관리자' : (type === 'shop' ? '업주 관리자' : '일반 회원'),
            id: type === 'admin' ? 'admin_master' : 'mock_user',
            referrer: localStorage.getItem('user_referrer') || '기존 회원'
        };
        localStorage.setItem('user_session', JSON.stringify(mockSession));
        localStorage.setItem('user_type', type);
        window.dispatchEvent(new Event('auth-change'));
    };

    const logout = () => {
        localStorage.removeItem('user_session');
        localStorage.removeItem('adult_verified');
        localStorage.removeItem('user_type');
        window.dispatchEvent(new Event('auth-change'));
    };

    return {
        isLoggedIn,
        user,
        login,
        logout,
        userType: (() => {
            // [Security] Strict White-list checking for Admin/Super roles
            if (user.id === 'admin_shop' || user.id === 'admin_user') return 'admin';
            if (user.id === 'test_shop' || user.type === 'shop' || user.type === 'business') return 'corporate';
            if (user.id === 'test_user') return 'individual';

            // Default mappings
            if (user.type === 'admin') return 'admin'; // Only if explicitly set in session record
            return user.type === 'shop' || user.type === 'business' ? 'corporate' : 'individual';
        })() as 'corporate' | 'individual' | 'admin',
        userName: user.name,
        userPoints: user.points,
        userReferrer: user.referrer
    };
}
