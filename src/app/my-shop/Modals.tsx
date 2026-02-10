'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Laptop, X, Eye, List, FileText, Store, Camera, Check } from 'lucide-react';
import Image from 'next/image';

// --- WarningModal ---
export const WarningModal = React.memo(({ show, onClose, onConfirm, brand }: any) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!show || !mounted) return null;
    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200 ${brand.theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mb-2">
                        <AlertTriangle size={32} />
                    </div>
                    <div className="space-y-4 w-full text-left">
                        <div className="text-center">
                            <h3 className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>게시글 작성 전 필독! 📢</h3>
                        </div>
                        <div className={`p-5 rounded-2xl space-y-3 ${brand.theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                            <div className="flex gap-3">
                                <span className="text-pink-500 font-black shrink-0">1.</span>
                                <p className={`text-xs font-bold leading-relaxed ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    월 수정횟수는 <span className="font-black underline">30회</span> 입니다.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-pink-500 font-black shrink-0">2.</span>
                                <p className={`text-xs font-bold leading-relaxed ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    금칙어 사용 시 통보 없이 삭제될 수 있습니다.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-pink-500 font-black shrink-0">3.</span>
                                <p className={`text-xs font-bold leading-relaxed ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    본문 내용은 <span className="font-black underline">1000자 이내</span>로 작성해주세요.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full mt-4">
                        <button onClick={onClose} className={`flex-1 py-4 rounded-2xl font-black transition ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>취소</button>
                        <button onClick={onConfirm} className="flex-1 py-4 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-2xl shadow-xl shadow-pink-200 transition">확인 후 작성</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
});
WarningModal.displayName = 'WarningModal';

// --- DesignRequestModal ---
export const DesignRequestModal = React.memo(({ show, onClose, brand }: any) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!show || !mounted) return null;
    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200 ${brand.theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-2">
                        <Laptop size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>디자인 제작 의뢰</h3>
                        <p className={`text-sm font-bold leading-relaxed ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            전문 디자이너가 귀사의 업소를<br />
                            최고급 디자인으로 제작해 드립니다.<br />
                            (별도 비용 발생)
                        </p>
                    </div>
                    <div className="flex gap-3 w-full mt-4">
                        <button onClick={onClose} className={`flex-1 py-4 rounded-2xl font-black transition ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>닫기</button>
                        <button onClick={() => { alert('준비중입니다.'); onClose(); }} className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition">의뢰하기</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
});
DesignRequestModal.displayName = 'DesignRequestModal';

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
                <div className="p-6 bg-gray-50 dark:bg-gray-800 space-y-4">
                    <p className={`text-sm font-bold text-center leading-relaxed whitespace-pre-line ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{cur.desc}</p>
                    <button onClick={onClose} className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition">확인했습니다</button>
                </div>
            </div>
        </div>,
        document.body
    );
});
ExampleModal.displayName = 'ExampleModal';

// --- PreviewModal ---
export const PreviewModal = React.memo(({ show, onClose, data, brand }: any) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!show || !mounted) return null;
    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className={`relative w-full max-w-4xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col ${brand.theme === 'dark' ? 'bg-gray-950 border border-gray-800' : 'bg-white'}`}>
                <div className={`p-4 md:p-6 border-b flex justify-between items-center shrink-0 ${brand.theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                        <Eye className="text-pink-500" />
                        <h3 className={`text-lg md:text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>광고 미리보기</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-12">
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-gray-400 flex items-center gap-2"><List size={16} /> 리스트 노출 형태</h4>
                            <div className={`p-5 rounded-2xl border-2 shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'}`}>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="w-full md:w-32 aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
                                        <Camera className="text-gray-300" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-1.5 flex-wrap">
                                            {data.selectedKeywords?.map((kw: string) => (
                                                <span key={kw} className="text-[10px] font-black px-1.5 py-0.5 bg-pink-100 text-pink-600 rounded">#{kw}</span>
                                            ))}
                                        </div>
                                        <h3 className={`text-base font-black leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                                            <span>{data.shopName}</span>
                                            <span>{data.regionCity} {data.regionGu}</span>
                                        </div>
                                        <div className="pt-2 flex items-center gap-2">
                                            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded">{data.payType}</span>
                                            <span className="text-sm font-black text-red-500">{data.payAmount}원</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 pt-8 border-t border-gray-100 dark:border-gray-900">
                            <h4 className="text-sm font-black text-gray-400 flex items-center gap-2"><FileText size={16} /> 상세 본문 내용</h4>
                            <div className={`p-8 rounded-[32px] border shadow-inner min-h-[400px] ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="preview-content prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: data.editorHtml }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
});
PreviewModal.displayName = 'PreviewModal';
