'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBrand } from '@/components/BrandProvider';
import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, User, Building, ArrowLeft } from 'lucide-react';

export const SignupPage = () => {
    const brand = useBrand();
    const router = useRouter();
    const { signUp } = useAuth();

    const [role, setRole] = useState<'individual' | 'corporate'>('individual');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password || !name || !nickname) {
            alert('모든 정보를 입력해주세요.');
            return;
        }

        if (password.length < 6) {
            alert('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        setIsLoading(true);
        try {
            await signUp(email, password, {
                name,
                nickname,
                role
            });

            alert('회원가입 신청이 완료되었습니다!\n이메일로 발송된 인증 링크를 확인해주세요.');
            router.push('/?page=login');
        } catch (err: any) {
            console.error('Signup error:', err);
            alert(`회원가입 실패: ${err.message || '다시 시도해주세요.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const primaryStyle = { color: brand.primaryColor };
    const primaryBgStyle = { backgroundColor: brand.primaryColor };

    return (
        <div className="max-w-md mx-auto px-4 py-8 min-h-[700px] flex flex-col justify-center">
            <button
                onClick={() => router.push('/?page=login')}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-6 text-sm font-bold transition"
            >
                <ArrowLeft size={16} /> 로그인으로 돌아가기
            </button>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2" style={primaryStyle}>회원가입</h2>
                <p className="text-gray-500">코코알바의 새로운 가족이 되어주세요</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => setRole('individual')}
                        className={`py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${role === 'individual'
                            ? 'border-pink-500 bg-pink-50 text-pink-600'
                            : 'border-gray-100 bg-white text-gray-400'
                            }`}
                    >
                        <User size={20} />
                        <span className="text-xs font-black">개인회원</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('corporate')}
                        className={`py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${role === 'corporate'
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-100 bg-white text-gray-400'
                            }`}
                    >
                        <Building size={20} />
                        <span className="text-xs font-black">기업회원</span>
                    </button>
                </div>

                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="이메일 (ID로 사용됩니다)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호 (6자 이상)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        required
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="이름"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                            required
                        />
                        <input
                            type="text"
                            placeholder="닉네임"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                            required
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <div className="flex items-start gap-2 mb-6 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <input type="checkbox" id="terms" required className="mt-1 accent-pink-500" />
                        <label htmlFor="terms" className="text-[11px] text-gray-500 leading-tight cursor-pointer">
                            [필수] 이용약관 및 개인정보 처리방침에 동의합니다.
                            {brand.name}는 건전하고 투명한 채용 환경을 지향합니다.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={primaryBgStyle}
                        className="w-full text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50"
                    >
                        {isLoading ? '가입 처리 중...' : '회원가입 완료'}
                    </button>
                </div>
            </form>
        </div>
    );
};
