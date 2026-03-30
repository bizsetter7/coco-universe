'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, Shield, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UI_Z_INDEX } from '@/constants/ui';

const REGIONS = [
    '서울', '강남구', '서초구', '송파구', '마포구', '영등포구', '강서구', '노원구',
    '경기도', '수원시', '성남시', '용인시', '고양시', '부천시',
    '인천', '부산', '대구', '대전', '광주',
];

const STORAGE_KEY = 'push_permission_dismissed';

export const PushPermission = () => {
    const { user, userType } = useAuth();
    const [show, setShow] = useState(false);
    const [step, setStep] = useState<'prompt' | 'region' | 'done'>('prompt');
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [isSubscribing, setIsSubscribing] = useState(false);

    useEffect(() => {
        // 조건: 구직자(individual)이고, 이미 동의/거부 안 했고, push 미지원 아닐 때
        if (!user?.id) return;
        if (userType !== 'individual') return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (dismissed) return;

        // 이미 동의된 경우 표시 안 함
        if (Notification.permission === 'granted') return;

        // 3초 후 표시 (페이지 안정화 대기)
        const timer = setTimeout(() => setShow(true), 3000);
        return () => clearTimeout(timer);
    }, [user?.id, userType]);

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, 'dismissed');
        setShow(false);
    };

    const handleAllow = async () => {
        setStep('region');
    };

    const toggleRegion = (region: string) => {
        setSelectedRegions(prev =>
            prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
        );
    };

    const handleSubscribe = async () => {
        if (!selectedRegions.length) {
            alert('수신할 지역을 1개 이상 선택해주세요.');
            return;
        }

        setIsSubscribing(true);
        try {
            // 1. 브라우저 알림 권한 요청
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('알림 권한이 거부됐습니다. 브라우저 설정에서 허용해주세요.');
                setIsSubscribing(false);
                return;
            }

            // 2. 서비스 워커 등록
            const registration = await navigator.serviceWorker.register('/sw.js');

            // 3. Push 구독
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

            // 4. 서버에 구독 정보 저장
            await fetch('/api/sos/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user!.id,
                    subscription: subscription.toJSON(),
                    regions: selectedRegions,
                }),
            });

            localStorage.setItem(STORAGE_KEY, 'subscribed');
            setStep('done');
            setTimeout(() => setShow(false), 2000);
        } catch (err) {
            console.error('Push subscribe failed:', err);
            alert('알림 설정 중 오류가 발생했습니다.');
        } finally {
            setIsSubscribing(false);
        }
    };

    if (!show) return null;

    return (
        <div className={`fixed bottom-24 left-4 right-4 md:bottom-4 md:left-auto md:right-6 md:w-96 z-[${UI_Z_INDEX.FLOATING}] animate-slide-up`}>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell size={18} className="text-white" />
                        <span className="text-white font-black text-sm">SOS 긴급구인 알림</span>
                    </div>
                    <button onClick={handleDismiss} className="text-white/70 hover:text-white transition">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-4">
                    {step === 'prompt' && (
                        <>
                            <p className="text-sm font-bold text-gray-800 mb-2">
                                업소에서 일이 많을 때 바로 알림을 받으세요!
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                                업체가 긴급 구인을 등록하면 선택한 지역 기준으로 알림이 전송됩니다.
                            </p>

                            {/* Stealth 안내 */}
                            <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Shield size={12} className="text-green-500" />
                                    <p className="text-xs text-gray-600">업체에 위치/개인정보가 전달되지 않습니다</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye size={12} className="text-blue-500" />
                                    <p className="text-xs text-gray-600">잠금화면엔 내용이 표시되지 않습니다</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BellOff size={12} className="text-gray-400" />
                                    <p className="text-xs text-gray-600">언제든 설정에서 해제 가능합니다</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleDismiss}
                                    className="py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
                                >
                                    나중에
                                </button>
                                <button
                                    onClick={handleAllow}
                                    className="py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
                                >
                                    알림 받기
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'region' && (
                        <>
                            <p className="text-sm font-black text-gray-800 mb-1">수신할 지역 선택</p>
                            <p className="text-xs text-gray-500 mb-3">
                                선택한 지역의 SOS 알림만 받습니다. 복수 선택 가능.
                            </p>
                            <div className="flex flex-wrap gap-1.5 mb-4 max-h-36 overflow-y-auto">
                                {REGIONS.map(r => (
                                    <button
                                        key={r}
                                        onClick={() => toggleRegion(r)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                            selectedRegions.includes(r)
                                                ? 'bg-red-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setStep('prompt')}
                                    className="py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
                                >
                                    이전
                                </button>
                                <button
                                    onClick={handleSubscribe}
                                    disabled={isSubscribing || !selectedRegions.length}
                                    className="py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-50 transition"
                                >
                                    {isSubscribing ? '설정 중...' : `설정 완료 (${selectedRegions.length}개 지역)`}
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'done' && (
                        <div className="text-center py-2">
                            <div className="text-3xl mb-2">✅</div>
                            <p className="text-sm font-black text-gray-800">알림 설정 완료!</p>
                            <p className="text-xs text-gray-500 mt-1">선택한 지역 SOS 알림을 받습니다</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// VAPID Public Key를 Uint8Array로 변환 (Web Push 스펙)
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
