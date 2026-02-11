import { useState, useEffect } from 'react';

// Unified user session type
export interface UserSession {
    type: 'shop' | 'personal' | 'admin' | 'guest';
    name: string;
    points: number;
    id?: string;
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
            let session = null;
            if (sessionStr) {
                if (sessionStr.startsWith('{')) {
                    try {
                        session = JSON.parse(sessionStr);
                    } catch (e) {
                        console.error('Session JSON parse error:', e);
                    }
                } else if (sessionStr.startsWith('active_')) {
                    // Legacy plain string format handling
                    session = { type: localStorage.getItem('user_type') || 'guest', name: localStorage.getItem('user_name') || '회원' };
                }
            }

            const type = (localStorage.getItem('user_type') || session?.type || 'guest') as UserSession['type'];
            const name = session?.name || localStorage.getItem('user_name') || (type === 'guest' ? '로그인이 필요합니다' : '회원');

            const loggedIn = !!sessionStr;
            setIsLoggedInState(loggedIn);

            if (loggedIn && session) {
                setUser({
                    type: (session.type === 'shop' ? 'shop' : (session.type === 'personal' ? 'personal' : (session.type === 'admin' ? 'admin' : 'guest'))) as UserSession['type'],
                    name: name,
                    points: session.points || 50000,
                    id: session.id
                });
            } else {
                setUser({ type: 'guest', name: '게스트', points: 0 });
                if (loggedIn) setIsLoggedInState(false); // Clean up inconsistent state
            }
        } catch (e) {
            console.error('Auth status sync error:', e);
            setUser({ type: 'guest', name: '게스트', points: 0 });
            setIsLoggedInState(false);
        }
    };

    useEffect(() => {
        // Initial load
        updateAuthStatus();

        // Listen for storage changes (cross-tab) or custom events
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

    const login = (type: 'shop' | 'personal') => {
        const mockSession = {
            type,
            name: type === 'shop' ? '업주 관리자' : '일반 회원',
            id: 'mock_user'
        };
        localStorage.setItem('user_session', JSON.stringify(mockSession));
        localStorage.setItem('user_session', JSON.stringify(mockSession));
        localStorage.setItem('user_type', type);
        window.dispatchEvent(new Event('auth-change'));
    };

    const logout = () => {
        localStorage.removeItem('user_session');
        localStorage.removeItem('adult_verified'); // Clear verification too for full reset
        localStorage.removeItem('user_type');
        window.dispatchEvent(new Event('auth-change'));
    };

    return {
        isLoggedIn,
        user,
        login,
        logout,
        userType: (user.type === 'shop' || user.id === 'admin_shop' ? 'corporate' : 'individual') as 'corporate' | 'individual', // Explicit cast for LeftSidebar
        userName: user.name,
        userPoints: user.points
    };
}
