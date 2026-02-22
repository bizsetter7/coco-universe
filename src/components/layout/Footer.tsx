'use client';

import React from 'react';
import Link from 'next/link';
import { useBrand } from '@/components/BrandProvider';
import { House, User } from 'lucide-react';

export const Footer = () => {
    const brand = useBrand();

    return (
        <footer className={`py-12 border-t font-sans ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
            <div className="container mx-auto px-4 text-center text-xs leading-relaxed">
                {/* Branded Logo matching MainHeader exactly in style */}
                <div className="mb-6 flex items-center justify-center gap-2">
                    <div className="flex flex-col items-center leading-none text-center">
                        <span className="text-[10px] md:text-[11px] font-black text-slate-400 tracking-tighter mb-1 uppercase select-none">여성전문 고소득 알바 No.1</span>
                        <div className="flex items-center gap-0.5">
                            <span className="text-2xl md:text-3xl font-black tracking-tighter text-pink-600">COCO</span>
                            <span className={`text-2xl md:text-3xl font-black tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>ALBA</span>
                        </div>
                    </div>
                </div>

                {/* Links */}
                <div className="flex justify-center gap-2 md:gap-4 mb-6 font-medium text-[10px] md:text-sm whitespace-nowrap overflow-x-auto no-scrollbar">
                    <Link href="/customer-center?tab=policy" className="hover:text-gray-900 dark:hover:text-white transition-colors">이용약관</Link>
                    <span className="text-gray-300">|</span>
                    <Link href="/customer-center?tab=policy" className="hover:text-gray-900 dark:hover:text-white transition-colors font-bold">개인정보처리방침</Link>
                    <span className="text-gray-300">|</span>
                    <Link href="/customer-center?tab=policy" className="hover:text-gray-900 dark:hover:text-white transition-colors">청소년보호정책</Link>
                    <span className="text-gray-300">|</span>
                    <Link href="/customer-center?tab=inquiry" className="hover:text-gray-900 dark:hover:text-white transition-colors">광고/제휴문의</Link>
                </div>

                {/* Company Info */}
                <div className="space-y-1 mb-6 text-gray-400 text-[11px] md:text-xs text-center">
                    <p>COCOALBA | 대표: 김코코 | 사업자등록번호: 226-13-91078</p>
                    <p>주소: 서울특별시 강남구 테헤란로 123, 4층</p>
                    <p>직업정보제공사업 신고번호: 2024-서울강남-1234</p>
                    <p>고객센터: 1577-9879 (평일 09:00 ~ 18:00)</p>
                    <p>이메일: bizsetter7@gmail.com</p>
                </div>

                {/* Copyright */}
                <div className="text-gray-400/60 text-[10px] md:text-xs">
                    <p className="mb-1">© 2026 COCOALBA. All Rights Reserved.</p>
                    <p>본 사이트는 구인구직 정보의 중개 시스템으로, 정보의 정확성에 대한 책임은 등록자에게 있습니다.</p>
                </div>
            </div>
        </footer>
    );
};
