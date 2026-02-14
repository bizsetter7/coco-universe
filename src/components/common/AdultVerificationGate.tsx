'use client';

import React, { useState } from 'react';
import {
    Smartphone,
    ShieldCheck,
    User
} from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';

interface AdultVerificationGateProps {
    onVerify: () => void;
}

// PortOne V2 SDK Type Definition
declare global {
    interface Window {
        PortOne?: {
            requestIdentityVerification: (data: any) => Promise<any>;
        };
    }
}

// Mock User Database for Validation (Updated to match useAuth & LoginPage)
const MOCK_USERS: Record<string, { type: 'business' | 'personal', name: string }> = {
    'admin_shop': { type: 'business', name: '최고관리자' },
    'admin_user': { type: 'personal', name: '마스터관리자' },
    'test_shop': { type: 'business', name: '테스트 사장님' },
    'test_user': { type: 'personal', name: '테스트 회원' }
};

export const AdultVerificationGate = ({ onVerify }: AdultVerificationGateProps) => {
    const brand = useBrand();
    const [loginType, setLoginType] = useState<'business' | 'personal'>('business');
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');

    const handleExit = () => {
        window.location.href = 'https://www.google.com';
    };

    const handleNonMemberAuth = async (type: string) => {
        if (type !== '휴대폰') {
            alert(`${type} 인증은 현재 준비 중입니다. 휴대폰 인증을 이용해 주세요.`);
            return;
        }

        if (!window.PortOne) {
            alert('인증 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        try {
            // [PortOne V2] Identity Verification Request
            const response = await window.PortOne.requestIdentityVerification({
                storeId: "store-6e7eb5d5-d11e-4f26-bdd4-da8d9a743c0a",
                identityVerificationId: `verif-${Date.now()}`,
                channelKey: "channel-key-831464c8-0402-4ec6-993d-4467773f9d37", // Needs update
            });

            if (response.code !== undefined) {
                // Failure or Cancel
                console.error('Verification Failed:', response.message);
                alert(`인증 실패: ${response.message}`);
                return;
            }

            // Success: Verify on server
            const verifyResponse = await fetch('/api/auth/verify-adult', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identityVerificationId: response.identityVerificationId }),
            });

            const result = await verifyResponse.json();

            if (result.success) {
                alert('성인 인증이 완료되었습니다. 환영합니다!');
                localStorage.setItem('adult_verified', 'true');
                onVerify();
            } else {
                alert(`성인 인증 실패: ${result.message || '만 19세 미만은 이용할 수 없습니다.'}`);
            }
        } catch (error: any) {
            console.error('PortOne Error:', error);
            alert(`인증 오류 발생: ${error.message || '알 수 없는 오류'}\n(Store ID와 Channel Key가 일치하는지 확인해주세요.)`);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Trim and Lowercase for robustness
        const targetId = id.trim().toLowerCase();

        if (!targetId || !pw) {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        const foundUser = MOCK_USERS[targetId];

        // [Fix] Bypass radio check for Admin accounts to prevent confusion
        const isAdmin = targetId === 'admin_shop' || targetId === 'admin_user';

        if (!foundUser || (!isAdmin && foundUser.type !== loginType)) {
            const typeText = loginType === 'business' ? '기업회원' : '개인회원';
            alert(`등록되지 않은 ID이거나,\n${typeText} 선택이 올바르지 않습니다.`);
            return;
        }

        // [Security Hardening] Explicit Match Only for Admin/Test accounts
        let sessionType: 'personal' | 'business' | 'admin' = foundUser.type === 'business' ? 'business' : 'personal';

        // Exact IDs only for Admin elevation
        if (targetId === 'admin_shop' || targetId === 'admin_user') {
            sessionType = 'admin';
        }

        // Success: Setup Session
        const sessionData = {
            type: sessionType,
            name: foundUser.name,
            nickname: targetId === 'admin_user' ? '전권대행' : (targetId === 'admin_shop' ? '슈퍼어드민' : foundUser.name),
            id: targetId,
            points: 50000,
            shopId: (targetId === 'admin_shop' || targetId === 'test_shop') ? 'shop_123' : undefined
        };
        localStorage.setItem('user_session', JSON.stringify(sessionData));
        localStorage.setItem('user_type', sessionType);

        onVerify();
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-white overflow-y-auto overscroll-behavior-contain">
            <div className="flex flex-col min-h-full w-full max-w-[420px] mx-auto bg-white relative">

                {/* 1. Logo Section */}
                <div className="pt-6 pb-2 flex flex-col items-center">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
                            <User className="text-white" size={16} />
                        </div>
                        {brand.name || 'COCO ALBA'}
                    </h1>
                </div>

                {/* 2. 19 Badge + Warning */}
                <div className="px-5 py-3 flex items-center gap-4 border-y border-gray-100 bg-gray-50/20">
                    <div className="shrink-0 w-14 h-14 rounded-full border-[3px] border-red-600 flex items-center justify-center bg-white shadow-md">
                        <span className="text-2xl font-black text-gray-900 italic tracking-tighter">19</span>
                    </div>
                    <p className="text-[11px] font-bold leading-tight text-gray-600">
                        본 정보내용은 청소년 유해매체물로서<br />
                        관련 법령 및 <span className="text-red-600 font-extrabold">청소년보호법 규정에 의하여</span><br />
                        <span className="text-red-600 font-black text-[13px]">만 19세 미만 청소년은 이용할 수 없습니다.</span>
                    </p>
                </div>

                <div className="py-2 text-center">
                    <p className="text-sm font-black text-gray-800 tracking-tight">
                        서비스 이용을 위해 <span className="text-red-500 underline underline-offset-2">로그인</span> 또는 <span className="text-red-500 underline underline-offset-2">성인인증</span>이 필요합니다.
                    </p>
                </div>

                {/* 3. Login Box */}
                <div className="mx-5 p-3.5 border border-gray-100 rounded-sm space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                            <span className="text-red-500 font-bold">→</span> 회원로그인
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] font-black">
                            <label className="flex items-center gap-1 cursor-pointer group">
                                <input
                                    type="radio" name="loginType" value="business"
                                    checked={loginType === 'business'}
                                    onChange={() => setLoginType('business')}
                                    className="w-3 h-3 accent-red-500"
                                />
                                <span className={loginType === 'business' ? 'text-red-600' : 'text-gray-400'}>기업회원</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer group">
                                <input
                                    type="radio" name="loginType" value="personal"
                                    checked={loginType === 'personal'}
                                    onChange={() => setLoginType('personal')}
                                    className="w-3 h-3 accent-red-500"
                                />
                                <span className={loginType === 'personal' ? 'text-red-600' : 'text-gray-400'}>개인회원</span>
                            </label>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="flex gap-2 h-[72px]">
                        <div className="flex-1 flex flex-col gap-1.5">
                            <input
                                type="text" placeholder="아이디" value={id} onChange={(e) => setId(e.target.value)}
                                className="w-full h-1/2 px-3 border border-gray-200 text-xs font-bold focus:border-red-500 outline-none"
                            />
                            <input
                                type="password" placeholder="비밀번호" value={pw} onChange={(e) => setPw(e.target.value)}
                                className="w-full h-1/2 px-3 border border-gray-200 text-xs font-bold focus:border-red-500 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            style={{ backgroundColor: brand.primaryColor || '#f82b60' }}
                            className="w-24 h-full text-white font-black text-sm hover:brightness-105 active:scale-95 transition-all rounded-sm shadow-sm"
                        >
                            로그인
                        </button>
                    </form>

                    <div className="flex items-center gap-5 text-[10px] text-gray-400 font-bold">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" className="w-3.5 h-3.5 accent-red-500" defaultChecked /> 아이디저장
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" className="w-3.5 h-3.5 accent-red-500" defaultChecked /> 자동로그인
                        </label>
                    </div>

                    {/* [Quick Pass] Added for Manager Convenience - Only visible in Development */}
                    {process.env.NODE_ENV !== 'production' && (
                        <div className="pt-2 mt-2 border-t border-gray-50 grid grid-cols-3 gap-1.5">
                            <button
                                onClick={() => { setId('admin_user'); setPw('password123'); }}
                                className="bg-gray-900 text-white text-[9px] font-black py-2 rounded-sm active:scale-95 transition-all"
                            >
                                마스터퀵
                            </button>
                            <button
                                onClick={() => { setId('test_shop'); setPw('password123'); setLoginType('business'); }}
                                className="bg-red-500 text-white text-[9px] font-black py-2 rounded-sm active:scale-95 transition-all"
                            >
                                기업퀵
                            </button>
                            <button
                                onClick={() => { setId('test_user'); setPw('password123'); setLoginType('personal'); }}
                                className="bg-slate-400 text-white text-[9px] font-black py-2 rounded-sm active:scale-95 transition-all"
                            >
                                개인퀵
                            </button>
                        </div>
                    )}
                </div>

                {/* 4. Auth Box */}
                <div className="mx-5 my-2 p-3.5 border border-gray-100 rounded-sm">
                    <div className="grid grid-cols-2 gap-4 divide-x divide-gray-100">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                <ShieldCheck size={20} className="text-gray-300" />
                            </div>
                            <p className="text-[11px] font-black text-gray-700">아이핀인증</p>
                            <button
                                onClick={() => handleNonMemberAuth('아이핀')}
                                className="px-5 py-1.5 border border-gray-200 text-[10px] font-black text-gray-500 hover:bg-gray-50 transition-colors rounded-sm"
                            >
                                인증하기
                            </button>
                        </div>
                        <div className="flex flex-col items-center gap-2 pl-4">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                <Smartphone size={20} className="text-gray-300" />
                            </div>
                            <p className="text-[11px] font-black text-gray-700">휴대폰인증</p>
                            <button
                                onClick={() => handleNonMemberAuth('휴대폰')}
                                className="px-5 py-1.5 border border-gray-200 text-[10px] font-black text-gray-500 hover:bg-gray-50 transition-colors rounded-sm"
                            >
                                인증하기
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-5 text-center pb-2">
                    <p className="text-[10px] font-black text-red-500 underline underline-offset-2">인증 시 어떤 형태로도 정보를 저장하지 않습니다.</p>
                </div>

                {/* 5. Footer */}
                <div className="mt-auto bg-[#f82b60] text-white p-4 text-center space-y-2">
                    <p className="text-lg font-black tracking-tighter flex items-center justify-center gap-1">
                        {brand.name || '코코알바'} 고객센터 <span className="text-2xl ml-1">1577-9879</span>
                    </p>
                    <p className="text-[9px] opacity-70 uppercase font-medium tracking-widest leading-none">
                        COPYRIGHT(C) 2026 {brand.name || 'COCOALBA'} ALL RIGHTS RESERVED.
                    </p>
                    <button
                        onClick={handleExit}
                        className="inline-block mt-1 px-8 py-1.5 border border-white/30 rounded-full text-[11px] font-black hover:bg-white hover:text-red-500 transition-all active:scale-95 shadow-lg"
                    >
                        성인인증 없이 나가기
                    </button>
                </div>
            </div>
        </div>
    );
};
