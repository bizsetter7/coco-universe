'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X, MapPin, Phone, MessageCircle, Heart, Share2,
  ChevronDown, CheckCircle2, ShieldCheck, Clock,
  Gift, Info, MessageSquare, Navigation, Briefcase
} from 'lucide-react';
import { Shop } from '@/types/shop';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor, getPayAbbreviation } from '@/utils/payColors';
import { useAdultGate } from '@/hooks/useAdultGate';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface ShopDetailViewProps {
  shop: Shop;
  onClose?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export default function ShopDetailView({ 
  shop, 
  onClose = () => window.history.back(), 
  isFavorite = false, 
  onToggleFavorite = () => {} 
}: ShopDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'conditions' | 'welfare' | 'location'>('conditions');
  const { requireVerification } = useAdultGate();
  const [scrolled, setScrolled] = useState(false);
  const [tier, setTier] = useState<string | null>(null);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 100);
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // cocoalba_tier 배지 조회
  useEffect(() => {
    if (!shop.user_id) return;
    supabase
      .from('businesses')
      .select('cocoalba_tier')
      .eq('owner_id', shop.user_id)
      .single()
      .then(({ data }) => {
        if (data?.cocoalba_tier) setTier(data.cocoalba_tier);
      });
  }, [shop.user_id]);

  const tabs = [
    { id: 'conditions', label: '근무조건' },
    { id: 'welfare', label: '복리후생' },
    { id: 'location', label: '상세위치' },
  ] as const;

  const heroImage = shop.banner_image_url || shop.options?.mediaUrl || 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=1200&auto=format&fit=crop';

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 overflow-hidden">
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
      {/* 2. Hero Section (헤더 버튼 포함 — 절대 오버레이) */}
      <div className="relative aspect-[4/3] md:aspect-video w-full overflow-hidden bg-zinc-900">
        <img
          src={heroImage}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* 헤더 버튼: 히어로 위에 절대 오버레이 */}
        <div className="absolute top-0 inset-x-0 z-[100] py-4 px-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 text-white backdrop-blur-md"
          >
            <X size={20} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={onToggleFavorite}
              className="p-2 rounded-full bg-black/30 text-white backdrop-blur-md"
            >
              <Heart size={20} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
            </button>
            <button className="p-2 rounded-full bg-black/30 text-white backdrop-blur-md">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Ad No & Badges */}
        <div className="absolute bottom-6 inset-x-0 px-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              {shop.tier === 'premium' ? 'Premium' : 'Standard'}
            </span>
            <span className="text-white/60 text-[10px] font-mono">No.{shop.id || '0000'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight break-keep">
            {shop.title || shop.name}
          </h1>
        </div>
      </div>

      {/* 3. Main Info Section */}
      <div className="bg-white px-5 pt-7 pb-8 rounded-t-[2.5rem] -mt-8 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">

        {/* 가게명 + 검증배지 */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <h2 className="text-xl font-black text-gray-900 leading-tight break-keep">{shop.name}</h2>
              <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
              {tier === 'premium' && (
                <span className="text-[9px] bg-yellow-400 text-black font-black px-1.5 py-0.5 rounded-full shrink-0">PREMIUM</span>
              )}
              {tier === 'standard' && (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30 shrink-0">스탠다드</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold">
              <MapPin size={10} />
              <span>{shop.region}</span>
              {shop.category && <><span className="text-gray-200">·</span><span>{shop.category}</span></>}
            </div>
          </div>
        </div>

        {/* 급여 — 크게 강조 */}
        <div className={`w-full rounded-2xl px-5 py-4 mb-5 bg-gray-900 flex items-center justify-between`}>
          <div>
            <div className="text-[10px] text-gray-400 font-bold mb-0.5 uppercase tracking-widest">급여</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-md text-white ${getPayColor(shop.payType || shop.pay)}`}>
                {getPayAbbreviation(shop.payType || shop.pay)}
              </span>
              <span className="text-2xl font-black text-white tracking-tighter">
                {formatKoreanMoney(shop.pay)}
              </span>
            </div>
          </div>
          {(shop.options?.paySuffixes || []).length > 0 && (
            <div className="flex flex-col gap-1 items-end">
              {(shop.options?.paySuffixes || []).slice(0, 2).map((s: string, i: number) => (
                <span key={i} className="text-[9px] px-2 py-0.5 bg-white/10 text-white/70 rounded font-bold whitespace-nowrap">{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* 빠른 정보 칩 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { icon: <Clock size={10} />, label: shop.workTime || '시간 협의', color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { icon: <MapPin size={10} />, label: shop.region, color: 'bg-rose-50 text-rose-600 border-rose-100' },
            { icon: <Info size={10} />, label: shop.age ? `${shop.age}대 지원` : '나이 무관', color: 'bg-purple-50 text-purple-600 border-purple-100' },
            { icon: <Briefcase size={10} />, label: shop.payType || '파트타임', color: 'bg-amber-50 text-amber-600 border-amber-100' },
          ].filter(c => c.label).map((chip, i) => (
            <div key={i} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold border ${chip.color}`}>
              {chip.icon}<span>{chip.label}</span>
            </div>
          ))}
        </div>

        {/* Accordion: 안심지원보증 + 광고 펼쳐보기 */}
        <div className="mb-6 rounded-2xl border border-rose-100 overflow-hidden">
          <button
            onClick={() => setAccordionOpen(prev => !prev)}
            className="w-full bg-rose-50 px-4 py-3.5 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-100 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-xs font-black text-rose-600">안심지원 보증</div>
                <div className="text-[10px] text-rose-400 font-medium">허위공고·선금 사기 없는 검증 업소</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-rose-400 shrink-0">
              <span className="text-[10px] font-black">{accordionOpen ? '접기' : '공고보기'}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${accordionOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {accordionOpen && (
            <div className="bg-white px-5 py-4 border-t border-rose-100">
              <div
                className="prose prose-sm max-w-none text-gray-600 leading-relaxed break-words"
                dangerouslySetInnerHTML={{ __html: shop.description || '상세 내용이 없습니다.' }}
              />
              {(shop.options?.keywords || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-4">
                  {(shop.options?.keywords || []).map((kw: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-100">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Menu */}
        <div className="sticky top-0 bg-white z-50 -mx-5 px-5 mb-5" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3.5 text-xs font-black transition-all relative ${
                  activeTab === tab.id ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gray-900 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-3 pb-2">
          {activeTab === 'conditions' && (
            <div className="space-y-3">
              {[
                { icon: <Clock size={15} />, label: '근무시간', value: shop.workTime || '협의', accent: 'text-blue-500 bg-blue-50' },
                { icon: <MapPin size={15} />, label: '근무지역', value: shop.businessAddress || shop.region, accent: 'text-rose-500 bg-rose-50' },
                { icon: <Info size={15} />, label: '지원자격', value: shop.age ? `${shop.age}대 지원 가능` : '나이 무관', accent: 'text-purple-500 bg-purple-50' },
                { icon: <Briefcase size={15} />, label: '고용형태', value: shop.payType || '파트타임', accent: 'text-amber-500 bg-amber-50' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.accent}`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{item.label}</div>
                    <div className="text-sm font-black text-gray-800 truncate">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'welfare' && (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 font-bold mb-3">제공 혜택</p>
              <div className="grid grid-cols-2 gap-2">
                {(shop.options?.icons || ['식사제공', '숙소제공', '차비지원', '당일지급']).map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-50 shrink-0">
                      <Gift size={16} />
                    </div>
                    <span className="text-xs font-black text-gray-700 leading-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-3">
              {/* 지도 영역 */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 relative" style={{ height: 200 }}>
                {shop.businessAddress ? (
                  <iframe
                    title="지도"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(shop.businessAddress)}&output=embed&z=15`}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300">
                    <Navigation size={32} />
                    <span className="text-[11px] font-bold">문의 시 위치 안내</span>
                  </div>
                )}
              </div>

              {/* 주소 */}
              <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-3">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-rose-500 shrink-0 border border-gray-100 shadow-sm">
                  <MapPin size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">근무 주소</div>
                  <div className="text-sm font-black text-gray-800 break-keep leading-snug">
                    {shop.businessAddress || '문의 시 상세 주소 안내'}
                  </div>
                </div>
              </div>

              {/* 채용 메시지 */}
              {shop.options?.welcomeMessage && (
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-rose-500" />
                    <span className="text-xs font-black text-rose-600">사장님 한마디</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed break-keep">{shop.options.welcomeMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>{/* /스크롤 영역 끝 */}

      {/* 4. Footer CTA Buttons — 항상 하단 고정 (flex-none) */}
      <div className="flex-none bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex gap-3 safe-area-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => requireVerification(() => {
            const messengerId = shop.kakao || shop.telegram;
            if (messengerId) {
              navigator.clipboard.writeText(messengerId);
              alert(`${shop.kakao ? '카카오톡' : '텔레그램'} ID가 복사되었습니다: ${messengerId}`);
            } else {
              alert('등록된 메신저 ID가 없습니다.');
            }
          })}
          className="flex-1 h-14 bg-amber-400 text-black rounded-2xl flex flex-col items-center justify-center gap-0.5 hover:bg-amber-500 transition shadow-sm"
        >
          <MessageCircle size={20} fill="currentColor" />
          <span className="text-[10px] font-black">카톡문의</span>
        </button>

        <button
          onClick={() => requireVerification(() => {
            window.location.href = `tel:${shop.phone}`;
          })}
          className="flex-[2] h-14 bg-[#f82b60] text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-[#db2456] transition shadow-lg shadow-rose-200"
        >
          <Phone size={18} fill="currentColor" />
          <span className="text-sm font-black tracking-tight">전화/문자 상담하기</span>
        </button>
      </div>
    </div>
  );
}
