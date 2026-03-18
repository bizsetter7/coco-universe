'use client';

import React from 'react';
import Link from 'next/link';

const HOT_PINK = '#f82b60';

// ── 최저임금: 매년 1월 아래 두 값만 수정 ──────────────────
const MIN_WAGE_YEAR = 2026;
const MIN_WAGE_AMOUNT = '10,320';
// ────────────────────────────────────────────────────────────

const NAV_LINKS = [
    { label: '광고등록안내', href: '/guide' },
    { label: '광고/제휴문의', href: '/customer-center?tab=inquiry' },
    { label: '이용약관', href: '/customer-center?tab=policy' },
    { label: '개인정보처리방침', href: '/customer-center?tab=policy' },
    { label: '청소년보호정책', href: '/customer-center?tab=policy' },
    { label: '커뮤니티', href: '/community' },
    { label: '관리자쪽지', href: '#' },
] as const;

/** 임금체불사업주 확인 배지 (CSS 구현) */
const WageBadge = () => (
    <a
        href="https://www.moel.go.kr/info/defaulter/defaulterList.do"
        target="_blank"
        rel="noopener noreferrer"
        title="임금체불사업주 명단 확인"
        className="shrink-0 flex flex-col items-center justify-center w-[76px] h-[76px] rounded-full hover:opacity-80 transition-opacity select-none"
        style={{
            background: 'radial-gradient(circle at 38% 32%, #f87171, #b91c1c)',
            boxShadow: '0 3px 12px rgba(185,28,28,0.45)',
        }}
    >
        <span className="text-white font-black text-xl leading-none mb-0.5">₩</span>
        <span className="text-white font-black text-[7px] leading-tight">임금체불</span>
        <span className="text-white font-black text-[7px] leading-tight">사업주확인</span>
    </a>
);

export const Footer = () => {
    return (
        <footer className="border-t border-gray-100 bg-gray-50 font-sans text-gray-500">
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12">

                {/* ── PC: 3열 정보 그리드 ─────────────────────────────── */}
                <div className="hidden md:grid md:grid-cols-3 gap-0 py-10 border-b border-gray-200">

                    {/* 고객센터 */}
                    <div className="space-y-2 pr-12">
                        <p className="text-sm font-black mb-3" style={{ color: HOT_PINK }}>고객센터</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tight">1877-1442</p>
                        <p className="text-sm text-gray-500">평일 10:00 ~ 18:00 (주말·공휴일 휴무)</p>
                        <p className="text-sm text-gray-500">점심 12:00 ~ 13:00</p>
                        <p className="text-sm text-gray-500 mt-1">
                            E-mail&nbsp;
                            <a href="mailto:bizsetter7@gmail.com" className="font-semibold hover:underline">
                                bizsetter7@gmail.com
                            </a>
                        </p>
                    </div>

                    {/* 최저임금 */}
                    <div className="space-y-2 px-12 border-x border-gray-200">
                        <p className="text-sm font-black mb-3" style={{ color: HOT_PINK }}>
                            {MIN_WAGE_YEAR}년 최저임금
                        </p>
                        <div className="flex items-baseline gap-3">
                            <p className="text-3xl font-black text-gray-900">
                                {MIN_WAGE_AMOUNT}원
                            </p>
                            <a
                                href="https://www.minimumwage.go.kr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-bold hover:underline"
                                style={{ color: HOT_PINK }}
                            >
                                더보기 &gt;
                            </a>
                        </div>
                        <div className="pt-1">
                            <a
                                href="https://www.moel.go.kr/info/defaulter/defaulterList.do"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-bold hover:underline"
                                style={{ color: HOT_PINK }}
                            >
                                임금체불사업주 명단 확인하기 &gt;
                            </a>
                        </div>
                    </div>

                    {/* 무통장입금 */}
                    <div className="space-y-2 pl-12">
                        <p className="text-sm font-black mb-3" style={{ color: HOT_PINK }}>무통장입금안내</p>
                        <p className="text-sm font-black text-gray-900">토스</p>
                        <p className="text-3xl font-black text-gray-900 tracking-tight">1002-4683-1712</p>
                        <p className="text-sm text-gray-500">예금주 : 고남우(초코아이디어)</p>
                    </div>
                </div>

                {/* ── 모바일: 세로 쌓기 ────────────────────────────────── */}
                <div className="md:hidden py-5 space-y-5 border-b border-gray-200 text-xs">
                    <div>
                        <p className="text-[10px] font-black mb-1" style={{ color: HOT_PINK }}>고객센터</p>
                        <p className="text-xl font-black text-gray-900">1877-1442</p>
                        <p>평일 10:00~18:00 · 점심 12:00~13:00</p>
                        <p>bizsetter7@gmail.com</p>
                    </div>
                    <div className="flex gap-8">
                        <div>
                            <p className="text-[10px] font-black mb-1" style={{ color: HOT_PINK }}>{MIN_WAGE_YEAR}년 최저임금</p>
                            <p className="text-base font-black text-gray-900">{MIN_WAGE_AMOUNT}원</p>
                            <a
                                href="https://www.moel.go.kr/info/defaulter/defaulterList.do"
                                target="_blank" rel="noopener noreferrer"
                                className="text-[9px] font-bold" style={{ color: HOT_PINK }}
                            >
                                임금체불사업주 확인 &gt;
                            </a>
                        </div>
                        <div>
                            <p className="text-[10px] font-black mb-1" style={{ color: HOT_PINK }}>무통장입금</p>
                            <p className="font-black text-gray-900">1002-4683-1712</p>
                            <p className="text-[9px]">예금주 : 고남우(초코아이디어)</p>
                        </div>
                    </div>
                </div>

                {/* ── 네비 링크 ───────────────────────────────────────── */}
                <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1.5 py-5 border-b border-gray-200 text-[10px] md:text-sm font-medium">
                    {NAV_LINKS.map(({ label, href }, i) => (
                        <React.Fragment key={label}>
                            <Link
                                href={href}
                                className="hover:text-gray-900 transition-colors whitespace-nowrap"
                                style={label === '개인정보처리방침' ? { fontWeight: 700, color: '#374151' } : {}}
                            >
                                {label}
                            </Link>
                            {i < NAV_LINKS.length - 1 && (
                                <span className="text-gray-300 select-none">|</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* ── 사업자 정보 + 배지 ──────────────────────────────── */}
                <div className="py-6 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                    <WageBadge />
                    <div className="text-[10px] md:text-xs text-gray-400 space-y-1 leading-relaxed">
                        <p>
                            주소: 경기도 평택시 지산로12번길 93, 2층(지산동)&nbsp;&nbsp;|&nbsp;&nbsp;초코아이디어
                        </p>
                        <p>
                            사업자등록번호: 226-13-91078&nbsp;&nbsp;|&nbsp;&nbsp;
                            통신판매업신고번호 : 제 2017-경기송탄-0029호&nbsp;&nbsp;|&nbsp;&nbsp;
                            직업정보제공사업신고번호 : J1806020260001
                        </p>
                        <p>유흥알바, 밤알바, 룸알바, 여성전문 고소득 업소알바 정보</p>
                        <p className="text-gray-400/60 pt-0.5">
                            COPYRIGHT (c) COCOALBA. ALL RIGHTS RESERVED.
                        </p>
                    </div>
                </div>

            </div>
        </footer>
    );
};
