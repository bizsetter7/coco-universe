'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, MapPin, Phone, MessageCircle, Heart, Share2, 
  ChevronRight, CheckCircle2, ShieldCheck, Clock, 
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
  const [activeTab, setActiveTab] = useState<'content' | 'conditions' | 'welfare' | 'location'>('content');
  const { requireVerification } = useAdultGate();
  const [scrolled, setScrolled] = useState(false);
  const [tier, setTier] = useState<string | null>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    { id: 'content', label: '공고내용' },
    { id: 'conditions', label: '근무조건' },
    { id: 'welfare', label: '복리후생' },
    { id: 'location', label: '상세위치' },
  ] as const;

  const heroImage = shop.banner_image_url || shop.options?.mediaUrl || 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=1200&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 1. Header Navigation (Sticky on scroll) */}
      <div className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm border-b border-gray-100 py-3' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-[600px] mx-auto px-4 flex justify-between items-center">
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-all ${
              scrolled ? 'bg-gray-100 text-gray-900' : 'bg-black/20 text-white backdrop-blur-md'
            }`}
          >
            <X size={20} />
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={onToggleFavorite}
              className={`p-2 rounded-full transition-all ${
                scrolled ? 'bg-gray-100 text-gray-900' : 'bg-black/20 text-white backdrop-blur-md'
              }`}
            >
              <Heart size={20} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
            </button>
            <button className={`p-2 rounded-full transition-all ${
              scrolled ? 'bg-gray-100 text-gray-900' : 'bg-black/20 text-white backdrop-blur-md'
            }`}>
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="relative aspect-[4/3] md:aspect-video w-full overflow-hidden bg-zinc-900">
        <img 
          src={heroImage} 
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
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
      <div className="bg-white px-6 py-8 rounded-t-[2.5rem] -mt-8 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              {shop.name}
              <CheckCircle2 size={16} className="text-blue-500" />
              {tier === 'premium' && (
                <span className="text-[10px] bg-yellow-400 text-black font-black px-2 py-0.5 rounded-full">
                  PREMIUM
                </span>
              )}
              {tier === 'standard' && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  스탠다드
                </span>
              )}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
              <MapPin size={12} />
              {shop.region} · {shop.category || '업종'}
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-white font-black text-xs ${getPayColor(shop.payType || shop.pay)}`}>
              <span>{getPayAbbreviation(shop.payType || shop.pay)}</span>
              <span className="text-base">{formatKoreanMoney(shop.pay)}</span>
            </div>
          </div>
        </div>

        {/* Confidence Support Section (Heeyaya style) */}
        <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="text-xs font-black text-rose-600">안심지원 보증</div>
              <div className="text-[10px] text-rose-400 font-bold">허위공고 및 선금 사기 없는 검증된 업소</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-rose-300" />
        </div>

        {/* Tab Menu */}
        <div className="sticky top-[60px] bg-white z-50 border-b border-gray-100 -mx-6 px-6 mb-6">
          <div className="flex justify-between">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-xs md:text-sm font-black transition-all relative ${
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Accordion Style Details */}
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed break-words"
                dangerouslySetInnerHTML={{ __html: shop.description || '상세 내용이 없습니다.' }}
              />
              
              {/* Keywords Tag */}
              <div className="flex flex-wrap gap-2 pt-4">
                {(shop.options?.keywords || []).map((kw: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-200">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'conditions' && (
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: <Clock size={16} />, label: '근무시간', value: shop.workTime || '협의' },
                { icon: <MapPin size={16} />, label: '근무지역', value: shop.businessAddress || shop.region },
                { icon: <Info size={16} />, label: '지원자격', value: shop.age ? `${shop.age}대 지원 가능` : '나이 무관' },
                { icon: <Briefcase size={16} />, label: '고용형태', value: shop.payType || '파트타임' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-gray-400">{item.icon}</div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{item.label}</div>
                    <div className="text-sm font-black text-gray-800">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'welfare' && (
            <div className="grid grid-cols-2 gap-3">
              {(shop.options?.icons || ['식사제공', '숙소제공', '차비지원', '당일지급']).map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-500 shadow-sm border border-blue-50">
                    <Gift size={18} />
                  </div>
                  <span className="text-xs font-black text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="aspect-video rounded-3xl bg-gray-100 border border-gray-100 overflow-hidden relative shadow-inner">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <Navigation size={28} className="animate-pulse" />
                  <span className="text-[10px] font-bold">지도 로딩 중...</span>
                </div>
              </div>
              <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="text-xs font-black text-gray-900 mb-1">근무 상세 주소</div>
                  <div className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    {shop.businessAddress || '상세 주소는 문의 시 안내해 드립니다.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Footer CTA Buttons (Sticky Bottom) */}
      <div className="fixed bottom-0 inset-x-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex gap-3 safe-area-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
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
