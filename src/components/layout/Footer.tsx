'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ReportAdModal } from '@/components/common/ReportAdModal';

const HOT_PINK = '#f82b60';

// ── 최저임금: 매년 1월 아래 두 값만 수정 ──────────────────
const MIN_WAGE_YEAR = 2026;
const MIN_WAGE_AMOUNT = '10,320';
// ────────────────────────────────────────────────────────────

const NAV_LINKS = [
    { label: '광고등록안내', href: '/customer-center?tab=ad' },
    { label: '광고/제휴문의', href: '/customer-center?tab=inquiry' },
    { label: '이용약관', href: '/customer-center?tab=policy' },
    { label: '개인정보처리방침', href: '/customer-center?tab=policy' },
    { label: '청소년보호정책', href: '/customer-center?tab=policy' },
    { label: '커뮤니티', href: '/community' },
] as const;

export const Footer = () => {
    const [reportOpen, setReportOpen] = useState(false);

    return (
        <>
            <footer className="border-t border-gray-200 bg-gray-50 font-sans text-gray-500">
                <div className="w-full max-w-5xl mx-auto px-6">

                    {/* ── PC: LADYALBA 스타일 4열 ─────────────────────── */}
                    <div className="hidden md:flex items-start justify-between gap-0 py-8 border-b border-gray-200">

                        {/* 1열: 고객센터 + 전화번호 */}
                        <div className="shrink-0 pr-6 border-r border-gray-200">
                            <p className="text-xs font-black mb-2" style={{ color: HOT_PINK }}>고객센터</p>
                            <p className="text-[2.8rem] font-black text-gray-900 tracking-tight leading-none">
                                1877-1442
                            </p>
                        </div>

                        {/* 2열: 운영시간 + 이메일 */}
                        <div className="shrink-0 px-6 text-xs space-y-2.5 self-start pt-0.5">
                            <p>
                                <span className="font-black mr-2" style={{ color: HOT_PINK }}>평일</span>
                                10:00 ~ 18:00 (주말·공휴일 휴무)
                            </p>
                            <p>
                                <span className="font-black mr-2" style={{ color: HOT_PINK }}>점심</span>
                                12:00 ~ 13:00
                            </p>
                            <p>
                                <span className="font-black mr-2">E-mail</span>
                                <a href="mailto:bizsetter7@gmail.com" className="hover:underline">
                                    bizsetter7@gmail.com
                                </a>
                            </p>
                        </div>

                        {/* 3열: 최저임금 */}
                        <div className="shrink-0 px-6 border-l border-gray-200 text-xs space-y-1">
                            <p className="font-black mb-2" style={{ color: HOT_PINK }}>
                                {MIN_WAGE_YEAR}년 최저임금
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-gray-900">
                                    {MIN_WAGE_AMOUNT}원
                                </span>
                                <a
                                    href="https://www.minimumwage.go.kr"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold hover:underline text-xs"
                                    style={{ color: HOT_PINK }}
                                >
                                    더보기 &gt;
                                </a>
                            </div>
                            <a
                                href="https://www.moel.go.kr/info/defaulter/defaulterList.do"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold hover:underline block"
                                style={{ color: HOT_PINK }}
                            >
                                임금체불사업주 명단 확인하기 &gt;
                            </a>
                        </div>

                        {/* 4열: 무통장입금 */}
                        <div className="shrink-0 pl-6 border-l border-gray-200">
                            <p className="text-sm font-black mb-1.5 whitespace-nowrap" style={{ color: HOT_PINK }}>무통장입금안내</p>
                            <p className="text-lg font-black text-gray-900 tracking-tight leading-snug whitespace-nowrap">토스&nbsp;&nbsp;1002-4683-1712</p>
                            <p className="text-sm text-gray-400 mt-1 whitespace-nowrap">예금주 : 고남우(초코아이디어)</p>
                        </div>

                    </div>

                    {/* ── 모바일: 2열 (고객센터 | 무통장입금) ──────────────── */}
                    <div className="md:hidden py-4 border-b border-gray-200">
                        <div className="flex items-stretch gap-0">
                            {/* 좌측: 고객센터 */}
                            <div className="flex-1 pr-4 border-r border-gray-200">
                                <p className="text-[9px] font-black tracking-wide uppercase mb-1" style={{ color: HOT_PINK }}>고객센터</p>
                                <p className="text-[1.75rem] font-black leading-none tracking-tight" style={{ color: HOT_PINK }}>1877-1442</p>
                                <p className="mt-2 text-[9px] text-gray-400 leading-[1.6]">
                                    평일 10:00 ~ 18:00 (점심 12:00~13:00)<br />
                                    토/일/공휴일은 휴무<br />
                                    게시판을 이용해주세요.
                                </p>
                            </div>
                            {/* 우측: 무통장입금 */}
                            <div className="flex-1 pl-4 flex flex-col justify-center">
                                <p className="text-[9px] font-black tracking-wide uppercase mb-1" style={{ color: HOT_PINK }}>무통장 입금안내</p>
                                <p className="text-[10px] font-bold text-gray-500 mb-0.5">토스뱅크</p>
                                <p className="text-base font-black text-gray-900 leading-tight tracking-tight">1002-4683-1712</p>
                                <p className="mt-1.5 text-[9px] text-gray-400">예금주 : 고남우(초코아이디어)</p>
                            </div>
                        </div>
                    </div>

                    {/* ── 네비 링크 (PC) ──────────────────────────────────── */}
                    <div className="hidden md:flex flex-wrap justify-between items-center gap-x-0 gap-y-1.5 py-4 border-b border-gray-200 text-sm font-medium">
                        {NAV_LINKS.map(({ label, href }) => (
                            <React.Fragment key={label}>
                                <Link
                                    href={href}
                                    className="hover:text-gray-900 transition-colors whitespace-nowrap"
                                    style={label === '개인정보처리방침' ? { fontWeight: 700, color: '#374151' } : {}}
                                >
                                    {label}
                                </Link>
                                <span className="text-gray-300 select-none">|</span>
                            </React.Fragment>
                        ))}
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-note-modal', { detail: { receiver: 'admin' } }))}
                            className="hover:text-gray-900 transition-colors whitespace-nowrap"
                        >
                            관리자쪽지
                        </button>
                    </div>

                    {/* ── 네비 링크 (모바일) — 3개만 표시 ─────────────────── */}
                    <div className="md:hidden flex justify-center items-center gap-x-3 py-3 border-b border-gray-200 text-[11px] font-medium">
                        <Link href="/customer-center?tab=policy" className="hover:text-gray-900 transition-colors whitespace-nowrap font-bold text-gray-700">
                            개인정보처리방침
                        </Link>
                        <span className="text-gray-300 select-none">|</span>
                        <Link href="/customer-center?tab=policy" className="hover:text-gray-900 transition-colors whitespace-nowrap">
                            이용약관
                        </Link>
                        <span className="text-gray-300 select-none">|</span>
                        <Link href="/customer-center?tab=policy" className="hover:text-gray-900 transition-colors whitespace-nowrap">
                            청소년보호정책
                        </Link>
                    </div>

                    {/* ── 사업자 정보 (PC) ─────────────────────────────────── */}
                    <div className="hidden md:flex py-5 items-start gap-6">
                        {/* 3가지 링크 (좌측 컬럼) */}
                        <div className="shrink-0 border-r border-gray-200 pr-6 text-[11px] text-gray-500 space-y-2 min-w-[110px]">
                            <button
                                onClick={() => setReportOpen(true)}
                                className="flex items-center justify-between w-full hover:text-gray-900 font-medium transition-colors text-left"
                            >
                                <span>허위광고 신고</span>
                                <span className="ml-2 text-gray-400">&gt;</span>
                            </button>
                            <Link
                                href="/notice/job-scam"
                                className="flex items-center justify-between w-full hover:text-gray-900 font-medium transition-colors"
                            >
                                <span>취업사기 주의</span>
                                <span className="ml-2 text-gray-400">&gt;</span>
                            </Link>
                            <a
                                href="https://www.moel.go.kr/info/defaulter/list.do"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between w-full hover:text-gray-900 font-medium transition-colors"
                            >
                                <span>체불사업자 명단</span>
                                <span className="ml-2 text-gray-400">&gt;</span>
                            </a>
                        </div>
                        {/* 사업자 정보 텍스트 */}
                        <div className="text-[11px] text-gray-400 space-y-1 leading-relaxed">
                            <p>주소: 경기도 평택시 지산로12번길 93, 2층(지산동)&nbsp;&nbsp;|&nbsp;&nbsp;초코아이디어</p>
                            <p>
                                사업자등록번호: 226-13-91078&nbsp;&nbsp;|&nbsp;&nbsp;
                                통신판매업신고번호 : 제 2017-경기송탄-0029호&nbsp;&nbsp;|&nbsp;&nbsp;
                                직업정보제공사업신고번호 : J1806020260001
                            </p>
                            <p>개인정보 및 이용관리 : bizsetter7@gmail.com</p>
                            <p>
                                유흥알바, 밤알바, 룸알바, 여성전문 고소득 업소알바 정보&nbsp;&nbsp;·&nbsp;&nbsp;COPYRIGHT (c) COCOALBA. ALL RIGHTS RESERVED.
                            </p>
                        </div>
                    </div>

                    {/* ── 사업자 정보 (모바일) ─────────────────────────────── */}
                    <div className="md:hidden py-3 text-center text-[9px] text-gray-400 space-y-0.5 leading-[1.5]">
                        <p>경기도 평택시 지산로12번길 93, 2층(지산동)</p>
                        <p>사업자등록번호 : 226-13-91078&nbsp;&nbsp;|&nbsp;&nbsp;초코아이디어</p>
                        <p>통신판매업신고번호 : 제 2017-경기송탄-0029호</p>
                        <p>직업정보제공사업신고번호 : J1806020260001</p>
                        <p>개인정보 및 이용관리 : bizsetter7@gmail.com</p>
                        <p className="pt-1.5 text-gray-400/70">유흥알바, 밤알바, 룸알바, 여성전문 고소득 업소알바 정보</p>
                        <p className="text-gray-400/50">COPYRIGHT (c) COCOALBA. ALL RIGHTS RESERVED.</p>
                    </div>

                </div>
            </footer>

            {reportOpen && <ReportAdModal onClose={() => setReportOpen(false)} />}
        </>
    );
};
