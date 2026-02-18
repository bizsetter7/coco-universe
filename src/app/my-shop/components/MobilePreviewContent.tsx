import React from 'react';
import { MapPin, Store, MessageCircle, Phone, Info } from 'lucide-react'; // Removed X import as it is part of Modal wrapper
import { formatKoreanMoney } from '@/utils/formatMoney';
import { cleanShopTitle } from '@/utils/shopUtils';
import { IconBadge } from '@/components/common/IconBadge';
import { getHighlighterStyle } from '@/utils/highlighter';
import { getPayColor, getPayAbbreviation } from '@/utils/payColors';

interface MobilePreviewContentProps {
    formData: any;
    brand?: any; // Optional, defaults used if missing
}

export const MobilePreviewContent: React.FC<MobilePreviewContentProps> = ({ formData, brand }) => {
    // [표준 규정] 광고 등급별 스타일 맵 (T1~T7 지원)
    const TIER_STYLE_MAP: Record<string, { header: string, accent: string, badge: string }> = {
        'p1': { header: "from-amber-400 via-orange-500 to-amber-600", accent: "text-amber-600", badge: "bg-amber-100" }, // Grand (Gold)
        'p2': { header: "from-red-500 to-rose-700", accent: "text-red-600", badge: "bg-red-100" },               // Premium (Red)
        'p3': { header: "from-blue-500 to-indigo-600", accent: "text-blue-600", badge: "bg-blue-100" },               // Deluxe (Blue)
        'p4': { header: "from-emerald-400 to-teal-600", accent: "text-emerald-600", badge: "bg-emerald-100" },          // Special (Green)
        'p5': { header: "from-orange-400 to-red-600", accent: "text-orange-600", badge: "bg-orange-100" },            // Urgent/Rec (Orange)
        'p6': { header: "from-slate-400 to-gray-600", accent: "text-gray-600", badge: "bg-gray-100" },               // Native (Slate)
        'p7': { header: "from-slate-300 to-slate-400", accent: "text-slate-400", badge: "bg-slate-50" },                // Basic (Gray)
    };


    // T계열 코드 보정 (T1 -> p1 매핑)
    const normalizedProduct = (formData.selectedAdProduct || 'p7').toLowerCase();
    const tierKey = normalizedProduct.replace('t', 'p');

    // 최종 스타일 추출 (Grand/Premium 등 텍스트 키 지원 포함)
    const currentStyle = TIER_STYLE_MAP[tierKey] ||
        (normalizedProduct.includes('grand') ? TIER_STYLE_MAP.p1 :
            normalizedProduct.includes('premium') ? TIER_STYLE_MAP.p2 :
                normalizedProduct.includes('deluxe') ? TIER_STYLE_MAP.p3 : TIER_STYLE_MAP.p7);

    const headerBg = currentStyle.header;
    const accentColor = currentStyle.accent;
    // const badgeBg = currentStyle.badge;


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

    const getBorderClass = (opt: string) => {
        switch (opt) {
            case 'color': return 'border-4 border-pink-500';
            case 'glow': return 'border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)]';
            case 'sparkle': return 'border-4 border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.8)] animate-pulse';
            case 'rainbow': return 'animate-rainbow-border shadow-lg';
            default: return 'border border-gray-200';
        }
    };

    return (
        <div className={`flex flex-col h-full bg-white rounded-[32px] overflow-hidden shadow-sm ${getBorderClass(formData.borderOption)}`}>
            {/* Header (Capture 3 style) */}
            <div className={`relative px-6 py-5 md:py-8 bg-gradient-to-br ${headerBg} text-white flex flex-col items-center text-center gap-3 md:gap-4 shrink-0 shadow-lg`}>
                <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10">
                    MOBILE PREVIEW
                </div>

                <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-black tracking-widest flex items-center gap-1 shadow-sm">
                    <MapPin size={10} /> [{formData.regionCity} {formData.regionGu}] | <Store size={10} /> {formData.industryMain || '업종미기재'}{formData.categorySub ? ` > ${formData.categorySub}` : ''}
                </div>

                {/* Ad Title White Box Layout (CENTERED) */}
                <div className="w-full bg-white px-4 md:px-6 py-5 rounded-[24px] shadow-xl border border-white/50 flex flex-col items-center justify-center gap-2 md:gap-3">
                    <div className="flex items-center justify-center gap-2 md:gap-3 w-full">
                        <IconBadge iconId={formData.selectedIcon} showName={true} />

                        <h2 className="text-[13px] md:text-sm font-black leading-tight text-gray-900 line-clamp-2 text-center break-all">
                            <span style={getHighlighterStyle(formData.selectedHighlighter)}>
                                {cleanShopTitle(formData.title || formData.shopName, formData.shopName)}
                            </span>
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-95 font-black text-[13px] md:text-sm bg-black/10 px-4 py-1.5 rounded-full">
                    {cleanShopTitle(undefined, formData.nickname || formData.shopName || '비즈니스 파트너')}
                </div>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto pt-6 px-6 pb-2 md:p-8 space-y-8 bg-gray-50/30">
                {/* Pay & Keywords Box (CENTERED/GRID) */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch group hover:shadow-md transition-shadow">
                    {/* Left: Salary Info */}
                    <div className="flex items-center gap-3 pr-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 shrink-0">
                        {/* Stylish Square Box Badge - [규정 준수] 급여 종류별 표준 컬러 적용 */}
                        <div className={`w-9 h-9 flex items-center justify-center rounded-xl text-md font-black shadow-inner shrink-0 text-white ${getPayColor(formData.payType)}`}>
                            {getPayAbbreviation(formData.payType)}
                        </div>
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                            <div className="text-[18px] md:text-[22px] font-black text-gray-800 tracking-tighter leading-tight flex items-baseline gap-1">
                                {formatKoreanMoney(formData.payAmount)}
                            </div>
                        </div>
                    </div>

                    {/* Right: Keywords (Grid 3 cols) */}
                    <div className="flex-1 md:pl-6 grid grid-cols-3 gap-1.5 py-4 md:py-0">
                        {formData.selectedKeywords?.slice(0, 6).map((kw: string, i: number) => (
                            <span key={i} className="px-1 py-1.5 bg-pink-50 text-pink-500 text-[10px] font-black rounded-lg border border-pink-100/50 flex items-center justify-center text-center leading-tight shadow-sm">
                                {kw}
                            </span>
                        ))}
                        {(!formData.selectedKeywords || formData.selectedKeywords.length === 0) && (
                            <span className="col-span-3 text-gray-300 text-[11px] font-bold italic py-2">등록된 키워드 없음</span>
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
                            className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed break-words"
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

                {/* Scroll Margin for Safe Area */}
                <div className="h-2"></div>
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
    );
};
