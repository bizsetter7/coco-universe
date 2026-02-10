'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, AlertTriangle, Laptop, Eye, Store, List, LogOut,
    CreditCard, User, Star, Briefcase, MessageCircle, Home,
    FileText, Check, Settings, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBrand } from '@/components/BrandProvider';
import { INDUSTRY_DATA, REGION_DATA, PAY_TYPES } from './page';

// --- Types ---
interface ModalProps {
    brand: any;
    onClose: () => void;
}

interface WarningModalProps extends ModalProps {
    onConfirm: () => void;
}

interface DesignsModalProps extends ModalProps { }

interface PreviewModalProps extends ModalProps {
    formData: any;
}

interface MobileMenuProps {
    brand: any;
    onClose: () => void;
    setView: (view: any) => void;
    shopName: string;
    nickname: string;
    router: any;
}

interface PersonalMobileMenuProps {
    brand: any;
    onClose: () => void;
    setView: (view: any) => void;
    router: any;
}

// --- Components ---

export const WarningModal: React.FC<WarningModalProps> = ({ brand, onClose, onConfirm }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div className={`rounded-[32px] shadow-2xl max-w-sm w-full p-8 text-center space-y-6 transform animate-in fade-in zoom-in duration-200 ${brand.theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 border-4 shadow-sm ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-pink-50 border-white'}`}>
                    <AlertTriangle size={40} className="text-pink-500" />
                </div>
                <h3 className={`text-2xl font-black tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>게시글 작성 전 필독! 📢</h3>
                <div className={`text-left text-[13px] p-6 rounded-2xl space-y-3 leading-relaxed border font-bold ${brand.theme === 'dark' ? 'bg-gray-800/50 text-gray-300 border-gray-700' : 'bg-gray-50/80 text-gray-700 border-gray-100'}`}>
                    <p className="flex gap-3">
                        <span className="text-pink-500 font-black shrink-0">1.</span>
                        <span>월 수정횟수는 <strong className={`${brand.theme === 'dark' ? 'text-white' : 'text-black'} font-black`}>30회</strong> 입니다.</span>
                    </p>
                    <p className="flex gap-3">
                        <span className="text-pink-500 font-black shrink-0">2.</span>
                        <span>금칙어 사용 시 <strong className={`${brand.theme === 'dark' ? 'text-white' : 'text-black'} font-black`}>통보 없이 삭제</strong>될 수 있습니다.</span>
                    </p>
                    <p className="flex gap-3">
                        <span className="text-pink-500 font-black shrink-0">3.</span>
                        <span>본문 내용은 <strong className={`${brand.theme === 'dark' ? 'text-white' : 'text-black'} font-black`}>1000자 이내</strong>로 작성해주세요.</span>
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={onClose} className={`py-4 rounded-xl border-2 font-bold transition-colors ${brand.theme === 'dark' ? 'border-gray-800 text-gray-500 hover:bg-gray-800' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}>취소</button>
                    <button onClick={onConfirm} className="py-4 rounded-xl bg-[#ff3399] text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-pink-100/10">확인 후 작성</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const DesignRequestModal: React.FC<DesignsModalProps> = ({ brand, onClose }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div className={`rounded-[32px] shadow-2xl max-w-sm w-full p-8 text-center space-y-6 transform animate-in fade-in zoom-in duration-200 ${brand.theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 border-4 shadow-sm ${brand.theme === 'dark' ? 'bg-blue-900/30 border-gray-800' : 'bg-blue-50 border-white'}`}>
                    <Laptop size={40} className="text-blue-500" />
                </div>
                <h3 className={`text-2xl font-black tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>상세페이지 디자인 의뢰</h3>
                <p className={`${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-800'} text-sm leading-relaxed`}>
                    전문 디자이너가 사장님만의 <br />
                    <strong className="text-pink-500 font-black text-lg">고퀄리티 상세페이지</strong>를 제작해드립니다.
                </p>
                <div className={`p-6 rounded-2xl text-left space-y-3 text-xs md:text-sm border font-bold ${brand.theme === 'dark' ? 'bg-blue-900/10 text-blue-200 border-blue-900/30' : 'bg-blue-50/50 text-gray-700 border-blue-100'}`}>
                    <p className="flex items-center gap-2">• 브랜드 전용 1:1 맞춤형 고해상도 디자인</p>
                    <p className="flex items-center gap-2">• 7단계 노출 등급에 최적화된 레이아웃 제공</p>
                    <p className="flex items-center gap-2">• 움직이는 GIF 및 프리미엄 움짤 무료 제작</p>
                    <p className="flex items-center gap-2">• 제작 기간: 영업일 기준 평균 1~2일</p>
                </div>
                <div className="grid grid-cols-1 gap-3 pt-2">
                    <button onClick={() => alert('고객센터로 디자인 제작 문의가 접수되었습니다.')} className="py-4 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl shadow-blue-100/10 transition-all flex items-center justify-center gap-2">
                        실시간 1:1 문의 / 고객센터 연결
                    </button>
                    <button onClick={onClose} className="py-3 text-gray-400 font-bold hover:text-gray-600">
                        닫기
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const PreviewModal: React.FC<PreviewModalProps> = ({ brand, onClose, formData }) => {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className={`rounded-[32px] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] transform animate-in fade-in fill-mode-both duration-300 ${brand.theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
                <div className={`p-6 border-b flex justify-between items-center rounded-t-[32px] ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50/50'}`}>
                    <h3 className={`font-black text-xl flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><Eye size={24} className="text-pink-500" /> 채용공고 최종 미리보기</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <span className="inline-block px-2 py-1 bg-pink-100 text-pink-600 text-xs font-bold rounded mb-2">{formData.industrySub}</span>
                        <h2 className={`text-2xl font-black leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formData.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">{formData.shopName} | {formData.regionCity} {formData.regionGu}</p>
                    </div>

                    <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl text-sm ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
                        <div><span className="text-gray-500 block text-xs">급여</span><strong className="text-blue-600 text-lg">{formData.payType} {formData.payAmount}</strong></div>
                        <div><span className="text-gray-500 block text-xs">나이</span><strong className={`${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formData.ageMin}세 ~ {formData.ageMax}세</strong></div>
                        <div><span className="text-gray-500 block text-xs">담당자 / 연락처</span><strong className={`${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formData.managerName} / {formData.managerPhone}</strong></div>
                        <div>
                            <span className="text-gray-500 block text-xs">메신저</span>
                            <div className="flex flex-col gap-1 mt-1">
                                {formData.messengers.kakao && <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 bg-yellow-100 text-[10px] text-yellow-800 rounded font-bold">카카오</span><span className={`text-sm font-bold ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formData.messengers.kakao}</span></div>}
                                {formData.messengers.line && <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 bg-green-100 text-[10px] text-green-800 rounded font-bold">라인</span><span className={`text-sm font-bold ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formData.messengers.line}</span></div>}
                                {formData.messengers.telegram && <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 bg-blue-100 text-[10px] text-blue-800 rounded font-bold">텔레그램</span><span className={`text-sm font-bold ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formData.messengers.telegram}</span></div>}
                                {!formData.messengers.kakao && !formData.messengers.line && !formData.messengers.telegram && <span className="text-gray-500 text-xs">-</span>}
                            </div>
                        </div>
                    </div>

                    {/* Pay Suffixes Preview */}
                    {formData.paySuffixes.length > 0 && (
                        <div className={`p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">급여 추가 옵션</p>
                            <div className="flex flex-wrap gap-1.5">
                                {formData.paySuffixes.map((suffix: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg">{suffix}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-6 text-left">
                        <h4 className="font-bold text-gray-900 mb-4">상세내용</h4>
                        <div
                            className="prose prose-sm max-w-none text-gray-900 leading-relaxed whitespace-pre-wrap text-left"
                            style={{ fontFamily: 'inherit' }}
                            dangerouslySetInnerHTML={{ __html: formData.editorHtml || '' }}
                        />
                    </div>
                </div>

                <div className={`p-4 border-t text-left ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">Keyword & Info</p>
                    <div className="flex flex-wrap gap-1 text-[10px] text-gray-500">
                        {formData.selectedKeywords.map((k: string) => <span key={k} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded mr-1">#{k}</span>)}
                    </div>
                </div>

                <div className={`p-4 border-t rounded-b-2xl text-right ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <button onClick={onClose} className={`px-6 py-3 font-bold rounded-xl transition ${brand.theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>닫기</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- ExampleModal ---
export const ExampleModal = React.memo(({ show, type, onClose, brand }: any) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!show || !mounted) return null;
    const examples = {
        step2_card: { title: '광고 카드 노출 예시', img: '/images/examples/capture1.jpg', desc: '남들과는 다른 다양한 추가옵션으로\n시선을 사로 잡으세요!' },
        step2_list: { title: '리스트/줄광고 노출 예시', img: '/images/examples/capture2.jpg', desc: '남들과는 다른 다양한 추가옵션으로\n시선을 사로 잡으세요!' },
        step4_pay: { title: '급여 옵션 카드 예시', img: '/images/guide/광고카드 상세 예시.jpg', desc: '강조된 급여 옵션 노출 예시입니다.' },
        step4_effect: { title: '강조 효과 (테두리/Glow) 예시', img: '/images/guide/홈페이지 메인페이지(특수_그랜드_프리미엄).jpg', desc: '테두리 및 Glow 특수 효과 노출 예시입니다.' },
        step4_icon: { title: '10종 아이콘 종류 및 예시', img: '/images/guide/리스트 광고 표시 예시.jpg', desc: '광고 신뢰도를 높이는 10종의 아이콘 예시입니다.' },
        step4_hl: { title: '8가지 컬러 형광펜 예시', img: '/images/guide/홈페이지 페이지(리스트광고).jpg', desc: '타이틀을 돋보이게 하는 8가지 컬러 형광펜 예시입니다.' }
    };
    const cur = (examples as any)[type] || examples.step2_card;
    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className={`relative w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 ${brand.theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
                <div className={`p-5 border-b flex justify-between items-center ${brand.theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                    <h3 className={`text-lg font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{cur.title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto bg-white flex items-center justify-center relative min-h-[200px]">
                    <img src={cur.img} alt={cur.title} className="max-w-full h-auto rounded-xl shadow-lg border border-gray-100" />
                </div>
                <div className="p-6 bg-white space-y-4">
                    <p className={`text-sm font-bold text-center leading-relaxed whitespace-pre-line ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{cur.desc}</p>
                    <button onClick={onClose} className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition">확인했습니다</button>
                </div>
            </div>
        </div>,
        document.body
    );
});
ExampleModal.displayName = 'ExampleModal';

export const BusinessMobileMenu: React.FC<MobileMenuProps> = ({ brand, onClose, setView, shopName, nickname, router }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(
        <div className="fixed inset-0 z-[20000] flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className={`relative w-72 h-full shadow-2xl p-6 transform animate-in slide-in-from-right duration-300 ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className="mt-8 text-center">
                    <div className={`w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 flex items-center justify-center text-gray-400 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-pink-100'}`}>
                        <Store size={32} />
                    </div>
                    <h2 className={`font-black text-lg ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{shopName}</h2>
                    <p className="text-sm text-gray-500 mb-6">프리미엄 회원</p>
                    <button className={`w-full py-2 rounded-lg text-xs font-bold transition ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        사진 등록/수정
                    </button>
                </div>

                <nav className={`mt-8 space-y-2 text-sm font-bold ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div onClick={() => { setView('dashboard'); onClose(); }} className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><List size={18} /> 진행중인 공고</div>
                    <div onClick={() => { setView('closed-ads'); onClose(); }} className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><LogOut size={18} /> 마감된 공고</div>
                    <div onClick={() => { setView('payments'); onClose(); }} className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><CreditCard size={18} /> 유료 결제 내역</div>
                    <div onClick={() => { setView('applicants'); onClose(); }} className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><User size={18} /> 지원자 관리</div>
                    <div onClick={() => { setView('member-info'); onClose(); }} className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><Settings size={18} /> 회원 정보 수정</div>
                </nav>
            </div>
        </div>,
        document.body
    );
};

export const MemberInfoForm = ({ nickname, setNickname, shopName, email, setEmail, smsConsent, setSmsConsent, brand, setView }: any) => (
    <div className={`max-w-4xl mx-auto p-4 md:p-10 rounded-[24px] md:rounded-[32px] shadow-xl border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <h2 className={`text-xl md:text-2xl font-black mb-6 md:mb-8 pb-4 border-b ${brand.theme === 'dark' ? 'text-white border-gray-800' : 'text-gray-900 border-gray-100'}`}>
            회원 정보 수정
        </h2>

        <div className="space-y-6 md:space-y-8">
            {/* ID / Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={`block text-xs font-bold mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>아이디</label>
                    <input type="text" value="bizsetter" disabled className={`w-full p-3 md:p-4 rounded-xl font-bold border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`} />
                </div>
                <div>
                    <label className={`block text-xs font-bold mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>비밀번호 변경</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input type="password" placeholder="변경할 비밀번호 입력" className={`w-full sm:flex-1 p-3 md:p-4 rounded-xl font-bold border transition focus:ring-2 focus:ring-pink-500/20 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-pink-500' : 'bg-white border-gray-200 text-gray-900 focus:border-pink-500'}`} />
                        <button className={`w-full sm:w-auto px-6 py-3 md:py-4 rounded-xl font-bold whitespace-nowrap ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700' : 'bg-gray-950 text-white border border-gray-950 hover:bg-black transition'}`}>변경</button>
                    </div>
                </div>
            </div>

            {/* Nickname & Business Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={`block text-xs font-bold mb-2 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        닉네임 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={nickname}
                        maxLength={10}
                        onChange={(e) => setNickname(e.target.value)}
                        className={`w-full p-3 md:p-4 rounded-xl font-bold border transition focus:ring-2 focus:ring-pink-500/20 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-pink-500' : 'bg-white border-gray-200 text-gray-900 focus:border-pink-500'}`}
                    />
                    <p className="text-[10px] text-pink-500 mt-1.5 font-bold flex items-center gap-1">
                        <span className="w-1 h-1 bg-pink-500 rounded-full"></span>
                        최대 10자 (공백 포함) / 구인 리스트에 노출됩니다.
                    </p>
                </div>
                <div>
                    <label className={`block text-xs font-bold mb-2 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        상호명 (고정) <Check size={14} className="text-green-500" />
                    </label>
                    <input
                        type="text"
                        value={shopName}
                        disabled
                        className={`w-full p-3 md:p-4 rounded-xl font-bold border opacity-70 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}
                    />
                    <p className="text-[10px] text-green-600 mt-1.5 font-bold">
                        * 사업자등록증 기반으로 인증된 상호명입니다.
                    </p>
                </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={`block text-xs font-bold mb-2 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        이메일
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full p-3 md:p-4 rounded-xl font-bold border transition focus:ring-2 focus:ring-pink-500/20 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-pink-500' : 'bg-white border-gray-200 text-gray-900 focus:border-pink-500'}`}
                    />
                </div>
                <div>
                    <label className={`block text-xs font-bold mb-2 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        휴대폰 번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value="010-3838-4335"
                            readOnly
                            className={`w-full sm:flex-1 p-3 md:p-4 rounded-xl font-bold border outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                        />
                        <button className={`w-full sm:w-auto px-6 py-3 md:py-4 rounded-xl font-bold whitespace-nowrap bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition`}>
                            재인증
                        </button>
                    </div>
                </div>
            </div>

            {/* SMS Consent */}
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div
                    onClick={() => setSmsConsent(!smsConsent)}
                    className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer transition ${smsConsent ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white border-gray-300'}`}
                >
                    {smsConsent && <Check size={16} />}
                </div>
                <label className={`cursor-pointer font-bold select-none ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} onClick={() => setSmsConsent(!smsConsent)}>
                    [필수] SMS 수신 동의 (중요 알림 및 공지사항)
                </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => setView('dashboard')} className={`px-8 py-4 rounded-xl font-bold transition ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    취소
                </button>
                <button onClick={() => { alert('회원 정보가 수정되었습니다.'); setView('dashboard'); }} className="px-8 py-4 rounded-xl bg-pink-500 text-white font-black hover:bg-pink-600 shadow-xl shadow-pink-500/20 transition">
                    회원정보 수정하기
                </button>
            </div>
        </div>
    </div>
);

export const PersonalMobileMenu: React.FC<PersonalMobileMenuProps> = ({ brand, onClose, setView, router }) => {
    const menuItems = [
        { id: 'resume-list', label: '이력서 리스트', icon: <List size={16} /> },
        { id: 'scrap', label: '채용정보 스크랩', icon: <Star size={16} /> },
        { id: 'payment', label: '유료결제 내역', icon: <CreditCard size={16} /> },
        { id: 'excluded', label: '열람불가 업소설정', icon: <AlertTriangle size={16} /> },
        { id: 'custom-job', label: '맞춤구인정보', icon: <Briefcase size={16} /> },
        { id: 'my-posts', label: '내가 작성한 게시글', icon: <FileText size={16} /> },
        { id: 'block', label: '회원 차단 설정', icon: <User size={16} /> },
        { id: 'bookmark', label: '즐겨찾기한 게시글', icon: <Star size={16} /> },
    ];

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`absolute top-0 right-0 w-[80%] max-w-[300px] h-full shadow-2xl animate-in slide-in-from-right duration-300 ${brand.theme === 'dark' ? 'bg-gray-900 border-l border-gray-800' : 'bg-white'}`}>
                <div className="p-4 flex justify-between items-center border-b dark:border-gray-800">
                    <h2 className={`font-bold ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>마이페이지 메뉴</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <X size={20} className={brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                    </button>
                </div>
                <div className="p-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'resume-list') setView('member-info');
                                else alert('준비 중인 기능입니다.');
                                onClose();
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl flex items-center gap-3 transition ${brand.theme === 'dark' ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
                {/* Global Links for Mobile */}
                <div className="p-4 border-t dark:border-gray-800 space-y-1">
                    <button onClick={() => router.push('/')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-3">
                        <Home size={16} /> 홈으로
                    </button>
                    <button onClick={() => router.push('/community')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-3">
                        <MessageCircle size={16} /> 커뮤니티
                    </button>
                    <button onClick={() => {
                        if (confirm('로그아웃 하시겠습니까?')) {
                            localStorage.clear();
                            window.location.href = '/';
                        }
                    }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-3">
                        <LogOut size={16} /> 로그아웃
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const PersonalMemberEdit = ({ setView }: { setView: (v: any) => void }) => {
    const brand = useBrand();
    const [userName, setUserName] = useState('회원님');

    // Form Data
    const [formData, setFormData] = useState({
        id: 'admin_user',
        password: '',
        passwordConfirm: '',
        realName: '김여우',
        nickname: '회원님',
        birthdate: '1998-08-13',
        gender: '여성', // Default
        email: 'user@example.com',
        phone: '010-0000-0000',
        smsConsent: true
    });

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        if (storedName) {
            setUserName(storedName);
            setFormData(prev => ({ ...prev, nickname: storedName }));
        }
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (formData.password && formData.password !== formData.passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        localStorage.setItem('user_name', formData.nickname);
        alert('회원정보가 수정되었습니다.');
        setView('member-info');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className={`p-6 rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <Settings size={20} className="text-gray-400" />
                    <h2 className={`text-lg font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>회원정보 수정</h2>
                </div>

                <div className="space-y-5">
                    {/* ID (Read Only) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">아이디</label>
                        <div className="md:col-span-9">
                            <input type="text" value={formData.id} readOnly className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm font-bold text-gray-500 outline-none" />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">비밀번호</label>
                        <div className="md:col-span-9">
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="변경할 비밀번호를 입력하세요"
                                className="w-full bg-white border border-gray-300 rounded p-2 text-sm font-bold outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Password Confirm */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">비밀번호 확인</label>
                        <div className="md:col-span-9">
                            <input
                                type="password"
                                value={formData.passwordConfirm}
                                onChange={(e) => handleChange('passwordConfirm', e.target.value)}
                                placeholder="비밀번호를 다시 입력하세요"
                                className="w-full bg-white border border-gray-300 rounded p-2 text-sm font-bold outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Real Name (Read Only) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">이름</label>
                        <div className="md:col-span-9">
                            <input type="text" value={formData.realName} readOnly className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm font-bold text-gray-500 outline-none" />
                        </div>
                    </div>

                    {/* Nickname (Editable) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">닉네임</label>
                        <div className="md:col-span-9">
                            <input
                                type="text"
                                value={formData.nickname}
                                onChange={(e) => handleChange('nickname', e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded p-2 text-sm font-bold outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Birthdate (Read Only) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">생년월일</label>
                        <div className="md:col-span-9">
                            <input type="text" value={formData.birthdate} readOnly className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm font-bold text-gray-500 outline-none" />
                        </div>
                    </div>

                    {/* Gender (Read Only) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">성별</label>
                        <div className="md:col-span-9">
                            <input type="text" value={formData.gender} readOnly className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm font-bold text-gray-500 outline-none" />
                        </div>
                    </div>

                    {/* Email (Editable) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">이메일</label>
                        <div className="md:col-span-9">
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded p-2 text-sm font-bold outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Phone (Read Only + Certify) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-start">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500 mt-2.5">휴대폰</label>
                        <div className="md:col-span-9 space-y-2">
                            <div className="flex gap-2">
                                <input type="text" value={formData.phone} readOnly className="flex-1 bg-gray-100 border border-gray-200 rounded p-2 text-sm font-bold text-gray-500 outline-none" />
                                <button className="px-3 text-xs font-bold bg-gray-800 text-white rounded hover:bg-gray-900 transition flex-shrink-0">휴대폰 인증</button>
                            </div>
                            <p className="text-[11px] text-blue-500 font-bold">* 연락처 변경은 &apos;휴대폰인증&apos;이 필요합니다.</p>
                        </div>
                    </div>

                    {/* SMS Consent */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">SMS 수신동의</label>
                        <div className="md:col-span-9 flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.smsConsent}
                                onChange={(e) => handleChange('smsConsent', e.target.checked)}
                                id="smsConsent"
                                className="w-4 h-4 accent-purple-500"
                            />
                            <label htmlFor="smsConsent" className="text-sm font-bold text-gray-700 cursor-pointer">동의합니다</label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-2 mt-8 pt-6 border-t border-gray-100">
                        <button onClick={() => setView('member-info')} className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition">취소</button>
                        <button onClick={handleSave} className="px-8 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition shadow-lg">정보 수정완료</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ResumeForm = ({ setView }: { setView: (v: any) => void }) => {
    const brand = useBrand();
    const router = useRouter();

    // User Info State
    const [userName, setUserName] = useState('회원님');
    const [userId, setUserId] = useState('admin_user');

    // Form States
    const [selectedIndustryMain, setSelectedIndustryMain] = useState('');
    const [selectedIndustrySub, setSelectedIndustrySub] = useState('');
    const [selectedRegionMain, setSelectedRegionMain] = useState('');
    const [selectedRegionSub, setSelectedRegionSub] = useState('');
    const [payType, setPayType] = useState('급여협의'); // Default match corporate

    // Contact State
    const [contactMethod, setContactMethod] = useState('');
    const [contactValue, setContactValue] = useState('');

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        const storedId = localStorage.getItem('user_id');
        if (storedName) setUserName(storedName);
        if (storedId) setUserId(storedId);
    }, []);

    const handleContactMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const method = e.target.value;
        setContactMethod(method);
        if (method === 'phone') {
            setContactValue('010-0000-0000'); // Mock verified phone
        } else if (method === 'site_msg') {
            setContactValue('site_msg');
        } else {
            setContactValue(''); // Clear for ID input
        }
    };

    return (
        <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500`}>

            {/* Warning Banner */}
            <div
                onClick={() => router.push('/customer-center?tab=notice')}
                className="w-full bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-red-100/50 transition group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-red-500 border border-red-100">
                        <AlertTriangle size={24} fill="currentColor" strokeWidth={0} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500 mb-0.5">이력서 등록 시</div>
                        <div className="text-xl font-black text-red-500 tracking-tight">구직자 주의사항!</div>
                    </div>
                </div>
                <div className="text-sm font-bold text-gray-500 flex items-center gap-1 group-hover:text-red-500 transition">
                    자세히 보기 <ChevronRight size={16} />
                </div>
            </div>

            <div className={`p-6 rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className={`text-xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <span className="text-pink-500">{userName}</span> 회원 이력서 등록
                    </h2>
                    <div className="text-xs font-bold text-gray-400">MY PERSONAL HISTORY</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
                    {/* Photo Area */}
                    <div className="md:col-span-3 flex flex-col items-center sm:items-stretch gap-2">
                        <div className="w-28 sm:w-full aspect-[3/4] rounded-lg border-2 border-dashed flex items-center justify-center bg-gray-50 text-gray-300">
                            <User size={32} className="sm:w-[48px] sm:h-[48px]" />
                        </div>
                    </div>

                    {/* Basic Info Fields */}
                    <div className="md:col-span-9 space-y-4">
                        {/* ID - ReadOnly */}
                        <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0">
                            <label className="sm:col-span-3 text-xs font-bold text-gray-500">아이디</label>
                            <div className="sm:col-span-9 text-sm font-bold truncate w-full">{userId}</div>
                        </div>
                        {/* Nickname - Editable */}
                        <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0">
                            <label className="sm:col-span-3 text-xs font-bold text-gray-500">이름(닉네임) <span className="text-red-500">*</span></label>
                            <div className="sm:col-span-9 flex gap-2 w-full">
                                <input
                                    type="text"
                                    value={userName}
                                    maxLength={10}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="10자 이내 입력"
                                    className={`flex-1 border rounded p-1.5 text-xs font-bold outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-pink-500 min-w-0`}
                                />
                            </div>
                        </div>
                        {/* Birthdate/Sex */}
                        <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0">
                            <label className="sm:col-span-3 text-xs font-bold text-gray-500">성별/생년월일 <span className="text-red-500">*</span></label>
                            <div className="sm:col-span-9 flex flex-wrap gap-2 items-center w-full">
                                <select className="border border-gray-300 rounded p-1.5 text-xs font-bold bg-white text-gray-700 outline-none flex-shrink-0">
                                    <option>여성</option>
                                    <option>남성</option>
                                </select>
                                <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                                    <input type="number" defaultValue="2000" className="w-[60px] border border-gray-300 rounded p-1.5 text-xs text-center outline-none" /> <span className="text-xs">년</span>
                                    <input type="number" defaultValue="1" className="w-[45px] border border-gray-300 rounded p-1.5 text-xs text-center outline-none" /> <span className="text-xs">월</span>
                                    <input type="number" defaultValue="1" className="w-[45px] border border-gray-300 rounded p-1.5 text-xs text-center outline-none" /> <span className="text-xs">일</span>
                                </div>
                            </div>
                        </div>
                        {/* Contact Method - Dynamic Input */}
                        <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0">
                            <label className="sm:col-span-3 text-xs font-bold text-gray-500">연락방법 <span className="text-red-500">*</span></label>
                            <div className="sm:col-span-9 space-y-2 w-full">
                                <select
                                    value={contactMethod}
                                    onChange={handleContactMethodChange}
                                    className="w-full border border-gray-300 rounded p-1.5 text-xs font-bold bg-white text-gray-700 outline-none"
                                >
                                    <option value="">연락방법 선택</option>
                                    <option value="phone">휴대폰 (안심번호)</option>
                                    <option value="kakao">카카오톡</option>
                                    <option value="line">라인</option>
                                    <option value="telegram">텔레그램</option>
                                    <option value="site_msg">사이트 메세지</option>
                                </select>

                                {contactMethod === 'phone' && (
                                    <>
                                        <input type="text" value={contactValue} readOnly className="w-full bg-gray-100 border border-gray-300 rounded p-1.5 text-[11px] text-gray-500 font-bold outline-none" />
                                        <p className="text-[10px] text-blue-500 leading-tight">* 안심번호를 선택하면 입력하신 전화번호는 노출되지 않습니다.</p>
                                    </>
                                )}

                                {['kakao', 'line', 'telegram'].includes(contactMethod) && (
                                    <input
                                        type="text"
                                        value={contactValue}
                                        onChange={(e) => setContactValue(e.target.value)}
                                        placeholder={`${contactMethod === 'kakao' ? '카카오톡' : contactMethod === 'line' ? '라인' : '텔레그램'} ID를 입력해주세요`}
                                        className={`w-full border rounded p-1.5 text-[11px] font-bold outline-none focus:border-pink-500 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    />
                                )}

                                {contactMethod === 'site_msg' && (
                                    <div className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-[10px] text-gray-500 text-center font-bold">
                                        구직자에게 사이트 내 쪽지로 연락을 받습니다. (연락처 비공개)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Divider */}
                <div className="border-t border-dashed border-gray-200 my-6"></div>

                {/* Resume Content */}
                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-red-400 rounded-full"></span> 이력서 제목 <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="제목을 입력하세요" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold outline-none focus:border-pink-500" />
                    </div>
                    {/* Pay - Corporate Mapping */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-blue-400 rounded-full"></span> 희망 급여</label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <select
                                value={payType}
                                onChange={(e) => setPayType(e.target.value)}
                                className="border border-gray-300 rounded-lg p-2.5 text-xs font-bold bg-white text-gray-700 outline-none flex-shrink-0"
                            >
                                {PAY_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 pr-8 text-sm font-bold outline-none focus:border-pink-500"
                                    placeholder="금액 입력"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">원</span>
                            </div>
                        </div>
                    </div>
                    {/* Industry */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-purple-400 rounded-full"></span> 희망 분야 <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <select
                                value={selectedIndustryMain}
                                onChange={(e) => {
                                    setSelectedIndustryMain(e.target.value);
                                    setSelectedIndustrySub('');
                                }}
                                className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white text-gray-700 outline-none"
                            >
                                <option value="">1차 업종 선택</option>
                                {Object.keys(INDUSTRY_DATA).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <select
                                value={selectedIndustrySub}
                                onChange={(e) => setSelectedIndustrySub(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white text-gray-700 outline-none"
                                disabled={!selectedIndustryMain}
                            >
                                <option value="">2차 업종 선택</option>
                                {selectedIndustryMain && INDUSTRY_DATA[selectedIndustryMain]?.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Region */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-green-400 rounded-full"></span> 업무 가능 지역 <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <select
                                value={selectedRegionMain}
                                onChange={(e) => {
                                    setSelectedRegionMain(e.target.value);
                                    setSelectedRegionSub('');
                                }}
                                className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white text-gray-700 outline-none"
                            >
                                <option value="">지역 선택</option>
                                {Object.keys(REGION_DATA).map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                            <select
                                value={selectedRegionSub}
                                onChange={(e) => setSelectedRegionSub(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white text-gray-700 outline-none"
                                disabled={!selectedRegionMain}
                            >
                                <option value="">세부 지역 선택</option>
                                {selectedRegionMain && REGION_DATA[selectedRegionMain]?.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Intro */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-orange-400 rounded-full"></span> 자기소개 <span className="text-red-500">*</span></label>
                        <textarea className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold outline-none focus:border-pink-500 resize-none" placeholder="내용을 입력하세요"></textarea>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex justify-center gap-3">
                    <button onClick={() => setView('member-info')} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition">취소</button>
                    <button onClick={() => { alert('이력서가 등록되었습니다.'); setView('member-info'); }} className="px-8 py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-900 transition shadow-lg">이력서 등록완료</button>
                </div>
            </div>
        </div>
    );
};

// --- Business Sub-Views ---

export const ClosedAdsView = ({ setView }: { setView: (v: any) => void }) => {
    const brand = useBrand();
    const mockAds = [
        { id: 1, title: '코코라운지 주말 야간 구인', date: '2025-12-01', status: '기간만료' },
        { id: 2, title: '평일 오후 서빙 알바 급구', date: '2025-11-15', status: '기간만료' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>마감된 공고</h2>
                <button onClick={() => setView('dashboard')} className="text-sm font-bold text-gray-400 hover:text-gray-600">돌아가기</button>
            </div>
            <div className="space-y-3">
                {mockAds.map(ad => (
                    <div key={ad.id} className={`p-5 rounded-2xl border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} flex items-center justify-between`}>
                        <div>
                            <h3 className={`font-black mb-1 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{ad.title}</h3>
                            <p className="text-xs text-gray-400 font-bold">마감일: {ad.date}</p>
                        </div>
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black">{ad.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const PaymentsView = ({ setView }: { setView: (v: any) => void }) => {
    const brand = useBrand();
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>유료 결제 내역</h2>
                <button onClick={() => setView('dashboard')} className="text-sm font-bold text-gray-400 hover:text-gray-600">돌아가기</button>
            </div>
            <div className={`p-10 rounded-2xl border text-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <CreditCard size={32} />
                </div>
                <p className="text-gray-500 font-bold">최근 3개월간 결제 내역이 없습니다.</p>
            </div>
        </div>
    );
};

export const ApplicantsView = ({ setView }: { setView: (v: any) => void }) => {
    const brand = useBrand();
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>지원자 관리</h2>
                <button onClick={() => setView('dashboard')} className="text-sm font-bold text-gray-400 hover:text-gray-600">돌아가기</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-6 rounded-2xl border text-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                    <div className="text-4xl font-black text-pink-500 mb-2">0</div>
                    <p className="text-xs font-bold text-gray-500">진행 중인 공고 지원자</p>
                </div>
                <div className={`p-6 rounded-2xl border text-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                    <div className="text-4xl font-black text-gray-300 mb-2">0</div>
                    <p className="text-xs font-bold text-gray-500">새로운 메시지</p>
                </div>
            </div>
            <div className={`p-12 rounded-2xl border text-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <p className="text-gray-400 font-bold">지원 현황이 없습니다.</p>
            </div>
        </div>
    );
};

export const ComingSoonView = ({ title }: { title: string }) => {
    const brand = useBrand();
    return (
        <div className={`p-10 rounded-2xl border text-center flex flex-col items-center justify-center gap-4 min-h-[400px] ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-gray-400 ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Settings size={32} />
            </div>
            <div>
                <h2 className={`text-xl font-black mb-1 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                <p className="text-gray-500 font-bold">서비스 준비 중입니다.</p>
            </div>
        </div>
    );
};
