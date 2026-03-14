'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBrand } from '@/components/BrandProvider';
import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, User, Building, ArrowLeft, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { IdentityVerifyModal } from './IdentityVerifyModal';
import type { IdentityVerifyResult } from '@/types/identity-verify';

type BizStatus = '정상' | '휴업' | '폐업' | '유효하지 않음' | null;

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

    // 기업회원 전용
    const [bizNumber, setBizNumber] = useState('');
    const [bizStatus, setBizStatus] = useState<BizStatus>(null);
    const [bizChecking, setBizChecking] = useState(false);
    const [bizMessage, setBizMessage] = useState('');

    // 기업회원 전용: 본인인증
    const [showIdentityModal, setShowIdentityModal] = useState(false);
    const [identityResult, setIdentityResult] = useState<IdentityVerifyResult | null>(null);

    const formatBizNumber = (v: string) => {
        const d = v.replace(/[^0-9]/g, '').slice(0, 10);
        if (d.length <= 3) return d;
        if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
        return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
    };

    const handleBizNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBizNumber(formatBizNumber(e.target.value));
        setBizStatus(null);
        setBizMessage('');
    };

    const verifyBizNumber = useCallback(async () => {
        const raw = bizNumber.replace(/[^0-9]/g, '');
        if (raw.length !== 10) {
            setBizMessage('10자리 사업자번호를 입력해주세요.');
            return;
        }
        setBizChecking(true);
        setBizStatus(null);
        setBizMessage('');
        try {
            const res = await fetch('/api/nts/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessNumber: raw }),
            });
            const data = await res.json();
            setBizStatus(data.status as BizStatus);
            if (data.status === '정상') {
                setBizMessage('사업자 등록 상태가 정상입니다.');
            } else {
                setBizMessage(data.message || `조회 결과: ${data.status}`);
            }
        } catch {
            setBizStatus('유효하지 않음');
            setBizMessage('조회 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setBizChecking(false);
        }
    }, [bizNumber]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password || !name || !nickname) {
            alert('모든 정보를 입력해주세요.');
            return;
        }

        if (role === 'corporate') {
            if (bizStatus !== '정상') {
                alert('사업자등록번호 조회 후 상태가 [정상]인 경우에만 가입할 수 있습니다.');
                return;
            }
            if (!identityResult?.success) {
                alert('대표자 본인인증을 완료해주세요.');
                return;
            }
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
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
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

                {/* 기업회원 전용: 사업자등록번호 실시간 조회 */}
                {role === 'corporate' && (
                    <div>
                        <label className="block text-xs font-bold mb-2 text-gray-500">
                            사업자등록번호 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="000-00-00000"
                                value={bizNumber}
                                onChange={handleBizNumberChange}
                                maxLength={12}
                                className={`flex-1 p-4 rounded-xl border font-bold ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                            />
                            <button
                                type="button"
                                onClick={verifyBizNumber}
                                disabled={bizChecking || bizNumber.replace(/[^0-9]/g, '').length !== 10}
                                className="px-4 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition whitespace-nowrap flex items-center gap-1"
                            >
                                {bizChecking ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                조회
                            </button>
                        </div>
                        {bizStatus && (
                            <div className={`mt-2 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg ${
                                bizStatus === '정상' ? 'bg-green-50 text-green-700 border border-green-200' :
                                bizStatus === '휴업' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {bizStatus === '정상' ? <CheckCircle2 size={14} /> :
                                 bizStatus === '휴업' ? <AlertCircle size={14} /> :
                                 <XCircle size={14} />}
                                [{bizStatus}] {bizMessage}
                            </div>
                        )}
                        {!bizStatus && (
                            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                국세청 사업자등록 상태를 실시간 조회합니다. [정상] 상태여야 가입이 가능합니다.
                            </p>
                        )}

                        {/* 사업자 정상 확인 후: 대표자 본인인증 단계 */}
                        {bizStatus === '정상' && (
                            <div className="mt-4 p-4 rounded-2xl border border-blue-100 bg-blue-50">
                                <p className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
                                    <ShieldCheck size={14} />
                                    STEP 2. 대표자 본인인증 필수
                                </p>
                                {identityResult?.success ? (
                                    <div className="flex items-center gap-2 text-xs font-bold text-green-700">
                                        <CheckCircle2 size={14} />
                                        본인인증 완료 ({identityResult.name})
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowIdentityModal(true)}
                                        className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ShieldCheck size={15} />
                                        본인인증 시작 (다날 / NICE)
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

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

            {/* 본인인증 모달 */}
            {showIdentityModal && (
                <IdentityVerifyModal
                    onClose={() => setShowIdentityModal(false)}
                    onVerified={(result) => {
                        setIdentityResult(result);
                        setShowIdentityModal(false);
                    }}
                />
            )}
        </div>
    );
};
