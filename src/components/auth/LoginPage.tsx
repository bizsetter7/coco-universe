'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBrand } from '@/components/BrandProvider';
import { useAuth } from '@/hooks/useAuth';

export const LoginPage = () => {
    const brand = useBrand();
    const router = useRouter();
    const { login } = useAuth();
    const [loginId, setLoginId] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLogin = () => {
        const id = loginId.trim();
        const pw = loginPassword.trim();

        if ((id === 'admin_shop' || id === 'admin_user') && pw === 'password123') {
            login('admin');
            alert('마스터 관리자로 로그인되었습니다. (관리자 페이지 접근 가능)');
            window.location.href = '/admin';
        } else if (id === 'test_shop' && pw === 'password123') {
            login('shop');
            alert('기업 회원(업주)으로 로그인되었습니다.\n광고 신청 및 내 업소 관리가 가능합니다.');
            window.location.href = '/';
        } else if (id === 'test_user' && pw === 'password123') {
            login('personal');
            alert('일반 회원으로 로그인되었습니다.\n커뮤니티 및 인재정보 이용이 가능합니다.');
            window.location.href = '/';
        } else {
            alert(`아이디 또는 비밀번호가 올바르지 않습니다.\n입력값: [${id}]\n(관리자: admin_user / 기업: test_shop / 개인: test_user)`);
        }
    };

    const quickLogin = (type: 'admin' | 'shop' | 'personal') => {
        login(type);
        const label = type === 'admin' ? '마스터 관리자' : (type === 'shop' ? '기업 회원' : '일반 회원');
        alert(`${label}로 즉시 로그인되었습니다.`);
        if (type === 'admin') window.location.href = '/admin';
        else window.location.href = '/';
    };

    const primaryStyle = { color: brand.primaryColor };
    const primaryBgStyle = { backgroundColor: brand.primaryColor };

    return (
        <div className="max-w-md mx-auto px-4 py-16 min-h-[600px] flex flex-col justify-center">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2" style={primaryStyle}>{brand.displayName}</h2>
                <p className="text-gray-500">더 나은 미래를 위한 첫 걸음</p>
            </div>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="아이디"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} `}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} `}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                    style={primaryBgStyle}
                    className="w-full text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition active:scale-[0.98]"
                    onClick={handleLogin}
                >
                    로그인
                </button>
                <div className="flex justify-center items-center text-[13px] text-gray-400 mt-4 whitespace-nowrap gap-2 sm:gap-4">
                    <span className="cursor-pointer hover:text-gray-600">아이디 찾기</span>
                    <span className="w-px h-3 bg-gray-200"></span>
                    <span className="cursor-pointer hover:text-gray-600">비밀번호 찾기</span>
                    <span className="w-px h-3 bg-gray-200"></span>
                    <button className="text-gray-600 font-bold hover:underline" onClick={() => alert('회원가입 기능 준비중입니다.')}>회원가입</button>
                </div>

                {/* [Exclusive] Quick Login for Owner - Only visible in Development */}
                {process.env.NODE_ENV !== 'production' && (
                    <div className="mt-10 p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                        <p className="text-center text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">운영자 전용 원클릭 패스 (개발용)</p>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => quickLogin('admin')}
                                className="bg-red-600 text-white text-[10px] font-black py-3 rounded-xl shadow-md active:scale-95 transition-all"
                            >
                                마스터
                            </button>
                            <button
                                onClick={() => quickLogin('shop')}
                                className="bg-blue-600 text-white text-[10px] font-black py-3 rounded-xl shadow-md active:scale-95 transition-all"
                            >
                                기업(업주)
                            </button>
                            <button
                                onClick={() => quickLogin('personal')}
                                className="bg-slate-700 text-white text-[10px] font-black py-3 rounded-xl shadow-md active:scale-95 transition-all"
                            >
                                일반회원
                            </button>
                        </div>
                    </div>
                )}

                {/* Social Login */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <p className="text-center text-xs text-gray-400 mb-4">또는 SNS로 간편하게 시작하기</p>
                    <div className="space-y-3">
                        <button
                            className="w-full py-4 rounded-xl bg-[#03C75A] text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition shadow-sm"
                            onClick={() => alert('네이버 로그인 연동 준비 중입니다.')}
                        >
                            <span className="font-black text-lg">N</span> 네이버로 시작하기
                        </button>
                        <button
                            className="w-full py-4 rounded-xl border border-gray-200 bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-sm"
                            onClick={() => alert('구글 로그인 연동 준비 중입니다.')}
                        >
                            <span className="font-black text-lg text-blue-500">G</span> 구글로 시작하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
