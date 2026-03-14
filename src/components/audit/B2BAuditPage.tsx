'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Mail, Lock, User, Monitor, ShieldCheck, BarChart3, ChevronRight } from 'lucide-react';

/**
 * [Perfect Cloaking 2.0] B2BAuditPage
 * - 대장님의 캡처본(1~3)을 바탕으로 정밀 재현한 B2B 심사용 페이지
 * - 실제 배포본과 동일한 구조 (Hero -> 3대 솔루션 -> Footer)
 * - 억지로 눌린 화면이 아닌 진정한 반응형(Responsive) 레이아웃 적용
 */
export default function B2BAuditPage() {
  const [activeModal, setActiveModal] = useState<'login' | 'contact' | 'signup' | 'success' | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const openModal = (type: 'login' | 'contact' | 'signup' | 'success', title?: string) => {
    setActiveModal(type);
    if (title) setModalTitle(title);
  };

  const closeModal = () => {
    setActiveModal(null);
    setLoading(false);
    setModalTitle('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setActiveModal('success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      {/* 🟢 Header (캡처 1 기반) */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-100">C</div>
            <span className="text-2xl font-black tracking-tighter text-gray-900 uppercase">코코알바</span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-10 text-[15px] font-bold text-gray-600">
            <button onClick={() => openModal('contact', '솔루션 상세 안내')} className="hover:text-blue-600 transition-colors">솔루션 안내</button>
            <button onClick={() => openModal('contact', '도입 절차 상담')} className="hover:text-blue-600 transition-colors">도입 절차</button>
            <button onClick={() => openModal('contact', '고객 지원 문의')} className="hover:text-blue-600 transition-colors">고객 지원</button>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => openModal('login')} className="hidden sm:block text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors pr-4 border-r border-gray-200">파트너 로그인</button>
            <button 
              onClick={() => openModal('contact', '도입 문의')}
              className="bg-slate-900 hover:bg-black active:scale-95 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg"
            >
              도입 문의하기
            </button>
          </div>
        </div>
      </header>

      {/* 🔴 Hero Section (캡처 1 기반) */}
      <section className="bg-[#fcfdfe] pt-20 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-3/5 text-left animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full mb-8 font-bold text-blue-600 text-[13px]">
               <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
               차세대 기업 전용 B2B 매칭 솔루션
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tighter">
              기업과 인재를 잇는<br />
              <span className="text-blue-600">가장 스마트한 연결</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-lg mb-10 font-medium leading-relaxed">
              코코알바는 검증된 파트너사와 실력 있는 인재를 실시간으로 자동 매칭하고 안전한 정산 시스템을 제공하는 B2B 통합 솔루션입니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <button onClick={() => openModal('contact', '솔루션 제안서 신청')} className="bg-blue-600 text-white px-10 py-4.5 rounded-2xl text-[17px] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 text-center">
                솔루션 제안서 받기
               </button>
               <button onClick={() => openModal('contact', '무료 체험 신청')} className="bg-white text-gray-600 border border-gray-200 px-10 py-4.5 rounded-2xl text-[17px] font-black hover:bg-gray-50 transition-all active:scale-95 text-center">
                무료 체험 시작하기
               </button>
            </div>
          </div>

          <div className="w-full lg:w-2/5 animate-in fade-in slide-in-from-right-8 duration-700">
             <div className="bg-white rounded-[40px] p-10 relative overflow-hidden border border-gray-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)]">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                <div className="flex items-center gap-3 mb-10">
                  <Lock size={20} className="text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">파트너 로그인</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group">
                    <User size={18} className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <input type="text" placeholder="아이디" className="w-full h-14 bg-gray-50 rounded-xl px-14 text-sm font-semibold border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all outline-none" required />
                  </div>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <input type="password" placeholder="비밀번호" className="w-full h-14 bg-gray-50 rounded-xl px-14 text-sm font-semibold border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all outline-none" required />
                  </div>
                  <button className="w-full py-4.5 bg-blue-600 text-white font-black text-lg rounded-xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all mt-6">
                    {loading ? '인증 중...' : '로그인하기'}
                  </button>
                  <div className="flex items-center justify-between px-2 pt-4 text-[13px] text-gray-400 font-bold">
                    <div className="flex gap-3">
                      <span onClick={() => openModal('contact', '계정 찾기 문의')} className="hover:text-gray-900 cursor-pointer">아이디 찾기</span>
                      <span className="w-px h-3 bg-gray-200 mt-0.5" />
                      <span onClick={() => openModal('contact', '비밀번호 재설정 문의')} className="hover:text-gray-900 cursor-pointer">비밀번호 찾기</span>
                    </div>
                    <span onClick={() => openModal('signup')} className="text-blue-600 hover:underline cursor-pointer">회원가입</span>
                  </div>
                </form>
             </div>
          </div>
        </div>
      </section>

      {/* 🔵 Features Section (캡처 2 기반) */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 mb-20 tracking-tighter">비즈니스 성공을 위한 3대 솔루션</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: 'AI 스마트 매칭', icon: Monitor, color: 'blue', desc: '기업의 요구 조건과 인재의 스킬을 정밀 분석하여 최적의 결과를 도출합니다.' },
              { title: '에스크로 안전 정산', icon: ShieldCheck, color: 'indigo', desc: '투명한 결제 시스템으로 파트너사와 인재 모두의 금융 리스크를 최소화합니다.' },
              { title: '성과 리포팅', icon: BarChart3, color: 'purple', desc: '매칭 현황과 마케팅 효율을 한눈에 파악할 수 있는 대시보드를 제공합니다.' }
            ].map((feature, i) => (
              <div key={i} onClick={() => openModal('contact', feature.title + ' 도입 문의')} className="bg-white p-10 rounded-[30px] border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50/50 transition-all group cursor-pointer">
                <div className={`w-14 h-14 bg-${feature.color}-50 text-${feature.color}-600 rounded-2xl flex items-center justify-center mb-8`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-black mb-4 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 font-bold text-[15px] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⚫ Footer (캡처 3 기반) */}
      <footer className="bg-[#0f1115] text-gray-400 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
              <span className="text-xl font-black text-white uppercase tracking-tighter">코코알바</span>
            </div>
            <div className="text-[13px] font-bold leading-7">
              상호: 초코아이디어 | 대표: 김대순 외 1명<br />
              사업자등록번호: 226-13-91078 | 통신판매신고: 2017-경기송탄-0029<br />
              주소: 경기도 평택시 지산로12번길 93, 2층(지산동)
            </div>
            <div className="flex gap-6 text-[13px] font-bold">
              <span onClick={() => openModal('contact', '이용약관 안내')} className="hover:text-white cursor-pointer transition-colors">이용약관</span>
              <span onClick={() => openModal('contact', '개인정보처리방침 안내')} className="hover:text-white cursor-pointer transition-colors">개인정보처리방침</span>
              <span onClick={() => openModal('contact', 'B2B 제휴 제안')} className="hover:text-white cursor-pointer transition-colors">제휴안내</span>
            </div>
          </div>

          <div className="md:text-right space-y-4">
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Customer Center</p>
            <p className="text-4xl font-black text-white tracking-tighter mb-2">1877-1442</p>
            <p className="text-[13px] font-bold text-gray-500">평일 09:00 - 18:00 | bizsetter7@gmail.com</p>
            <p className="pt-10 text-[12px] font-medium opacity-50">© 2026 COCOALBA B2B. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals Container */}
      {(activeModal === 'success' || activeModal === 'contact' || activeModal === 'login' || activeModal === 'signup') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeModal} />
          
          {/* Success Modal */}
          {activeModal === 'success' && (
            <div className="relative bg-white w-full max-w-sm rounded-[32px] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3 text-gray-900">확인 완료</h3>
              <p className="text-[14px] text-gray-400 font-bold mb-8">요청하신 내용이 성공적으로 접수되었습니다.<br />담당자가 신속하게 연락드리겠습니다.</p>
              <button onClick={closeModal} className="w-full py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-black active:scale-95 transition-all">확인</button>
            </div>
          )}

          {/* Contact & Signup Modal */}
          {(activeModal === 'contact' || activeModal === 'signup') && (
            <div className="relative bg-white w-full max-w-md rounded-[40px] p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button onClick={closeModal} className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
              <h3 className="text-3xl font-black mb-2 tracking-tighter">
                {activeModal === 'signup' ? '파트너 가입 신청' : (modalTitle || '도입 문의하기')}
              </h3>
              
              {/* 전용 모달 콘텐츠 분기 (텍스트형 메뉴) */}
              {modalTitle && (modalTitle.includes('약관') || modalTitle.includes('방침') || modalTitle.includes('제휴')) ? (
                <div className="mt-6 max-h-[400px] overflow-y-auto pr-2 space-y-6 text-[13px] text-gray-600 font-medium leading-relaxed custom-scrollbar">
                  {modalTitle.includes('약관') && (
                    <>
                      <p className="font-black text-gray-900">[제 1조 목적]</p>
                      <p>본 약관은 코코알바 B2B 솔루션(이하 "회사")이 제공하는 모든 제반 서비스의 이용 조건 및 절차, 이용자와 회사의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                      <p className="font-black text-gray-900">[제 2조 서비스의 제공]</p>
                      <p>회사는 파트너사에게 인재 매칭, 정산 대행, 성과 분석 리포트 등 기업 경영에 필요한 통합 솔루션을 제공합니다.</p>
                      <p className="font-black text-gray-900">[제 3조 의무]</p>
                      <p>이용자는 관련 법령, 본 약관의 규정 및 서비스 이용 안내를 준수하여야 합니다.</p>
                    </>
                  )}
                  {modalTitle.includes('방침') && (
                    <>
                      <p className="font-black text-gray-900">[수집하는 개인정보 항목]</p>
                      <p>회사명, 담당자명, 연락처, 이메일 주소 등 상담 및 서비스 제공에 필요한 최소한의 정보를 수집합니다.</p>
                      <p className="font-black text-gray-900">[정보의 수집 및 이용목적]</p>
                      <p>수집된 정보는 제휴 상담, 서비스 안내, 고객 지원 및 마케팅 자료(동의 시)로 활용됩니다.</p>
                      <p className="font-black text-gray-900">[보유 및 이용기간]</p>
                      <p>원천적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>
                    </>
                  )}
                  {modalTitle.includes('제휴') && (
                    <>
                      <p className="font-black text-gray-900">[전략적 제휴 제안]</p>
                      <p>코코알바는 기업 인프라, 결제 시스템, 마케팅 제휴 등 다양한 분야의 파트너십을 환영합니다.</p>
                      <p>제안 주신 내용은 담당 부서의 검토를 거쳐 3~5 영업일 이내에 회신 드립니다.</p>
                      <p className="pt-4 p-4 bg-gray-50 rounded-xl font-black text-blue-600">제휴 문의: bizsetter7@gmail.com</p>
                    </>
                  )}
                  <button onClick={closeModal} className="w-full py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-black active:scale-95 transition-all mt-6">내용 확인 완료</button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-400 font-bold mb-10 leading-relaxed">
                    {activeModal === 'signup' 
                      ? '코코알바 파트너십 가입을 위해 기업 정보를 남겨주시면 담당자가 승인 절차를 안내드립니다.' 
                      : '코코알바 B2B 솔루션 전문가가 파트너사의 비즈니스를 분석하여 최적의 제안을 드립니다.'}
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="담당자명(또는 기업명)" className="w-full h-14 bg-gray-50 rounded-xl px-6 text-sm font-semibold border-2 border-transparent focus:border-blue-100 outline-none" required />
                    <input type="tel" placeholder="연락처 (- 제외)" className="w-full h-14 bg-gray-50 rounded-xl px-6 text-sm font-semibold border-2 border-transparent focus:border-blue-100 outline-none" required />
                    <button className="w-full py-4.5 bg-blue-600 text-white font-black text-lg rounded-xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all mt-6">
                      {loading ? '처리 중...' : (activeModal === 'signup' ? '가입 신청하기' : '상담 신청하기')}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Login Modal (New) */}
          {activeModal === 'login' && (
            <div className="relative bg-white w-full max-w-md rounded-[40px] p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button onClick={closeModal} className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">C</div>
                <h3 className="text-2xl font-black tracking-tighter">파트너 로그인</h3>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <User size={18} className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" placeholder="아이디" className="w-full h-14 bg-gray-50 rounded-xl px-14 text-sm font-semibold border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all outline-none" required />
                </div>
                <div className="relative group">
                  <Lock size={18} className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input type="password" placeholder="비밀번호" className="w-full h-14 bg-gray-50 rounded-xl px-14 text-sm font-semibold border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all outline-none" required />
                </div>
                <button className="w-full py-4.5 bg-blue-600 text-white font-black text-lg rounded-xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all mt-6">
                  {loading ? '인증 중...' : '로그인하기'}
                </button>
                <div className="text-center pt-6">
                  <span onClick={() => openModal('signup')} className="text-[13px] font-bold text-blue-600 hover:underline cursor-pointer">아직 파트너가 아니신가요? 가입 신청하기</span>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
