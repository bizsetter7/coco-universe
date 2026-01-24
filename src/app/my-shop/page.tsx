'use client';

import { useBrand } from '@/components/BrandProvider';
import {
    Store,
    FileText,
    CreditCard,
    Camera,
    MapPin,
    Phone,
    MessageCircle,
    Send,
    CheckCircle2,
    Save,
    LogOut,
    ChevronRight,
    Plus,
    Briefcase
} from 'lucide-react';
import { useState, useMemo } from 'react';

// Mock Data for Hierarchical Region Selection
const LOCATIONS: Record<string, Record<string, string[]>> = {
    '서울': {
        '강남구': ['전체', '역삼동', '논현동', '청담동', '삼성동', '압구정동', '신사동', '대치동', '자곡동', '세곡동'],
        '서초구': ['전체', '서초동', '잠원동', '반포동', '방배동', '양재동', '내곡동'],
        '송파구': ['전체', '잠실동', '신천동', '방이동', '송파동', '석촌동', '가락동', '문정동'],
        '영등포구': ['전체', '여의도동', '영등포동', '당산동', '문래동', '양평동'],
        '마포구': ['전체', '서교동', '동교동', '합정동', '상수동', '연남동', '망원동'],
        '용산구': ['전체', '이태원동', '한남동', '용산동', '이촌동'],
    },
    '경기': {
        '수원시': ['전체', '인계동', '매탄동', '영통동', '권선동', '세류동'],
        '성남시': ['전체', '정자동', '서현동', '판교동', '야탑동', '모란'],
        '평택시': ['전체', '비전동', '서정동', '고덕면', '송탄'],
        '안산시': ['전체', '중앙동', '고잔동', '선부동', '상록수'],
    },
    '인천': {
        '부평구': ['전체', '부평동', '산곡동', '삼산동', '십정동'],
        '남동구': ['전체', '구월동', '간석동', '만수동', '논현동'],
        '미추홀구': ['전체', '주안동', '도화동', '숭의동'],
    },
    '부산': {
        '해운대구': ['전체', '우동', '중동', '좌동', '반여동', '송정동'],
        '부산진구': ['전체', '부전동', '전포동', '양정동', '개금동'],
        '수영구': ['전체', '광안동', '남천동', '민락동'],
    }
};

const INDUSTRIES = [
    '룸살롱/텐카페/쩜오',
    '바(Bar)/모던바/토킹바',
    '노래방/가라오케',
    '요정/한정식',
    '단란주점/유흥주점',
    '클럽/나이트',
    '스웨디시/마사지',
    '다방/카페',
    '기타'
];

const PAY_TYPES = [
    { value: 'TC', label: 'TC (테이블)' },
    { value: '일급', label: '일급' },
    { value: '주급', label: '주급' },
    { value: '월급', label: '월급' },
    { value: '협의', label: '협의' }
];

export default function MyShopPage() {
    const brand = useBrand();
    const [activeTab, setActiveTab] = useState<'info' | 'job' | 'payment'>('info');

    // Shop Info State
    const [shopInfo, setShopInfo] = useState({
        name: '강남 1등 가게',
        phone: '010-1234-5678',
        kakao: 'gangnam1',
        telegram: '@gangnam_top',
        location: {
            city: '서울',
            district: '강남구',
            neighborhood: '역삼동'
        },
        industry: '룸살롱/텐카페/쩜오',
        intro: '가족같은 분위기에서 함께하실 분 구합니다! 텃세 절대 없습니다.',
    });

    // Job Posting State
    const [jobInfo, setJobInfo] = useState({
        title: '월 1000만 보장 / 당일지급',
        payType: 'TC',
        payAmount: '130,000',
        tags: ['초보환영', '경력우대', '당일지급'],
    });

    const primaryStyle = { color: brand.primaryColor };
    const primaryBgStyle = { backgroundColor: brand.primaryColor };
    const borderStyle = { borderColor: brand.primaryColor };

    // Derived location data
    const districts = useMemo(() => shopInfo.location.city ? Object.keys(LOCATIONS[shopInfo.location.city] || {}) : [], [shopInfo.location.city]);
    const neighborhoods = useMemo(() => (shopInfo.location.city && shopInfo.location.district) ? LOCATIONS[shopInfo.location.city][shopInfo.location.district] || [] : [], [shopInfo.location.city, shopInfo.location.district]);

    return (
        <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} pb-24 md:pb-0`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 border-b ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Store style={primaryStyle} />
                        <span>내 가게 관리</span>
                    </h1>
                    <button className="text-sm text-gray-500 hover:text-red-500 font-bold flex items-center gap-1">
                        <LogOut size={16} /> 로그아웃
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation (Desktop) / Top Tabs (Mobile) */}
                <nav className="md:w-64 shrink-0">
                    <div className={`rounded-xl overflow-hidden shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex md:flex-col`}>
                        {[
                            { id: 'info', label: '업소 기본 정보', icon: <Store size={18} /> },
                            { id: 'job', label: '채용 공고 관리', icon: <FileText size={18} /> },
                            { id: 'payment', label: '광고 결제/내역', icon: <CreditCard size={18} /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 md:flex-none p-4 flex items-center justify-center md:justify-start gap-3 transition-colors font-bold whitespace-nowrap
                  ${activeTab === tab.id
                                        ? `text-white md:border-r-4 md:border-transparent`
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                    }
                `}
                                style={activeTab === tab.id ? { backgroundColor: brand.primaryColor } : {}}
                            >
                                {tab.icon}
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Quick Stats Widget (Desktop Only) */}
                    <div className="hidden md:block mt-6 p-4 rounded-xl text-white bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg">
                        <h3 className="font-bold text-sm text-gray-400 mb-2">내 공고 현황</h3>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-2xl font-black text-white">ON AIR</span>
                            <span className="text-xs text-green-400 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> 노출중</span>
                        </div>
                        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-full animate-pulse"></div>
                        </div>
                        <p className="mt-3 text-xs text-gray-500">다음 점프까지 45분 남음</p>
                    </div>
                </nav>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {/* Tab 1: Shop Info */}
                    {activeTab === 'info' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className={`p-6 rounded-2xl shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 rounded-full" style={primaryBgStyle}></span>
                                    기본 정보 수정
                                </h2>

                                <div className="space-y-6">
                                    {/* Shop Name & Industry */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-500 mb-2">업소명 (상호)</label>
                                            <input
                                                type="text"
                                                value={shopInfo.name}
                                                onChange={(e) => setShopInfo({ ...shopInfo, name: e.target.value })}
                                                className={`w-full p-4 rounded-xl border font-bold text-lg ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-500 mb-2">업종 선택</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    value={shopInfo.industry}
                                                    onChange={(e) => setShopInfo({ ...shopInfo, industry: e.target.value })}
                                                    className={`w-full pl-12 p-4 rounded-xl border appearance-none font-bold ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                                >
                                                    <option value="">업종을 선택하세요</option>
                                                    {INDUSTRIES.map(ind => (
                                                        <option key={ind} value={ind}>{ind}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hierarchical Region Selection */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-2">지역 선택 (시/도 - 구/군 - 동/면)</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <select
                                                value={shopInfo.location.city}
                                                onChange={(e) => {
                                                    const newCity = e.target.value;
                                                    setShopInfo(prev => ({
                                                        ...prev,
                                                        location: { city: newCity, district: '', neighborhood: '' }
                                                    }));
                                                }}
                                                className={`p-3 rounded-lg border text-sm font-medium ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                            >
                                                <option value="">시/도</option>
                                                {Object.keys(LOCATIONS).map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={shopInfo.location.district}
                                                onChange={(e) => {
                                                    const newDistrict = e.target.value;
                                                    setShopInfo(prev => ({
                                                        ...prev,
                                                        location: { ...prev.location, district: newDistrict, neighborhood: '' }
                                                    }));
                                                }}
                                                disabled={!shopInfo.location.city}
                                                className={`p-3 rounded-lg border text-sm font-medium ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                            >
                                                <option value="">구/군</option>
                                                {districts.map(dist => (
                                                    <option key={dist} value={dist}>{dist}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={shopInfo.location.neighborhood}
                                                onChange={(e) => setShopInfo(prev => ({ ...prev, location: { ...prev.location, neighborhood: e.target.value } }))}
                                                disabled={!shopInfo.location.district}
                                                className={`p-3 rounded-lg border text-sm font-medium ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                            >
                                                <option value="">동/면</option>
                                                {neighborhoods.map(neighborhood => (
                                                    <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Contact Grid */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-2">대표 연락처</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="tel"
                                                value={shopInfo.phone}
                                                onChange={(e) => setShopInfo({ ...shopInfo, phone: e.target.value })}
                                                className={`w-full pl-12 p-3 rounded-lg border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Messenger Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-yellow-600 mb-2">카카오톡 ID</label>
                                            <div className="relative">
                                                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={18} />
                                                <input
                                                    type="text"
                                                    value={shopInfo.kakao}
                                                    onChange={(e) => setShopInfo({ ...shopInfo, kakao: e.target.value })}
                                                    className={`w-full pl-12 p-3 rounded-lg border bg-[#fae100]/10 border-yellow-200 text-gray-700`}
                                                    placeholder="카톡 아이디 입력"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-blue-500 mb-2">텔레그램 ID</label>
                                            <div className="relative">
                                                <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                                                <input
                                                    type="text"
                                                    value={shopInfo.telegram}
                                                    onChange={(e) => setShopInfo({ ...shopInfo, telegram: e.target.value })}
                                                    className={`w-full pl-12 p-3 rounded-lg border bg-[#0088cc]/10 border-blue-200 text-gray-700`}
                                                    placeholder="@아이디 (골뱅이 포함)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Job Posting */}
                    {activeTab === 'job' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className={`p-6 rounded-2xl shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 rounded-full" style={primaryBgStyle}></span>
                                    공고 내용 작성
                                </h2>

                                <div className="space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-2">공고 제목 (리스트 노출)</label>
                                        <input
                                            type="text"
                                            value={jobInfo.title}
                                            onChange={(e) => setJobInfo({ ...jobInfo, title: e.target.value })}
                                            className={`w-full p-4 rounded-xl border font-bold text-lg ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                            placeholder="예) 강남 1등 가게 / 갯수 보장 / 텃세 없음"
                                        />
                                    </div>

                                    {/* Pay Setting */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-500 mb-2">종류 선택</label>
                                            <select
                                                value={jobInfo.payType}
                                                onChange={(e) => setJobInfo({ ...jobInfo, payType: e.target.value })}
                                                className={`w-full p-3 rounded-lg border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                            >
                                                {PAY_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-500 mb-2">금액 (원)</label>
                                            <input
                                                type="text"
                                                value={jobInfo.payAmount}
                                                onChange={(e) => setJobInfo({ ...jobInfo, payAmount: e.target.value })}
                                                className={`w-full p-3 rounded-lg border text-right font-bold text-red-500 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-3">강조 태그 (최대 5개)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['당일지급', '고수익', '초보환영', '경력우대', '숙식제공', '출퇴근자유', '차비지원', '성형지원'].map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => {
                                                        if (jobInfo.tags.includes(tag)) {
                                                            setJobInfo({ ...jobInfo, tags: jobInfo.tags.filter(t => t !== tag) });
                                                        } else {
                                                            if (jobInfo.tags.length >= 5) return alert('태그는 최대 5개까지만 선택 가능합니다.');
                                                            setJobInfo({ ...jobInfo, tags: [...jobInfo.tags, tag] });
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                            ${jobInfo.tags.includes(tag)
                                                            ? `text-white border-transparent shadow-md`
                                                            : `bg-white text-gray-500 border-gray-200 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300`
                                                        }
                          `}
                                                    style={jobInfo.tags.includes(tag) ? primaryBgStyle : {}}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Image Upload (Mock) */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-3">매장/홍보 이미지</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition ${brand.theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200'}`}>
                                                    <Camera className="text-gray-300 mb-1" />
                                                    <span className="text-[10px] text-gray-400">사진 {i}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Payment (Simplified) */}
                    {activeTab === 'payment' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className={`p-8 rounded-2xl shadow-sm border text-center ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                                    <CreditCard size={32} />
                                </div>
                                <h2 className="text-xl font-bold mb-2">프리미엄 광고 이용 중</h2>
                                <p className="text-gray-500 mb-6">현재 <span className="text-red-500 font-bold">오픈 이벤트 무료 체험</span> 기간입니다.</p>

                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-left text-sm space-y-2 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">이용 상품</span>
                                        <span className="font-bold">Grand Premium (상단 노출)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">남은 기간</span>
                                        <span className="font-bold text-blue-500">89일</span>
                                    </div>
                                </div>

                                <button className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition">
                                    유료 연장하기 (상품보기)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Floating Save Button */}
                    <div className="fixed bottom-0 md:bottom-8 left-0 w-full md:w-[calc(100%-24rem)] md:ml-[18rem] p-4 bg-gradient-to-t from-white to-transparent md:bg-none z-40 pointer-events-none">
                        <button
                            className="w-full py-4 rounded-xl text-white font-bold shadow-xl flex items-center justify-center gap-2 pointer-events-auto transform transition active:scale-95"
                            style={primaryBgStyle}
                            onClick={() => alert('저장되었습니다!')}
                        >
                            <Save size={20} />
                            변경사항 저장하기
                        </button>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Tab (Alternative visibility) */}
            <div className="md:hidden h-20"></div>
        </div>
    );
}
