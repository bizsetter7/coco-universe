'use client';

import React from 'react';
import { ShieldCheck, Users, TrendingUp, CheckCircle, Mail, Phone, Lock, User } from 'lucide-react';

export const AuditLanding = () => {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
            {/* Simple Top Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="text-white" size={20} />
                        </div>
                        <span className="text-lg font-black tracking-tight text-slate-900 uppercase">초코아이디어</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
                        <a href="#about" className="hover:text-blue-600 transition-colors">서비스 소개</a>
                        <a href="#features" className="hover:text-blue-600 transition-colors">주요 기능</a>
                        <a href="#contact" className="hover:text-blue-600 transition-colors">고객 지원</a>
                    </div>
                    <button className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-800 transition-all">
                        파트너십 문의
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-10 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 mb-6">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Next-Gen Business Solution</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                        귀하의 성장을 위한<br />
                        <span className="text-blue-600">완벽한 비즈니스 파트너</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        초코아이디어는 효율적인 인재 매칭과 전략적인 마케팅 솔루션을 제공하여
                        귀하의 비즈니스가 더 높은 곳으로 도약할 수 있도록 지원합니다.
                    </p>
                </div>
            </section>

            {/* [New] Simplified Login Box */}
            <section className="pb-20 px-6">
                <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
                    <div className="relative z-10">
                        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Lock size={18} className="text-blue-600" /> 파트너 로그인
                        </h2>
                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="아이디"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    placeholder="비밀번호"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <button className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform active:scale-[0.98]">
                                로그인하기
                            </button>
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 pt-2">
                                <div className="flex gap-4">
                                    <span className="cursor-pointer hover:text-slate-600">아이디 찾기</span>
                                    <span className="cursor-pointer hover:text-slate-600">비밀번호 찾기</span>
                                </div>
                                <span className="text-blue-600 cursor-pointer">회원가입</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Users size={24} />,
                                title: "스마트 매칭 시스템",
                                desc: "전문성을 가진 검증된 인력을 최적의 조건으로 연결해 드립니다."
                            },
                            {
                                icon: <TrendingUp size={24} />,
                                title: "실시간 마케팅 분석",
                                desc: "데이터 기반의 실시간 리포트를 통해 마케팅 성과를 극대화합니다."
                            },
                            {
                                icon: <CheckCircle size={24} />,
                                title: "전문가 지원 플랫폼",
                                desc: "비즈니스 운영에 필요한 각종 리소스와 전문 가이드를 제공합니다."
                            }
                        ].map((f, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{f.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: "활성 파트너", val: "2,500+" },
                            { label: "누적 매칭 수", val: "48,000+" },
                            { label: "사용자 만족도", val: "99.2%" },
                            { label: "평균 매출 성장", val: "24.5%" }
                        ].map((s, i) => (
                            <div key={i}>
                                <div className="text-3xl font-black text-blue-600 mb-2">{s.val}</div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-6">
                <div className="max-w-3xl mx-auto bg-slate-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-6 italic">Ready to Scale Your Business?</h2>
                        <p className="text-slate-400 mb-10 font-medium leading-relaxed">
                            초코아이디어는 투명하고 효율적인 시장 환경을 조성하기 위해 최선을 다합니다.<br />
                            문의사항은 아래 연락처를 통해 언제든 전달 부탁드립니다.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 text-sm font-bold">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-blue-400" />
                                <span>bizsetter7@gmail.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-blue-400" />
                                <span>010.3838.4335</span>
                            </div>
                        </div>
                    </div>
                    {/* Decor Accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 grayscale group-hover:grayscale-0 transition-all">
                        <ShieldCheck className="text-slate-400" size={20} />
                        <span className="text-sm font-black text-slate-400 uppercase tracking-tighter">초코아이디어</span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium text-center md:text-right">
                        <div>&copy; 2026 초코아이디어 Inc. All Rights Reserved.</div>
                        <div className="mt-1">
                            대표자: 김대순 | 사업장주소: 경기도 평택시 지산로12번길 93, 2층 | 통신판매번호: 2017-경기송탄-0029
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
