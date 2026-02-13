'use client';

import React from 'react';
import Link from 'next/link';
import { useBrand } from '@/components/BrandProvider';
import { House } from 'lucide-react';

export const Footer = () => {
    const brand = useBrand();

    return (
        <footer className={`py-12 border-t font-sans ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
            <div className="container mx-auto px-4 text-center text-xs leading-relaxed">
                {/* Branded Logo matching MainHeader exactly in style */}
                <div className="mb-6 flex items-center justify-center gap-1.5 mt-1">
                    <House size={22} strokeWidth={3} className="text-pink-500" />
                    <span className="text-xl md:text-2xl font-black tracking-tighter text-pink-500">
                        COCOALBA
                    </span>
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
