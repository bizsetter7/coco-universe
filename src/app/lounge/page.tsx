'use client';

import { useBrand } from '@/components/BrandProvider';
import { Apple, Sparkles, Moon, ArrowLeft, Home, MessageCircle, User, ThumbsUp, ChevronRight, Calculator, Heart, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LoungePage() {
    const brand = useBrand();
    const [activeTab, setActiveTab] = useState('main'); // 'main', 'diet', 'mbti', 'fortune'
    const [showResult, setShowResult] = useState(false);

    const primaryStyle = { color: brand.primaryColor };
    const primaryBgStyle = { backgroundColor: brand.primaryColor };

    // Scroll to top when tab changes
    useEffect(() => {
        window.scrollTo(0, 0);
        setShowResult(false);
    }, [activeTab]);

    return (
        <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-stone-50 text-gray-800'} pb-24`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 border-b ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}>
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {activeTab === 'main' ? (
                            <Link href="/" className="p-2 hover:bg-stone-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <ArrowLeft size={20} />
                            </Link>
                        ) : (
                            <button onClick={() => setActiveTab('main')} className="p-2 hover:bg-stone-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h1 className="text-xl font-black tracking-tight">프리미엄 라운지</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold">VVIP 전용</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {activeTab === 'main' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* 상단 배너 */}
                        <div className="relative overflow-hidden rounded-3xl bg-gray-900 aspect-[16/7] flex items-center px-8 text-white shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
                            <div className="absolute inset-0 z-0">
                                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                            </div>
                            <div className="relative z-20 space-y-2">
                                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-widest uppercase">Premium Membership</span>
                                <h2 className="text-2xl md:text-3xl font-black">당신만을 위한<br /><span style={primaryStyle}>특별한 휴식 공간</span></h2>
                                <p className="text-sm text-gray-400 opacity-90 max-w-[200px] md:max-w-none">언니들의 지친 일상을 케어하는 고품격 리텐션 서비스</p>
                            </div>
                        </div>

                        {/* 서비스 카드 리스트 */}
                        <div className="grid grid-cols-1 gap-6">
                            <LoungeServiceCard
                                title="스마트 식단 & BMI"
                                desc="전문 영양사가 제안하는 체형별 맞춤 식단 가이드"
                                icon={<Apple size={28} />}
                                color="text-emerald-500"
                                bgColor="bg-emerald-50"
                                darkBg="bg-emerald-900/20"
                                onClick={() => setActiveTab('diet')}
                                brand={brand}
                            />
                            <LoungeServiceCard
                                title="컬러 & 성향 테스트"
                                desc="나의 숨겨진 퍼스널 컬러와 직업적 강점을 분석합니다"
                                icon={<Sparkles size={28} />}
                                color="text-purple-500"
                                bgColor="bg-purple-50"
                                darkBg="bg-purple-900/20"
                                onClick={() => setActiveTab('mbti')}
                                brand={brand}
                            />
                            <LoungeServiceCard
                                title="오늘의 프리미엄 사주"
                                desc="재물운부터 연애운까지, 오늘의 기운을 미리 확인하세요"
                                icon={<Moon size={28} />}
                                color="text-amber-500"
                                bgColor="bg-amber-50"
                                darkBg="bg-amber-900/20"
                                onClick={() => setActiveTab('fortune')}
                                brand={brand}
                            />
                        </div>

                        {/* 하단 섹션 - 고객 만족도 */}
                        <div className={`p-6 rounded-2xl border ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-stone-100'} shadow-sm text-center`}>
                            <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Lounge Statistics</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-2xl font-black mb-1" style={primaryStyle}>98%</div>
                                    <div className="text-[10px] text-gray-500">사용자 만족도</div>
                                </div>
                                <div className="border-x border-gray-200 dark:border-gray-700">
                                    <div className="text-2xl font-black mb-1" style={primaryStyle}>1.2k</div>
                                    <div className="text-[10px] text-gray-500">오늘의 방문자</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black mb-1" style={primaryStyle}><ThumbsUp size={24} className="inline mr-1" /></div>
                                    <div className="text-[10px] text-gray-500">리위 베스트</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 식단 관리 페이지 */}
                {activeTab === 'diet' && (
                    <div className="animate-in slide-in-from-right duration-500">
                        <div className={`p-8 rounded-3xl shadow-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-stone-100'}`}>
                            {!showResult ? (
                                <>
                                    <div className="text-center mb-8">
                                        <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-lg shadow-emerald-500/10">
                                            <Apple size={40} />
                                        </div>
                                        <h2 className="text-3xl font-black mb-2 tracking-tight">프리미엄 식단 관리</h2>
                                        <p className="text-gray-500 text-sm">과학적인 BMI 분석과 맞춤 식단으로 관리하세요.</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Height (cm)</label>
                                                <div className="relative">
                                                    <input type="number" placeholder="165" className={`w-full p-4 pl-12 rounded-2xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-stone-50 border-stone-200'}`} />
                                                    <Calculator size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Weight (kg)</label>
                                                <div className="relative">
                                                    <input type="number" placeholder="50" className={`w-full p-4 pl-12 rounded-2xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-stone-50 border-stone-200'}`} />
                                                    <Heart size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            style={{ backgroundColor: '#10b981' }}
                                            className="w-full text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[0.98] transition-transform text-lg"
                                            onClick={() => setShowResult(true)}
                                        >
                                            맞춤형 식단 리포트 받기
                                        </button>

                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed">
                                            💡 **Tip**: 균형 잡힌 식단은 피부 건강과 체력 유지의 핵심입니다. 무리한 단식보다는 규칙적인 연어, 견과류 섭취를 추천드려요!
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-6 animate-in zoom-in-95 duration-300">
                                    <h3 className="text-2xl font-black mb-6">분석 결과: <span className="text-emerald-500">정상체중</span></h3>
                                    <div className="space-y-4 text-left">
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl">
                                            <p className="font-bold text-emerald-600 mb-1">📋 맞춤 가이드</p>
                                            <p className="text-sm text-gray-600">현재 매우 건강한 상태입니다. 근육량 유지를 위해 단백질 위주의 식단을 추천합니다.</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                            <p className="font-bold text-gray-700 mb-1">🥦 오늘의 추천 식단</p>
                                            <p className="text-sm text-gray-500">아침: 귀리 요거트 / 점심: 닭가슴살 샐러드 / 저녁: 구운 생선과 야채</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowResult(false)} className="mt-8 text-sm text-gray-400 underline">다시 계산하기</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MBTI 성향 테스트 */}
                {activeTab === 'mbti' && (
                    <div className="animate-in slide-in-from-right duration-500">
                        <div className={`p-8 rounded-3xl shadow-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-stone-100'}`}>
                            <div className="text-center mb-10">
                                <div className="bg-purple-100 text-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/10 scale-110">
                                    <Sparkles size={40} />
                                </div>
                                <h2 className="text-3xl font-black mb-2 tracking-tight">컬러 & 직업 성향 테스트</h2>
                                <p className="text-gray-500 text-sm">나의 퍼스널 컬러와 직업적 케미를 확인해보세요.</p>
                            </div>

                            <div className="space-y-4">
                                <div className={`p-10 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center ${brand.theme === 'dark' ? 'border-purple-900/50 bg-purple-900/5' : 'border-purple-100 bg-purple-50/30'}`}>
                                    <Star className="text-purple-300 mb-4 animate-bounce" size={48} />
                                    <p className="text-purple-400 font-bold">당신을 분석할 12가지 질문</p>
                                    <p className="text-[10px] text-purple-300 mt-1">소요시간 약 2분</p>
                                </div>

                                <button
                                    style={{ backgroundColor: '#a855f7' }}
                                    className="w-full text-white font-black py-5 rounded-2xl shadow-xl shadow-purple-500/20 hover:scale-[0.98] transition-transform text-lg"
                                    onClick={() => alert('본 테스트는 회원가입 후 이용 가능합니다!')}
                                >
                                    테스트 시작하기 (무료)
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 사주/운세 */}
                {activeTab === 'fortune' && (
                    <div className="animate-in slide-in-from-right duration-500">
                        <div className={`p-8 rounded-3xl shadow-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-stone-100'}`}>
                            {!showResult ? (
                                <>
                                    <div className="text-center mb-10">
                                        <div className="bg-amber-100 text-amber-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
                                            <Moon size={40} />
                                        </div>
                                        <h2 className="text-3xl font-black mb-2 tracking-tight">오늘의 프리미엄 사주</h2>
                                        <p className="text-gray-500 text-sm">재물, 연애, 비즈니스 운세를 매일 아침 확인하세요.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Birth Date</label>
                                            <input type="date" className={`w-full p-5 rounded-2xl border text-lg ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-stone-50 border-stone-200'} outline-none focus:border-amber-500 transition-all`} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button className={`p-4 rounded-xl border-2 font-black transition-all ${brand.theme === 'dark' ? 'border-gray-700 text-gray-500' : 'border-stone-100 text-stone-400'}`}>오전 생</button>
                                            <button className="p-4 rounded-xl border-2 border-amber-500 bg-amber-50 text-amber-600 font-black shadow-md shadow-amber-500/10">오후 생</button>
                                        </div>

                                        <button
                                            style={{ backgroundColor: '#f59e0b' }}
                                            className="w-full text-white font-black py-5 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[0.98] transition-transform text-lg"
                                            onClick={() => setShowResult(true)}
                                        >
                                            지금 운세 확인하기
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-6 animate-in slide-in-from-bottom-4 duration-300">
                                    <div className="text-5xl mb-6">💰</div>
                                    <h3 className="text-2xl font-black mb-4">오늘의 재물운: <span className="text-amber-500">최상(★★★★★)</span></h3>
                                    <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl text-left border border-amber-100">
                                        <p className="font-bold text-amber-700 mb-2 italic">"동쪽에서 귀인이 나타나 큰 재물을 가져다줄 기운입니다."</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">오늘은 새로운 인연보다는 기존의 인연에서 큰 득이 있을 날입니다. 오후 3시에서 5시 사이가 가장 길한 시간대이니 참고하세요.</p>
                                    </div>
                                    <button onClick={() => setShowResult(false)} className="mt-8 text-sm text-gray-400 underline">다른 생일로 확인하기</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer / Nav - Reused simple nav */}
        </div>
    );
}

function LoungeServiceCard({ title, desc, icon, color, bgColor, darkBg, onClick, brand }: any) {
    return (
        <div
            onClick={onClick}
            className={`group p-6 rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm border flex items-center gap-4 ${brand.theme === 'dark' ? `bg-gray-800 ${darkBg} border-gray-700` : `${bgColor} bg-white border-stone-100`}`}
        >
            <div className={`${color} ${brand.theme === 'dark' ? 'bg-black/20' : 'bg-white'} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6`}>
                {icon}
            </div>
            <div className="flex-1">
                <h4 className="font-black text-lg mb-0.5">{title}</h4>
                <p className="text-xs text-gray-500 opacity-80">{desc}</p>
            </div>
            <ChevronRight size={20} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
        </div>
    )
}
