'use client';

import React from 'react';
import Link from 'next/link';
import { useBrand } from '@/components/BrandProvider';

const HOT_PINK = '#f82b60';

export const Footer = () => {
    const brand = useBrand();
    const isChoco = brand.id === 'choco';

    return (
        <footer className={`py-10 border-t font-sans ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
            <div className="max-w-4xl mx-auto px-4 text-center text-xs leading-relaxed">

                {/* 브랜드 로고 */}
                <div className="mb-5 flex flex-col items-center gap-1">
                    {isChoco ? (
                        <>
                            <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase select-none">
                                파트너스크레딧 공식 B2B 플랫폼
                            </span>
                            <span className="text-2xl md:text-3xl font-black tracking-tighter text-blue-800">
                                초코파트너스
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-[10px] md:text-[11px] font-black text-slate-400 tracking-tighter uppercase select-none">
                                여성전문 엔터프라이즈 알바 NO.1
                            </span>
                            <div className="flex items-center gap-0.5">
                                <span className="text-2xl md:text-3xl font-black tracking-tighter" style={{ color: HOT_PINK }}>
                                    COCO
                                </span>
                                <span className={`text-2xl md:text-3xl font-black tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    ALBA
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* 링크 */}
                <div className="flex justify-center gap-2 md:gap-4 mb-5 font-medium text-[10px] md:text-[11px] whitespace-nowrap overflow-x-auto no-scrollbar">
                    <Link href="/customer-center?tab=policy" className="hover:text-gray-900 dark:hover:text-white transition-colors">이용약관</Link>
                    <span className="text-gray-300">|</span>
                    <Link href="/customer-center?tab=policy" className="hover:text-gray-900 dark:hover:text-white transition-colors font-bold">개인정보처리방침</Link>
                    <span className="text-gray-300">|</span>
                    <Link href="/customer-center?tab=policy" className="hover:text-gray-900 dark:hover:text-white transition-colors">청소년보호정책</Link>
                    <span className="text-gray-300">|</span>
                    <Link href="/customer-center?tab=inquiry" className="hover:text-gray-900 dark:hover:text-white transition-colors">광고/제휴문의</Link>
                </div>

                {/* 사업자 정보 — PC: 한 줄씩, 모바일: 항목 분리 */}
                <div className="space-y-1 mb-5 text-gray-400 text-[10px] md:text-[11px]">
                    {/* PC */}
                    <p className="hidden md:block">
                        상호: 초코아이디어(코코알바) | 사업자등록번호: 226-13-91078
                    </p>
                    {/* 모바일 */}
                    <p className="block md:hidden">상호: 초코아이디어(코코알바)</p>
                    <p className="block md:hidden">사업자등록번호: 226-13-91078</p>

                    <p>주소: 경기도 평택시 지산로12번길 93, 2층(지산동)</p>
                    <p>통신판매업신고번호 : 제 2017-경기송탄-0029호</p>
                    <p>직업정보제공사업신고번호 : J1806020260001</p>

                    {/* PC */}
                    <p className="hidden md:block">
                        고객센터: 1877-1442 (평일 09:00 ~ 18:00) | 이메일: bizsetter7@gmail.com
                    </p>
                    {/* 모바일 */}
                    <p className="block md:hidden">고객센터: 1877-1442 (평일 09:00 ~ 18:00)</p>
                    <p className="block md:hidden">이메일: bizsetter7@gmail.com</p>
                </div>

                {/* 저작권 */}
                <div className="text-gray-400/60 text-[10px] md:text-[11px]">
                    <p className="mb-0.5">© 2026 {isChoco ? '초코파트너스' : 'COCOALBA'}. All Rights Reserved.</p>
                    <p className="mb-0.5">No1.2030유흥알바-여성알바 사이트 밤알바 룸알바</p>
                    {/* PC */}
                    <p className="hidden md:block">본 사이트는 구인구직 정보의 중개 시스템으로, 정보의 정확성에 대한 책임은 등록자에게 있습니다.</p>
                    {/* 모바일 */}
                    <p className="block md:hidden">본 사이트는 구인구직 정보의 중개시스템으로,<br />정보의 정확성에 대한 책임은 등록자에게 있습니다.</p>
                </div>
            </div>
        </footer>
    );
};
