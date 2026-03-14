'use client';

import React, { useState } from 'react';
import { ShieldCheck, Smartphone, X, CheckCircle2, Loader2 } from 'lucide-react';
import type { IdentityVerifyProvider, IdentityVerifyResult } from '@/types/identity-verify';

interface IdentityVerifyModalProps {
    onClose: () => void;
    onVerified: (result: IdentityVerifyResult) => void;
}

/**
 * 본인인증 제공업체 선택 + 팝업 흐름 공통 모달
 * - Danal (다날 PASS) / NICE (나이스 CheckPlus) 선택
 * - 실제 SDK 키 세팅 전: 시뮬레이션 모드로 동작
 */
export const IdentityVerifyModal = ({ onClose, onVerified }: IdentityVerifyModalProps) => {
    const [step, setStep] = useState<'select' | 'loading' | 'done'>('select');
    const [selectedProvider, setSelectedProvider] = useState<IdentityVerifyProvider | null>(null);
    const [error, setError] = useState('');

    const PROVIDERS: { id: IdentityVerifyProvider; label: string; desc: string; color: string }[] = [
        {
            id: 'danal',
            label: '다날 PASS 인증',
            desc: 'SKT·KT·LGU+ 통신사 PASS 앱 본인확인',
            color: 'blue',
        },
        {
            id: 'nice',
            label: 'NICE 본인확인',
            desc: '나이스평가정보 휴대폰 본인인증',
            color: 'green',
        },
    ];

    const handleVerify = async (provider: IdentityVerifyProvider) => {
        setSelectedProvider(provider);
        setStep('loading');
        setError('');

        try {
            // 1. 서버에서 암호화 토큰 생성
            const tokenRes = await fetch('/api/identity/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider,
                    returnUrl: `${window.location.origin}/api/identity/callback`,
                    errorUrl: `${window.location.origin}/api/identity/callback?error=true`,
                }),
            });

            const tokenData = await tokenRes.json();

            if (!tokenRes.ok || !tokenData.encryptedToken) {
                throw new Error(tokenData.error || '토큰 생성 실패');
            }

            // 2. Mock 모드 감지 (실제 키 미설정 시)
            const isMock = tokenData.encryptedToken.includes('MOCK') || tokenData.authUrl === '#';

            if (isMock) {
                // 개발 환경: 2초 딜레이 후 Mock 성공 반환
                await new Promise((r) => setTimeout(r, 1500));
                setStep('done');
                onVerified({
                    success: true,
                    provider,
                    name: '홍길동 (Mock)',
                    birthdate: '199001**',
                    phone: '010-****-1234',
                    gender: 'M',
                    nationality: 'local',
                });
                return;
            }

            // 3. 실제 인증 팝업 열기
            const popupWidth = 500;
            const popupHeight = 650;
            const left = window.screenX + (window.outerWidth - popupWidth) / 2;
            const top = window.screenY + (window.outerHeight - popupHeight) / 2;

            // 팝업 방식: 제공업체 URL에 폼 POST
            const popup = window.open('', 'identity_verify', `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`);
            if (!popup) throw new Error('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.');

            // 팝업에 폼 POST 제출 (다날/NICE 공통 패턴)
            const formHtml = `
                <html><body>
                <form id="f" method="POST" action="${tokenData.authUrl}">
                    <input type="hidden" name="EncodeData" value="${tokenData.encryptedToken}" />
                </form>
                <script>document.getElementById('f').submit();</script>
                </body></html>
            `;
            popup.document.write(formHtml);

            // 팝업 결과 대기 (postMessage 기반)
            const handleMessage = (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return;
                if (event.data?.type === 'IDENTITY_VERIFY_RESULT') {
                    window.removeEventListener('message', handleMessage);
                    popup.close();
                    if (event.data.success) {
                        setStep('done');
                        onVerified(event.data.result as IdentityVerifyResult);
                    } else {
                        setError(event.data.message || '인증에 실패했습니다. 다시 시도해주세요.');
                        setStep('select');
                    }
                }
            };
            window.addEventListener('message', handleMessage);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '인증 오류가 발생했습니다.';
            setError(message);
            setStep('select');
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-900/60">
            <div className="bg-white w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-blue-600" />
                        <h3 className="font-black text-slate-900 text-base">본인인증</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={18} className="text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">

                    {step === 'select' && (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-500 font-medium mb-5">
                                사업자 인증이 완료되었습니다.<br />
                                대표자 본인인증 방법을 선택해주세요.
                            </p>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                                    {error}
                                </div>
                            )}

                            {PROVIDERS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleVerify(p.id)}
                                    className={`w-full p-4 border-2 rounded-2xl flex items-center gap-4 transition-all text-left hover:border-${p.color}-500 hover:bg-${p.color}-50 border-slate-100 bg-slate-50 group`}
                                >
                                    <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Smartphone className={`text-${p.color}-600`} size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">{p.label}</div>
                                        <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                                    </div>
                                </button>
                            ))}

                            <p className="text-[10px] text-slate-400 text-center pt-2 font-medium">
                                본인인증 정보는 신원확인 목적으로만 사용되며 별도 저장되지 않습니다.
                            </p>
                        </div>
                    )}

                    {step === 'loading' && (
                        <div className="text-center py-10 space-y-4">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">
                                    {selectedProvider === 'danal' ? '다날 PASS' : 'NICE'} 인증 처리 중...
                                </p>
                                <p className="text-xs text-slate-400 mt-1">팝업창에서 인증을 완료해주세요.</p>
                            </div>
                        </div>
                    )}

                    {step === 'done' && (
                        <div className="text-center py-10 space-y-4">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="text-green-600" size={32} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-base">본인인증 완료</p>
                                <p className="text-xs text-slate-400 mt-1">인증이 성공적으로 완료되었습니다.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-4 w-full py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all text-sm"
                            >
                                확인
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
