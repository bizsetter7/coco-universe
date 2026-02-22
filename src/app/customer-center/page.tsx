'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
    Search, Bell, FileText, HelpCircle, MessageSquare, Shield, Megaphone,
    X, PhoneCall, MessageCircle, ChevronRight, PenBox, List
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useBrand } from '@/components/BrandProvider';
import Header from '@/components/common/MainHeader';
import { Footer } from '@/components/layout/Footer';
import { PaymentPopup } from '@/components/home/PaymentPopup';

// Sub-components & Constants (Imported for Diet)
import { NOTICES, FAQS, AD_TIERS, DETAILED_PRICING, INQUIRY_CATEGORIES } from './constants';
import { CardPaymentNoticeDetail, ResumeNoticeDetail } from './NoticeDetails';
import { ExposureItem } from './ExposureItem';
import { AdGuideTab, TermsTab } from './TabContents';
import { InquiryBoard } from './InquiryBoard';

export default function CustomerCenterPage() {
    const brand = useBrand();
    const { isLoggedIn, user: authUser } = useAuth();
    const [activeTab, setActiveTab] = useState('공지사항');
    const [selectedNotice, setSelectedNotice] = useState<any>(null);
    const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Inquiry State
    const [inquiryMode, setInquiryMode] = useState<'list' | 'write' | 'detail'>('list');
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('title');
    const [isSearching, setIsSearching] = useState(false);
    const [viewingInquiry, setViewingInquiry] = useState<any>(null);
    const [inquiryThread, setInquiryThread] = useState<any[]>([]);
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [inquiryTitle, setInquiryTitle] = useState('');
    const [inquiryContent, setInquiryContent] = useState('');
    const [inquiryContact, setInquiryContact] = useState('');
    const [isSecretInquiry, setIsSecretInquiry] = useState(true);
    const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);
    const [activeCategory, setActiveCategory] = useState('전체');

    const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
    const [paymentInitialTier, setPaymentInitialTier] = useState('grand');

    const itemsPerPage = 15;
    const isAdmin = authUser?.type === 'admin' || authUser?.email === 'admin_user';

    const fetchInquiries = async () => {
        setIsSearching(true);
        let query = supabase.from('inquiries').select('*', { count: 'exact' });

        if (activeCategory !== '전체') query = query.eq('type', activeCategory);
        if (searchQuery) query = query.ilike(searchType, `%${searchQuery}%`);

        query = query.is('parent_id', null).order('created_at', { ascending: false });
        query = query.range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        const { data, count, error } = await query;
        if (!error && data) {
            setInquiries(data);
            setTotalCount(count || 0);
        }
        setIsSearching(false);
    };

    useEffect(() => {
        if (activeTab === '1:1 문의') fetchInquiries();
    }, [activeTab, currentPage, activeCategory]);

    const findNoticeById = (id: number) => NOTICES.find(n => n.id === id);

    const contentPlaceholder = `정확한 답변을 위해 다음 정보를 포함해 주시면 상담이 빨라집니다.
1. 회원 휴대폰 번호 (로그인 계정)
2. 문의 상세 내용 (입금 은행/금액/시간 등)
3. 관련 스크린샷 캡쳐 (첨부 파일 활용)`;

    return (
        <div className={`min-h-screen transition-colors duration-500 ${brand.theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <Header />

            <div className="relative pt-24 pb-32">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Hero Title Area */}
                    <div className="flex flex-col items-center mb-16 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 bg-pink-600/10 px-4 py-1.5 rounded-full border border-pink-500/20 mb-2">
                            <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-ping" />
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-pink-600">Customer Support System</span>
                        </div>
                        <h1 className={`text-4xl md:text-6xl font-black tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>무엇을 도와드릴까요?</h1>
                        <p className={`text-sm md:text-lg font-bold opacity-70 ${brand.theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>COCO 통합 고객센터는 24시간 여러분의 의견에 귀를 기울이고 있습니다.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left: Tab Menu */}
                        <div className="md:w-64 shrink-0 space-y-2">
                            {['공지사항', '광고안내', '이용안내', 'FAQ', '1:1 문의', '약관 및 정책'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setSelectedNotice(null); setInquiryMode('list'); }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl text-sm font-black transition-all ${activeTab === tab
                                        ? 'bg-pink-600 text-white shadow-lg shadow-pink-200 translate-x-1'
                                        : brand.theme === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 bg-white border border-gray-100/50 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{tab}</span>
                                    <ChevronRight size={16} />
                                </button>
                            ))}
                        </div>

                        {/* Right: Content Area */}
                        <div className="flex-1">
                            {activeTab === '공지사항' && (
                                <div className="space-y-4">
                                    {!selectedNotice ? (
                                        NOTICES.map(notice => (
                                            <div
                                                key={notice.id}
                                                onClick={() => setSelectedNotice(notice)}
                                                className={`p-6 rounded-[28px] border transition-all cursor-pointer hover:-translate-y-1 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100 shadow-sm hover:shadow-xl'}`}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${notice.category === '필독' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{notice.category}</span>
                                                    <span className="text-gray-400 text-[11px] font-bold tabular-nums">{notice.date}</span>
                                                </div>
                                                <h3 className={`text-lg font-black leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{notice.title}</h3>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={`p-8 md:p-12 rounded-[45px] border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-xl shadow-gray-100/30'}`}>
                                            <button onClick={() => setSelectedNotice(null)} className="flex items-center gap-2 text-pink-600 font-black text-sm mb-8 hover:-translate-x-1 transition-transform">
                                                <ChevronRight className="rotate-180" size={18} /> 목록으로 돌아가기
                                            </button>
                                            <div className="border-b pb-8 mb-8 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${selectedNotice.category === '필독' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{selectedNotice.category}</span>
                                                    <span className="text-gray-400 text-[11px] font-bold tabular-nums">{selectedNotice.date}</span>
                                                </div>
                                                <h2 className={`text-2xl md:text-3xl font-black leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedNotice.title}</h2>
                                            </div>

                                            {/* Rich Notice Routing */}
                                            {selectedNotice.type === 'card-payment-end' ? <CardPaymentNoticeDetail /> :
                                                selectedNotice.type === 'rich-resume' ? <ResumeNoticeDetail /> :
                                                    <div className={`whitespace-pre-wrap leading-loose text-base font-medium ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{selectedNotice.content}</div>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === '광고안내' && <AdGuideTab brand={brand} setPaymentInitialTier={setPaymentInitialTier} setIsPaymentPopupOpen={setIsPaymentPopupOpen} setSelectedImage={setSelectedImage} />}

                            {activeTab === 'FAQ' && (
                                <div className="space-y-3">
                                    {FAQS.map(faq => (
                                        <div key={faq.id} className={`rounded-[24px] overflow-hidden border transition-all ${selectedFaq === faq.id ? 'border-pink-500 shadow-lg' : brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                                            <button onClick={() => setSelectedFaq(selectedFaq === faq.id ? null : faq.id)} className="w-full flex items-center justify-between p-6">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-pink-600 font-black text-xl italic opacity-50">Q.</span>
                                                    <span className={`text-base font-black text-left ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{faq.question}</span>
                                                </div>
                                                <div className={`transition-transform duration-300 ${selectedFaq === faq.id ? 'rotate-180 text-pink-500' : 'text-gray-300'}`}><ChevronRight size={20} /></div>
                                            </button>
                                            {selectedFaq === faq.id && (
                                                <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
                                                    <div className={`p-5 rounded-2xl leading-relaxed text-[15px] font-medium whitespace-pre-wrap ${brand.theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>{faq.answer}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === '1:1 문의' && (
                                <InquiryBoard
                                    {...{ inquiryMode, setInquiryMode, inquiries, totalCount, currentPage, setCurrentPage, itemsPerPage, searchQuery, setSearchQuery, searchType, setSearchType, handleSearch: fetchInquiries, isSearching, viewingInquiry, setViewingInquiry, inquiryThread, setInquiryThread, isPasswordVerified, setIsPasswordVerified, passwordInput, setPasswordInput, inquiryTitle, setInquiryTitle, inquiryContent, setInquiryContent, inquiryContact, setInquiryContact, isSecretInquiry, setIsSecretInquiry, isInquirySubmitting, handleSubmitInquiry: () => { }, handleSubmitComment: () => { }, isAdmin, brand, isLoggedIn, contentPlaceholder }}
                                />
                            )}

                            {activeTab === '약관 및 정책' && <TermsTab brand={brand} />}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {isPaymentPopupOpen && <PaymentPopup isOpen={isPaymentPopupOpen} onClose={() => setIsPaymentPopupOpen(false)} initialTier={paymentInitialTier} />}

            {selectedImage && createPortal(
                <div className="fixed inset-0 z-[20000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                    <Image src={selectedImage} alt="Preview" width={1000} height={1500} className="max-w-full max-h-[90vh] object-contain rounded-2xl" />
                    <button className="absolute top-10 right-10 text-white" onClick={() => setSelectedImage(null)}><X size={32} /></button>
                </div>, document.body
            )}
        </div>
    );
}
