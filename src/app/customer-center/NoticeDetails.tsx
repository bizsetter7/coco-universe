'use client';

import React from 'react';
import { CreditCard, AlertTriangle, Phone, Zap, AlertCircle, Monitor, Smartphone, ArrowRight, UserCheck, Info, X } from 'lucide-react';

export const CardPaymentNoticeDetail = () => {
    const pinkColor = "#FF1B51";

    return (
        <div className="flex flex-col py-6 md:py-10 max-w-4xl mx-auto space-y-8 font-sans">
            <div className="text-center space-y-4">
                <div
                    className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-100"
                    style={{ color: pinkColor }}
                >
                    <CreditCard size={32} />
                </div>
                <h4 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter break-keep">
                    카드 결제 서비스 종료 및<br />
                    무통장 입금 방식 전환 안내
                </h4>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 md:p-10 shadow-sm space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-lg">
                        <AlertTriangle size={20} style={{ color: pinkColor }} />
                        <span>서비스 변경 안내</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed break-keep font-medium">
                        안녕하세요. <span className="font-bold text-gray-900 dark:text-white">COCO 코코알바</span>입니다.<br />
                        현재 카드사 및 결제 시스템 상의 정책 변경으로 인해, 부득이하게 카드 결제 기능이 종료됨을 안내드립니다.
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl border-l-4" style={{ borderColor: pinkColor }}>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm md:text-base">
                                <span className="font-bold whitespace-nowrap" style={{ color: pinkColor }}>• 종료 일시:</span>
                                <span className="font-black text-gray-900 dark:text-white">2025년 6월 21일(토) 00:00부</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm md:text-base">
                                <span className="font-bold whitespace-nowrap" style={{ color: pinkColor }}>• 변경 사항:</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">채용 공고 등록 시 무통장 입금만 이용 가능</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 font-medium leading-relaxed break-keep text-gray-600 dark:text-gray-400 text-[13px] md:text-sm">
                    <p className="flex gap-2">
                        <span className="shrink-0 text-red-500">📌</span>
                        <span>카드사 측 분류 기준에 따라 유흥 업종은 카드 결제 등록이 제한된 업종에 해당되며, 이로 인해 본 사이트에서도 카드 결제 기능을 종료하게 된 점 양해 부탁드립니다.</span>
                    </p>
                    <p className="flex gap-2">
                        <span className="shrink-0 text-red-500">📌</span>
                        <span>추후 결제 환경이 개선될 경우 카드 결제 기능이 다시 제공될 수 있으며, 관련 내용은 별도 공지를 통해 안내드리겠습니다.</span>
                    </p>
                </div>

                <p className="text-center pt-4 text-gray-500 text-xs md:text-sm font-bold border-t border-gray-50">
                    항상 코코알바를 이용해 주셔서 감사드리며,<br />
                    보다 안정적인 서비스 제공을 위해 노력하겠습니다.<br />
                    감사합니다.
                </p>
            </div>

            <div
                className="py-5 px-6 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: pinkColor }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <Phone size={20} fill="white" />
                    <span className="text-lg md:text-xl font-black">코코알바 고객센터 1577-9879</span>
                </div>
                <p className="text-[9px] opacity-70 uppercase tracking-widest font-bold">
                    Copyright(c) 2026 COCOALBA All Rights Reserved.
                </p>
            </div>
        </div>
    );
};

export const ResumeNoticeDetail = () => {
    return (
        <div className="flex flex-col items-center py-6 md:py-10 px-1 md:px-0 max-w-4xl mx-auto space-y-10 md:space-y-12">
            <div className="text-center space-y-2">
                <p className="text-gray-900 font-black text-xl md:text-2xl tracking-tighter">이력서 등록 시</p>
                <h4 className="text-4xl md:text-5xl font-black text-[#E14D2A] tracking-tighter break-keep">구직자 주의사항!</h4>
            </div>

            <div className="w-full bg-[#E14D2A] rounded-[30px] md:rounded-[40px] p-6 md:p-12 text-center text-white relative shadow-xl shadow-red-100/50">
                <div className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl rotate-12 flex items-center justify-center shadow-lg border-4 border-[#E14D2A]">
                    <div className="animate-pulse">
                        <Zap size={32} className="md:size-[40px] text-[#E14D2A] fill-current" />
                    </div>
                </div>
                <div className="pt-6 space-y-4">
                    <h5 className="text-2xl md:text-3xl font-black leading-tight break-keep">
                        구직자분들의 피해 방지를 위해<br />
                        이력서 등록 시 반드시 주의하세요.
                    </h5>
                    <div className="h-px bg-white/20 w-full"></div>
                    <div className="space-y-2 text-sm md:text-base font-bold text-red-50 leading-relaxed opacity-90 break-keep">
                        <p>최근 불법 성매매 업소 및 보이스 피싱 등으로 인한</p>
                        <p>피해 사례가 발생하고 있습니다.</p>
                        <p className="mt-4 pt-4 border-t border-white/10">회원님들의 피해 방지와 투명한 구인 활동을 위해</p>
                        <p>이력서 등록 시 주의 사항 및 대처 방법을 안내 드립니다.</p>
                    </div>
                </div>
            </div>

            <div className="w-full space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                    <h6 className="text-xl md:text-2xl font-black text-gray-900 bg-red-50 px-6 py-3 rounded-full border border-red-100 shadow-sm">
                        면접 시 주의 사항 및 대처 방법
                    </h6>
                </div>

                <div className="text-center space-y-4 px-4 py-8 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                    <p className="text-lg md:text-xl font-black text-gray-900 break-keep">
                        구직자분들께서는 기업에서 먼저 연락이 올 시<br />
                        <span className="text-red-600 underline decoration-red-200 underline-offset-4">진행중인 채용공고를 요청하시어</span><br />
                        정보와 공고의 기업정보를 반드시 확인해 주세요.
                    </p>
                    <p className="text-sm font-bold text-gray-500">대면과 유선 상담에 대해서는 신중히 주의를 기울여 주시기 바랍니다.</p>
                </div>
            </div>

            <div className="w-full space-y-4">
                {[
                    "기업의 구체적인 정보를 알려주지 않고, 선물을 먼저 보내려고 하는 경우",
                    "상호명이 아닌 별도의 개인이나 연락처 등은 곳에서 면접을 보자고 하는 경우",
                    "통장, 원본, 인감 등 개인정보를 요구하는 경우 (보이스 피싱, 대출 등 사기 주의)",
                    "취업을 조건으로 보증금, 선입금 등 금전을 요구하는 경우",
                    "유흥비 대출 기만을 제의하는 경우 (보이스 피싱 및 성매매 등 불법 유입 주의)",
                    "그 외 채용공고의 내용과 다른 직무를 제안하거나 유도하는 경우"
                ].map((item, i) => (
                    <div key={i} className="group relative flex items-center bg-[#E14D2A] text-white p-5 md:p-6 rounded-full shadow-md transition-transform hover:-translate-y-1">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-[#E14D2A] rounded-full flex items-center justify-center text-lg md:text-xl font-black shrink-0 shadow-sm">
                            {i + 1}
                        </div>
                        <p className="flex-1 ml-4 md:ml-6 text-sm md:text-[17px] font-black leading-tight break-keep">
                            {item}
                        </p>
                    </div>
                ))}
            </div>

            <div className="w-full space-y-4 md:space-y-6">
                <div className="bg-[#E14D2A]/90 text-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] flex items-start gap-4 md:gap-6 shadow-lg border-2 border-white/20">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-red-600 shrink-0 shadow-sm">
                        <X size={24} className="md:size-[32px]" />
                    </div>
                    <p className="text-[15px] md:text-lg font-black leading-normal pt-0.5 md:pt-1 break-keep">
                        통장, 체크카드, 계좌 비밀번호, 개인정보 요구는<br />
                        취업을 빙자한 보이스 피싱 사기 행위일 수 있습니다.
                    </p>
                </div>

                <div className="bg-[#E14D2A]/80 text-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] flex items-start gap-4 md:gap-6 shadow-lg border-2 border-white/20">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-red-600 shrink-0 shadow-sm">
                        <Zap size={24} className="md:size-[32px]" />
                    </div>
                    <p className="text-[15px] md:text-lg font-black leading-normal pt-0.5 md:pt-1 break-keep">
                        고수익이 가능하다고 현혹하는 업제의 광고는<br />
                        불법 성매매 광고일 가능성이 높으니 각별히 주의해 주세요.
                    </p>
                </div>
            </div>

            <div className="w-full text-center space-y-2 py-6 border-y border-red-50">
                <p className="text-[#E14D2A] text-sm md:text-base font-black break-keep">
                    저희 브랜드 통합 시스템은 불법 행위 예방을 위해 최선을 다하고 있으며,<br />
                    회원분들의 안전하고 건강한 구인활동을 위해 지속적인 상시모니터링을 진행하고 있습니다.
                </p>
            </div>

            <div className="w-full space-y-10">
                <h6 className="text-center text-2xl font-black text-gray-900">내 연락처 노출 설정 가이드</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-6 text-center">
                        <span className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest">Guide (PC버전)</span>
                        <div className="relative group overflow-hidden rounded-[30px] md:rounded-[40px] border-4 border-slate-100 shadow-xl bg-white p-8 md:p-10 space-y-6">
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-pink-500 transition-colors">
                                    <Monitor size={28} className="md:size-[32px]" />
                                </div>
                                <ArrowRight size={20} className="text-slate-200 md:size-[24px]" />
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-100 scale-110">
                                    <UserCheck size={28} className="md:size-[32px]" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[15px] md:text-base font-black text-gray-900 leading-snug">
                                    상단메뉴 {'>'} 마이페이지<br />
                                    {'>'} 연락처 노출 설정 OFF
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 text-center">
                        <span className="inline-block px-4 py-1.5 bg-pink-600 text-white rounded-full text-xs font-black uppercase tracking-widest">Guide (모바일버전)</span>
                        <div className="relative group overflow-hidden rounded-[30px] md:rounded-[40px] border-4 border-pink-50 shadow-xl bg-white p-8 md:p-10 space-y-6">
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-300 group-hover:text-pink-500 transition-colors">
                                    <Smartphone size={28} className="md:size-[32px]" />
                                </div>
                                <ArrowRight size={20} className="text-pink-100 md:size-[24px]" />
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200 scale-110">
                                    <Info size={28} className="md:size-[32px]" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[15px] md:text-base font-black text-gray-900 leading-snug">
                                    하단 바 메뉴 {'>'} MY<br />
                                    {'>'} 개인정보 관리 {'>'} 수동 노출
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full pt-10 border-t border-red-100 flex flex-col items-center gap-2">
                <p className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    고객센터 <span className="text-[#E14D2A]">1544-5568</span>
                </p>
                <div className="text-center">
                    <p className="text-sm font-black text-red-600 mb-1">고객센터 운영시간</p>
                    <p className="text-xs font-bold text-gray-500">(평일 09:30~19:00 / 점심시간 12:00~13:30)</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">* 주말 및 공휴일은 고객센터 휴무입니다.</p>
                </div>
            </div>
        </div>
    );
};
