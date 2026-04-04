'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AUDIT_MODE } from '@/lib/brand-config';

// Unified user session type
export interface UserSession {
    type: 'corporate' | 'individual' | 'admin' | 'guest';
    id: string;
    name: string;
    nickname: string;
    credit: number;
    points: number;
    jump_balance: number;
    referrer?: string;
    shopId?: string;
    isSimulated?: boolean;
    isVerifiedPartnerVerified?: boolean;
    email?: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    isLoading: boolean;
    user: UserSession;
    login: (type: 'admin' | 'shop' | 'personal', id?: string, name?: string, nickname?: string) => void;
    signIn: (email: string, pw: string) => Promise<any>;
    signUp: (email: string, pw: string, metadata: any) => Promise<any>;
    logout: () => Promise<void>;
    userType: UserSession['type'];
    userName: string;
    userNickname: string;
    userCredit: number;
    userPoints: number;
    userJumpBalance: number;
    userReferrer?: string;
    isSimulated?: boolean;
    isVerifiedPartnerVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedInState] = useState(false);
    const [isLoading, setIsLoadingState] = useState(true);
    const [user, setUserState] = useState<UserSession>({
        type: 'guest',
        id: 'guest',
        name: '게스트',
        nickname: '게스트',
        credit: 0,
        points: 0,
        jump_balance: 0
    });

    const isMounted = useRef(true);

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
        const savedMock = typeof window !== 'undefined' ? localStorage.getItem('coco_mock_session') : null;
        let mockData = null;
        if (savedMock) {
            try { mockData = JSON.parse(savedMock); } catch (e) { }
        }

        if (session?.user) {
            try {
                const { user: authUser } = session;
                const MASTER_EMAILS = ['bizsetter7@gmail.com', 'admin@cocoalba.kr'];
                const isMasterEmail = authUser.email && MASTER_EMAILS.includes(authUser.email);

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (profile || isMasterEmail) {
                    const userType = (isMasterEmail || profile?.role === 'admin') ? 'admin' :
                        (profile?.role === 'corporate' ? 'corporate' : 'individual');

                    let newUser: UserSession = {
                        type: userType as UserSession['type'],
                        id: authUser.id,
                        name: profile?.full_name || authUser.email?.split('@')[0] || '회원',
                        nickname: profile?.nickname || profile?.full_name || '닉네임',
                        credit: profile?.credit_balance || 0,
                        points: profile?.points || 0,
                        jump_balance: profile?.jump_balance || 0,
                        isVerifiedPartnerVerified: profile ? (profile.role === 'corporate' ? !!profile.business_verified : !!profile.is_adult_verified) : false,
                        email: authUser.email
                    };

                    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
                    
                    if (newUser.type === 'admin' && !isAdminPath) {
                        const simType = typeof window !== 'undefined' ? localStorage.getItem('coco_sim_mode') : null;
                        if (simType === 'corporate' || simType === 'individual') {
                            newUser = {
                                ...newUser,
                                type: simType,
                                id: `${authUser.id}_sim_${simType}`,
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

        if (mockData) {
            setUser(mockData);
            setIsLoggedIn(true);
            setIsLoading(false);
            return;
        }

        const finalMockCheck = typeof window !== 'undefined' ? localStorage.getItem('coco_mock_session') : null;
        if (finalMockCheck) {
            try {
                const recovered = JSON.parse(finalMockCheck);
                if (recovered?.type) {
                    setUser(recovered);
                    setIsLoggedIn(true);
                    setIsLoading(false);
                    return;
                }
            } catch (e) { }
        }

        setUser({ type: 'guest', id: 'guest', name: '게스트', nickname: '게스트', credit: 0, points: 0, jump_balance: 0 });
        setIsLoggedIn(false);
        setIsLoading(false);
    };

    useEffect(() => {
        isMounted.current = true;

        const savedMock = typeof window !== 'undefined' ? localStorage.getItem('coco_mock_session') : null;
        if (savedMock) {
            try {
                const mockData = JSON.parse(savedMock);
                if (mockData && mockData.type) {
                    setUser(mockData);
                    setIsLoggedIn(true);
                    setIsLoading(false);
                }
            } catch (e) { }
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) syncUserSession(session);
            else if (!savedMock) setIsLoading(false);
        }).catch((err) => {
            if (err.name === 'AbortError' || err.message?.includes('aborted')) return;
            console.warn("Auth session check failed:", err);
            if (!savedMock) setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === 'SIGNED_OUT') {
                const hasMock = typeof window !== 'undefined' ? localStorage.getItem('coco_mock_session') : null;
                if (hasMock) return;
            }
            if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED') {
                syncUserSession(session).catch(() => { });
            }
        });

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
        const mockUser: UserSession = {
            type: type === 'shop' ? 'corporate' : (type === 'personal' ? 'individual' : 'admin'),
            id: id || `mock_${Math.random().toString(36).substr(2, 9)}`,
            name: name || (type === 'admin' ? '관리자' : '테스트회원'),
            nickname: nickname || (type === 'admin' ? '운영마스터' : '테스트닉네임'),
            credit: 1000,
            points: 500,
            jump_balance: 100,
            email: type === 'admin' ? 'admin_user@example.com' : 'test@example.com'
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem('coco_mock_session', JSON.stringify(mockUser));
            if (type === 'admin') {
                document.cookie = 'coco_admin_mock=1; path=/; max-age=86400; SameSite=Lax';
            }
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
            localStorage.removeItem('favorites');
            localStorage.removeItem('favorites_timestamps');
            localStorage.removeItem('viewed_shops');
            document.cookie = 'coco_admin_mock=; path=/; max-age=0';
        }

        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.warn("SignOut failed (ignoring):", e);
        }

        setIsLoggedIn(false);
        setUser({ type: 'guest', id: 'guest', name: '게스트', nickname: '게스트', credit: 0, points: 0, jump_balance: 0 });
        window.location.href = '/';
    };

    const signIn = async (email: string, pw: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pw
        });
        if (error) throw error;
        return data;
    };

    const signUpClientFallback = async (email: string, pw: string, metadata: any) => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('favorites');
            localStorage.removeItem('favorites_timestamps');
            localStorage.removeItem('viewed_shops');
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password: pw,
            options: {
                data: {
                    full_name: metadata.name || '',
                    nickname: metadata.nickname || metadata.name || '',
                    role: metadata.role || 'individual',
                    phone: metadata.phone || '',
                    birthdate: metadata.birthdate || '',
                    gender: metadata.gender || '',
                },
            },
        });
        if (error) throw error;

        if (data.user?.id) {
            try {
                await supabase.from('profiles').update({
                    username: email.split('@')[0],
                    phone: metadata.phone || null,
                    birth_date: metadata.birthdate || null,
                    gender: metadata.gender || null,
                }).eq('id', data.user.id);
            } catch (e) {
                console.warn('[signup fallback] profiles update 실패:', e);
            }
        }
        return data;
    };

    const signUp = async (email: string, pw: string, metadata: any) => {
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password: pw,
                    name: metadata.name,
                    nickname: metadata.nickname,
                    role: metadata.role || 'individual',
                    phone: metadata.phone,
                    birthdate: metadata.birthdate,
                    gender: metadata.gender,
                }),
            });
            const json = await res.json();
            if (res.ok && json.success) return json;
            if (json.code === 'NO_ADMIN_KEY') {
                return await signUpClientFallback(email, pw, metadata);
            }
            throw new Error(json.message || '회원가입 처리 중 오류가 발생했습니다.');
        } catch (err: any) {
            if (err?.message?.includes('fetch')) {
                return await signUpClientFallback(email, pw, metadata);
            }
            throw err;
        }
    };

    const value: AuthContextType = {
        isLoggedIn,
        isLoading,
        user,
        login,
        signIn,
        signUp,
        logout,
        userType: user.type,
        userName: user.name,
        userNickname: user.nickname,
        userCredit: user.credit,
        userPoints: user.points,
        userJumpBalance: user.jump_balance,
        userReferrer: user.referrer,
        isSimulated: user.isSimulated,
        isVerifiedPartnerVerified: AUDIT_MODE || !!user.isVerifiedPartnerVerified
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
