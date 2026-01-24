'use client';

import React, { useState } from 'react';
import {
    Headphones,
    ChevronDown,
    ChevronUp,
    PhoneCall,
    Mail,
    MessageSquare,
    ArrowLeft,
    Home
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerCenterPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('자주묻는질문');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const toggleFaq = (id: number) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const FAQS = [
        { id: 1, question: '광고비 결제는 어떻게 하나요?', answer: '현재 무통장 입금과 카드 결제를 지원하고 있습니다. 마이페이지 > 광고관리에서 결제 수단을 선택해주세요.' },
        { id: 2, question: '게시글이 삭제되었어요.', answer: '커뮤니티 운영 정책에 위반되는 게시글(욕설, 비방, 광고 등)은 관리자에 의해 예고 없이 삭제될 수 있습니다.' },
        { id: 3, question: '비밀번호를 잊어버렸어요.', answer: '로그인 화면 하단의 "비밀번호 찾기"를 이용해주세요. 이메일 인증 후 재설정이 가능합니다.' },
        { id: 4, question: '업소 회원 승인은 얼마나 걸리나요?', answer: '사업자등록증 제출 후 영업일 기준 24시간 이내에 승인 처리가 완료됩니다.' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            {/* Header */}
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="text-gray-600">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <Headphones className="text-pink-500" size={24} />
                            고객센터
                        </h1>
                    </div>
                    <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600">
                        <Home size={24} />
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 md:py-8">

                <div className="block md:grid md:grid-cols-3 md:gap-8">
                    {/* Contact Info Cards (Left Column on PC) */}
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4 mb-6 md:mb-0 h-fit">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-2 md:py-8">
                            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500">
                                <PhoneCall size={20} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm">전화 상담</h3>
                            <p className="text-xs text-gray-500">평일 10:00 ~ 18:00<br />(점심 12:30 ~ 13:30)</p>
                            <p className="font-black text-lg text-pink-500 mt-1">1544-0000</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-2 md:py-8">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                <MessageSquare size={20} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm">카카오톡 상담</h3>
                            <p className="text-xs text-gray-500">24시간 접수 가능<br />순차 답변</p>
                            <button className="bg-yellow-300 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full mt-1 hover:bg-yellow-400 transition">
                                문의하기
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Tab & Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-gray-200">
                            <button
                                className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === '자주묻는질문' ? 'border-pink-500 text-pink-500' : 'border-transparent text-gray-400'}`}
                                onClick={() => setActiveTab('자주묻는질문')}
                            >
                                자주 묻는 질문
                            </button>
                            <button
                                className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === '1:1문의' ? 'border-pink-500 text-pink-500' : 'border-transparent text-gray-400'}`}
                                onClick={() => setActiveTab('1:1문의')}
                            >
                                1:1 문의
                            </button>
                        </div>

                        {/* FAQ List */}
                        {activeTab === '자주묻는질문' && (
                            <div className="space-y-2">
                                {FAQS.map(faq => (
                                    <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <button
                                            onClick={() => toggleFaq(faq.id)}
                                            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                                        >
                                            <span className="font-bold text-sm text-gray-700 flex gap-2">
                                                <span className="text-pink-500">Q.</span> {faq.question}
                                            </span>
                                            {expandedFaq === faq.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                        </button>
                                        {expandedFaq === faq.id && (
                                            <div className="bg-gray-50 p-4 border-t border-gray-100 text-sm text-gray-600 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 1:1 Inquiry Form */}
                        {activeTab === '1:1문의' && (
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">문의 제목</label>
                                    <input type="text" placeholder="제목을 입력해주세요" className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-pink-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">문의 내용</label>
                                    <textarea placeholder="문의 내용을 자세히 적어주세요." className="w-full border rounded-lg p-3 text-sm h-32 resize-none focus:ring-1 focus:ring-pink-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">이메일 (답변 알림용)</label>
                                    <input type="email" placeholder="example@email.com" className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-pink-500 outline-none" />
                                </div>
                                <button className="w-full bg-pink-500 text-white font-bold py-3.5 rounded-xl hover:bg-pink-600 transition shadow-lg shadow-pink-200">
                                    문의 등록하기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
