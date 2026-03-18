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
    const [step, setStep] = useState<'role' | 'identity' | 'form'>('role');
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

    // 본인인증 전용
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

        if (step === 'role') {
            setStep('identity');
            return;
        }

        if (step === 'identity' && !identityResult?.success) {
            alert('본인인증을 먼저 완료해주세요.');
            return;
        }

        if (!email || !password || !name || !nickname) {
            alert('모든 정보를 입력해주세요.');
            return;
        }

        if (role === 'corporate' && bizStatus !== '정상') {
            alert('사업자등록번호 상태가 정상이어야 합니다.');
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
                role,
                identity_ci: identityResult?.ci, // CI 값 전달 (암호화 처리는 서버/DB에서 수행)
                biz_number: role === 'corporate' ? bizNumber.replace(/[^0-9]/g, '') : undefined
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
                onClick={() => {
                    if (step === 'form') setStep('identity');
                    else if (step === 'identity') setStep('role');
                    else router.push('/?page=login');
                }}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-6 text-sm font-bold transition"
            >
                <ArrowLeft size={16} /> {step === 'role' ? '로그인으로 돌아가기' : '이전 단계'}
            </button>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2" style={primaryStyle}>회원가입</h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-1.5 rounded-full transition-all ${
                            (s === 1 && step === 'role') || (s === 2 && step === 'identity') || (s === 3 && step === 'form') 
                            ? 'w-8 bg-blue-600' : 'w-4 bg-gray-200'
                        }`} />
                    ))}
                </div>
                <p className="text-gray-500 font-bold">
                    {step === 'role' ? 'STEP 1. 회원 유형 선택' :
                     step === 'identity' ? 'STEP 2. 다날 본인확인 필수' :
                     'STEP 3. 상세 정보 입력'}
                </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                {/* STEP 1: Role Selection */}
                {step === 'role' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('individual')}
                                className={`py-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${role === 'individual'
                                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md'
                                    : 'border-gray-100 bg-white text-gray-400'
                                    }`}
                            >
                                <div className={`p-3 rounded-full ${role === 'individual' ? 'bg-blue-200' : 'bg-gray-50'}`}>
                                    <User size={32} />
                                </div>
                                <span className="text-sm font-black text-gray-800">개인회원 (구직자)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('corporate')}
                                className={`py-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${role === 'corporate'
                                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md'
                                    : 'border-gray-100 bg-white text-gray-400'
                                    }`}
                            >
                                <div className={`p-3 rounded-full ${role === 'corporate' ? 'bg-blue-200' : 'bg-gray-50'}`}>
                                    <Building size={32} />
                                </div>
                                <span className="text-sm font-black text-gray-800">기업회원 (사장님)</span>
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStep('identity')}
                            style={primaryBgStyle}
                            className="w-full text-white font-black py-4 rounded-xl shadow-lg hover:opacity-90 transition mt-4"
                        >
                            다음 단계로
                        </button>
                    </div>
                )}

                {/* STEP 2: Identity Verification */}
                {step === 'identity' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                            <ShieldCheck size={48} className="mx-auto text-blue-600 mb-4" />
                            <h3 className="font-black text-lg mb-2 text-gray-800">신뢰할 수 있는 소통을 위해</h3>
                            <p className="text-gray-500 text-xs leading-relaxed font-bold">
                                {brand.name}는 1인 1계정 및 클린 채용 환경을 위해<br/>
                                다날(Danal)을 통한 본인인증을 필수로 진행합니다.
                            </p>
                        </div>

                        {identityResult?.success ? (
                            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex flex-col items-center gap-3">
                                <CheckCircle2 size={32} className="text-green-600" />
                                <div className="text-center">
                                    <p className="font-black text-green-800">{identityResult.name}님 인증 완료</p>
                                    <p className="text-[10px] text-green-600 font-bold mt-1">인증된 정보를 바탕으로 가입을 진행합니다.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep('form')}
                                    className="w-full py-4 bg-green-600 text-white font-black rounded-xl text-sm mt-2"
                                >
                                    가입 정보 입력하기
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowIdentityModal(true)}
                                className="w-full py-5 bg-blue-600 text-white font-black rounded-xl text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl"
                            >
                                <ShieldCheck size={24} />
                                다날 PASS 본인인증 시작
                            </button>
                        )}
                        <p className="text-[10px] text-gray-400 text-center font-medium">
                            인증된 정보는 가맹점 정보(CI/DI)로 관리되어 중복 가입 방지에 사용됩니다.
                        </p>
                    </div>
                )}

                {/* STEP 3: Detail Form */}
                {step === 'form' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* 기업회원 전용: 사업자등록번호 조회 */}
                        {role === 'corporate' && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <label className="block text-xs font-bold mb-2 text-gray-500">
                                    기업 정보 인증 <span className="text-red-500">*</span>
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
                                        className="px-4 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
                                    >
                                        {bizChecking ? <Loader2 size={14} className="animate-spin" /> : '조회'}
                                    </button>
                                </div>
                                {bizStatus && (
                                    <div className={`mt-2 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg ${
                                        bizStatus === '정상' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                        {bizStatus === '정상' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                        [{bizStatus}] {bizMessage}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-400 ml-1">성명 (인증됨)</label>
                                    <input
                                        type="text"
                                        value={name || identityResult?.name || ''}
                                        disabled
                                        className="w-full p-4 rounded-xl border bg-gray-50 text-gray-500 font-bold"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-400 ml-1">닉네임</label>
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
                            
                            <input
                                type="email"
                                placeholder="이메일 (ID)"
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
                        </div>

                        <div className="pt-4">
                            <div className="flex items-start gap-2 mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <input type="checkbox" id="terms" required className="mt-1 accent-blue-600" />
                                <label htmlFor="terms" className="text-[11px] text-gray-500 font-bold leading-tight cursor-pointer">
                                    [필수] 이용약관 및 개인정보 처리방침에 동의합니다.<br/>
                                    전달된 휴대폰 정보는 본인확인 및 중복가입 방지용으로만 사용됩니다.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || (role === 'corporate' && bizStatus !== '정상')}
                                style={primaryBgStyle}
                                className="w-full text-white font-black py-5 rounded-xl shadow-xl hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin mx-auto" /> : '회원가입 완료'}
                            </button>
                        </div>
                    </div>
                )}
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
