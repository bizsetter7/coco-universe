import React from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Store, MessageCircle, Phone, Info } from 'lucide-react';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { ICONS, HIGHLIGHTERS } from '../constants';

interface PreviewModalProps {
    brand: any;
    onClose: () => void;
    formData: any;
}

export const MobilePreviewModal: React.FC<PreviewModalProps> = ({ brand, onClose, formData }) => {
    if (typeof document === 'undefined') return null;

    // Determine theme color based on productType
    let headerBg = "from-pink-500 to-purple-600";
    let accentColor = "text-pink-600";
    let badgeBg = "bg-pink-100";

    const productType = formData.selectedAdProduct;

    if (productType === 'p1' || productType === '그랜드') {
        headerBg = "from-amber-400 via-orange-500 to-amber-600";
        accentColor = "text-amber-600";
        badgeBg = "bg-amber-100";
    } else if (productType === 'p2' || productType === '프리미엄') {
        headerBg = "from-blue-500 to-indigo-600";
        accentColor = "text-blue-600";
        badgeBg = "bg-blue-100";
    }

    // Pay type abbreviation
    const getPayAbbr = (type: string) => {
        if (type?.includes('시급')) return '시';
        if (type?.includes('일급')) return '일';
        if (type?.includes('주급')) return '주';
        if (type?.includes('월급')) return '월';
        if (type?.includes('연봉')) return '연';
        if (type?.includes('건당')) return '건';
        return type?.[0] || '급';
    };

    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className={`bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]`}
                style={{ width: '100%', maxWidth: '600px' }}
            >
                {/* Header (Capture 2 style) */}
                <div className={`relative px-6 py-6 md:py-8 bg-gradient-to-br ${headerBg} text-white flex flex-col items-center text-center gap-4 shrink-0 shadow-lg`}>
                    <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-50">
                        MOBILE CACHE BUSTED
                    </div>
                    <button onClick={onClose} className="absolute top-5 right-6 p-2 hover:bg-white/20 rounded-full transition z-50">
                        <X size={24} />
                    </button>
                    <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-black tracking-widest flex items-center gap-1 shadow-sm">
                        <MapPin size={10} /> [{formData.regionCity} {formData.regionGu}] | <Store size={10} /> {formData.industryMain || '업종미기재'}
                    </div>

                    {/* Ad Title Single White Box Layout (Capture 2 Style) */}
                    <div className="w-full bg-white px-4 md:px-6 py-4 rounded-[24px] shadow-xl border border-white/50 flex flex-col md:flex-row items-center justify-center gap-3">
                        {formData.selectedIcon && (() => {
                            const iconObj = ICONS.find((i: any) => i.id === Number(formData.selectedIcon));
                            return iconObj ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-xl border border-pink-100 shadow-sm shrink-0">
                                    <span className="text-xl">{iconObj.icon}</span>
                                    <span className="text-[11px] font-black uppercase tracking-tight">{iconObj.name}</span>
                                </div>
                            ) : null;
                        })()}

                        <h2 className="text-xl md:text-2xl font-black leading-tight text-gray-900 flex-1 truncate text-center md:text-left">
                            <span style={formData.selectedHighlighter ? {
                                backgroundColor: HIGHLIGHTERS.find((h: any) => h.id === Number(formData.selectedHighlighter))?.color + 'cc',
                                color: '#000',
                                padding: '0 8px',
                                borderRadius: '6px'
                            } : {}}>
                                {formData.title || '제목을 입력해주세요'}
                            </span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 opacity-95 font-black text-[13px] md:text-sm bg-black/10 px-4 py-1.5 rounded-full">
                        {formData.nickname || formData.shopName || '비즈니스 파트너'}
                    </div>
                </div>

                {/* Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-gray-50/30">
                    {/* Salary Info Box (Redesigned with Vertical Line and Options area) */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-stretch group hover:shadow-md transition-shadow min-h-[100px]">
                        {/* Left: Salary Info */}
                        <div className="flex-[4] flex items-center gap-3 pr-4 border-r border-gray-100">
                            {/* Stylish Square Box Badge */}
                            <div className={`w-8 h-8 ${accentColor} ${badgeBg} rounded-xl border-2 border-current/20 flex items-center justify-center text-md font-black shadow-inner shrink-0`}>
                                {getPayAbbr(formData.payType)}
                            </div>
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className="text-xl md:text-2xl font-black text-gray-800 tracking-tighter truncate leading-tight">
                                    {formatKoreanMoney(formData.payAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Right: Salary Options (Suffixes) */}
                        <div className="flex-[6] pl-6 flex items-center flex-wrap gap-1.5 align-content-center">
                            {formData.paySuffixes?.length > 0 ? (
                                formData.paySuffixes.slice(0, 6).map((s: string, i: number) => (
                                    <span key={i} className="px-2.5 py-1 bg-red-50 text-red-500 text-[10px] font-black rounded-lg border border-red-100/50 whitespace-nowrap shadow-sm">
                                        {s}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-300 text-[11px] font-bold italic">추가 옵션 없음</span>
                            )}
                        </div>
                    </div>

                    {/* Recruiting Section (Moved Up) */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                            <h3 className="text-[17px] font-black text-gray-800">상세 모집내용</h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[150px]">
                            <div
                                className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: formData.editorHtml || '등록된 상세 내용이 없습니다.' }}
                            />
                        </div>
                    </div>

                    {/* 위치 정보 (위치 정보 섹션 스타일 JobDetailModal과 통일) */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                            위치 정보
                        </h3>
                        <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 flex-col gap-2 border border-gray-50">
                            <MapPin size={32} className="opacity-50" />
                            <span className="text-xs font-bold">{formData.regionCity} {formData.regionGu}</span>
                            <span className="text-[10px] opacity-60">지도 보기 (준비중)</span>
                        </div>
                    </div>

                    {/* Keyword & Info (Keyword 섹션 스타일 JobDetailModal과 통일) */}
                    <div className="space-y-2 pt-2">
                        <h3 className="text-xs font-bold text-gray-400 flex items-center gap-1.5 opacity-80">
                            <Info size={12} />
                            Keyword & Info
                        </h3>
                        <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                            <div className="flex flex-wrap gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
                                {formData.selectedKeywords && formData.selectedKeywords.length > 0 ? (
                                    formData.selectedKeywords.map((kw: string, i: number) => (
                                        <span key={i} className="px-2 py-1 rounded bg-white border border-gray-200 text-gray-400 text-[10px] font-medium">
                                            #{kw}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-300 text-[11px] font-bold">등록된 키워드가 없습니다.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons (Mockup style) */}
                <div className="p-6 bg-white border-t border-gray-100 grid grid-cols-4 gap-3 shrink-0">
                    <button className="col-span-1 py-4 bg-gray-50 border border-gray-100 text-gray-600 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition shadow-sm group">
                        <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black">쪽지문의</span>
                    </button>
                    <button className="col-span-1 py-4 bg-amber-400 text-black rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-amber-500 transition shadow-sm font-black group">
                        <MessageCircle size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px]">카톡문의</span>
                    </button>
                    <button className="col-span-2 py-4 bg-pink-600 text-white rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-pink-700 transition shadow-lg shadow-pink-600/30 group">
                        <div className="flex items-center gap-2">
                            <Phone size={18} fill="currentColor" className="group-hover:animate-bounce" />
                            <span className="text-[15px] font-black">전화/문자 지원하기</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
