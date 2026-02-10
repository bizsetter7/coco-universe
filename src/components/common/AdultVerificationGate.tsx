'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Smartphone,
    UserCheck,
    ArrowRight,
    AlertTriangle,
    ShieldCheck,
    LogIn,
    User,
    Briefcase,
    X
} from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';

interface AdultVerificationGateProps {
    onVerify: () => void;
}

export const AdultVerificationGate = ({ onVerify }: AdultVerificationGateProps) => {
    const brand = useBrand();
    const router = useRouter();
    const [loginType, setLoginType] = useState<'business' | 'personal'>('business');
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');

    const handleExit = () => {
        window.location.href = 'https://www.google.com';
    };

    const handleNonMemberAuth = (type: string) => {
        if (confirm(`${type} 인증을 진행하시겠습니까? (시뮬레이션)`)) {
            onVerify();
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !pw) {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        // Mock Login Logic
        const sessionData = {
            type: loginType === 'business' ? 'shop' : 'personal',
            name: loginType === 'business' ? '사장님' : '홍길동',
            id: 'mock_user_' + Date.now(),
            points: 50000
        };
        localStorage.setItem('user_session', JSON.stringify(sessionData));
        localStorage.setItem('user_type', loginType === 'business' ? 'shop' : 'personal');

        onVerify();
    };

    return (
        <div className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300`}>
            <div className={`w-full max-w-4xl mx-auto my-auto ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {/* Header: 19 Symbol & Legal Text */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-8 md:mb-12 text-center md:text-left mt-8 md:mt-0">
                    <div className="relative group shrink-0">
                        <div className="w-24 h-24 md:w-40 md:h-40 rounded-full border-[6px] md:border-[8px] border-red-600 flex items-center justify-center shadow-2xl shadow-red-500/20 bg-white">
                            <span className="text-4xl md:text-7xl font-black text-gray-900 italic tracking-tighter">19</span>
                        </div>
                        <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center text-white animate-bounce shadow-lg">
                            <AlertTriangle size={16} className="md:w-5 md:h-5" />
                        </div>
                    </div>

                    <div className="space-y-3 max-w-xl px-2">
                        <h2 className={`text-lg md:text-2xl font-black leading-tight ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                            본 정보 내용은 청소년 유해 매체물로서<br className="hidden md:block" />
                            정보통신망 이용촉진 및 정보보호 등에 관한 법률 및<br className="hidden md:block" />
                            <span className="text-red-600">청소년보호법의 규정에 의하여</span><br className="hidden md:block" />
                            만 19세 미만의 청소년이 이용할 수 없습니다.
                        </h2>
                        <p className="text-[11px] md:text-xs text-gray-500 font-bold opacity-70">ADULT VERIFICATION REQUIRED</p>
                    </div>
                </div>

                {/* Main Auth Box */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-px overflow-hidden rounded-[32px] border shadow-2xl ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>

                    {/* Left: Non-member Auth */}
                    <div className="p-8 md:p-12 space-y-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <ShieldCheck className="text-pink-600" />
                                비회원 인증
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">회원가입 없이 본인인증 후 이용 가능합니다.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleNonMemberAuth('아이핀')}
                                className={`flex items-center justify-center gap-3 w-full py-5 rounded-2xl font-black transition-all transform hover:scale-[1.02] active:scale-[0.98] ${brand.theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-100'}`}
                            >
                                <UserCheck className="text-pink-600" />
                                아이핀(i-PIN) 인증
                            </button>
                            <button
                                onClick={() => handleNonMemberAuth('휴대폰')}
                                className={`flex items-center justify-center gap-3 w-full py-5 rounded-2xl font-black transition-all transform hover:scale-[1.02] active:scale-[0.98] ${brand.theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-100'}`}
                            >
                                <Smartphone className="text-pink-600" />
                                휴대폰 본인인증
                            </button>
                        </div>
                    </div>

                    {/* Right: Member Login */}
                    <div className="p-8 md:p-12 space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <LogIn className="text-pink-600" />
                                회원 로그인
                            </h3>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="login_type"
                                        checked={loginType === 'business'}
                                        onChange={() => setLoginType('business')}
                                        className="w-4 h-4 accent-pink-600"
                                    />
                                    <span className={`text-sm font-bold ${loginType === 'business' ? 'text-pink-600' : 'text-gray-500'}`}>기업회원</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="login_type"
                                        checked={loginType === 'personal'}
                                        onChange={() => setLoginType('personal')}
                                        className="w-4 h-4 accent-pink-600"
                                    />
                                    <span className={`text-sm font-bold ${loginType === 'personal' ? 'text-pink-600' : 'text-gray-500'}`}>개인회원</span>
                                </label>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="아이디"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    className={`w-full px-5 py-4 rounded-xl text-sm font-bold border outline-none focus:ring-2 focus:ring-pink-500/20 transition-all ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                                />
                                <input
                                    type="password"
                                    placeholder="비밀번호"
                                    value={pw}
                                    onChange={(e) => setPw(e.target.value)}
                                    className={`w-full px-5 py-4 rounded-xl text-sm font-bold border outline-none focus:ring-2 focus:ring-pink-500/20 transition-all ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                                />
                            </div>
                            <button
                                type="submit"
                                style={{ backgroundColor: brand.primaryColor }}
                                className="w-full py-5 rounded-xl text-white font-black text-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                로그인 시도하기
                                <ArrowRight size={20} />
                            </button>
                        </form>

                        {/* Social Login */}
                        <div className="pt-4 flex flex-col items-center gap-4">
                            <p className="text-xs text-gray-400 font-bold">※ 간편로그인/가입 (개인회원 전용)</p>
                            <div className="flex items-center gap-6">
                                <div className="group flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white cursor-pointer hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-110">
                                        <span className="font-black text-2xl">f</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">페이스북</span>
                                </div>
                                <div className="group flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 cursor-pointer hover:shadow-lg hover:shadow-gray-300/30 transition-all hover:scale-110">
                                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                                            <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.16-1.84 4.12-1.2 1.2-3.08 2.4-6 2.4-4.8 0-8.74-3.88-8.74-8.74s3.94-8.74 8.74-8.74c2.6 0 4.5 1.02 5.9 2.34l2.3-2.3c-2.1-1.94-4.84-3.14-8.2-3.14-6.68 0-12.22 5.54-12.22 12.22s5.54 12.22 12.22 12.22c3.6 0 6.34-1.2 8.44-3.4 2.18-2.18 2.86-5.26 2.86-7.68 0-.76-.06-1.46-.18-2.12h-11.12z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">구글</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="mt-10 flex flex-col items-center gap-6">
                    <button
                        onClick={handleExit}
                        className="group flex items-center gap-2 text-gray-400 hover:text-red-500 font-black text-sm transition-colors"
                    >
                        만 19세 미만 나가기
                        <X size={16} className="transition-transform group-hover:rotate-90" />
                    </button>

                    <div className="flex flex-col items-center opacity-40">
                        <p className="text-[10px] font-black tracking-[0.2em] uppercase">WWW.FOXALBA.COM</p>
                        <div className="w-8 h-1 bg-red-600 rounded-full mt-1"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
