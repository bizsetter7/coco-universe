import { useState, useEffect } from 'react';

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

// Simple event-based auth hook for client-side demo
export function useAuth() {
    const [isLoggedIn, setIsLoggedInState] = useState(false);
    const [user, setUser] = useState<UserSession>({
        type: 'guest',
        id: 'guest',
        name: '게스트',
        nickname: '게스트',
        points: 0
    });

    const updateAuthStatus = () => {
        try {
            const sessionStr = localStorage.getItem('user_session');
            if (!sessionStr) {
                setUser({ type: 'guest', id: 'guest', name: '게스트', nickname: '게스트', points: 0 });
                setIsLoggedInState(false);
                return;
            }

            const session = JSON.parse(sessionStr);
            setIsLoggedInState(true);

            // Normalize type based on whitelist or stored value
            const finalType = (() => {
                if (session.id === 'admin_user' || session.id === 'admin_shop') return 'admin';
                if (session.id === 'test_shop' || session.type === 'corporate' || session.type === 'shop' || session.type === 'business') return 'corporate';
                if (session.id === 'test_user' || session.type === 'individual' || session.type === 'personal') return 'individual';
                return 'guest';
            })() as UserSession['type'];

            setUser({
                type: finalType,
                id: session.id || 'unknown',
                name: session.name || '회원',
                nickname: session.nickname || session.name || '익명',
                points: session.points || 0,
                referrer: session.referrer,
                shopId: session.shopId
            });
        } catch (e) {
            console.error('Auth status sync error:', e);
            setUser({ type: 'guest', id: 'guest', name: '게스트', nickname: '게스트', points: 0 });
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

    const login = (type: string, id?: string, name?: string, nickname?: string) => {
        const targetType = (type === 'admin' ? 'admin' : (type === 'shop' || type === 'corporate' ? 'corporate' : 'individual')) as UserSession['type'];

        const newUser: UserSession = {
            type: targetType,
            id: id || (targetType === 'admin' ? 'admin_shop' : (targetType === 'corporate' ? 'test_shop' : 'test_user')),
            name: name || (targetType === 'admin' ? '최고관리자' : (targetType === 'corporate' ? '기업회원' : '일반회원')),
            nickname: nickname || name || (targetType === 'admin' ? '최고관리자' : (targetType === 'corporate' ? '테스트사장님' : '테스트회원')),
            points: 50000,
            referrer: localStorage.getItem('user_referrer') || undefined
        };
        setUser(newUser);
        localStorage.setItem('user_session', JSON.stringify(newUser));
        localStorage.setItem('user_type', targetType);
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
        userType: user.type,
        userName: user.name,
        userNickname: user.nickname,
        userPoints: user.points,
        userReferrer: user.referrer
    };
}
