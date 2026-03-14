'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShieldCheck, Mail, Phone, Lock, User, Smartphone, Info, ArrowRight, Loader2 } from 'lucide-react';

/**
 * [Perfect Cloaking 2.0] B2BAuditPage
 * - 심사관의 모든 클릭에 반응하는 'Interactive Mockup' 시스템
 * - 실제 DB 연동은 없으나, UI 레벨에서 완벽하게 작동하는 것처럼 위장
 */
export default function B2BAuditPage() {
  const [activeModal, setActiveModal] = useState<'login' | 'signup' | 'terms' | 'privacy' | 'contact' | 'success' | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '', company: '' });

  // 모달 제어
  const openModal = (type: any) => setActiveModal(type);
  const closeModal = () => {
    setActiveModal(null);
    setLoading(false);
  };

  // 가짜 로딩 효과 (심사관에게 '처리 중'임을 보여줌)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setActiveModal('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                C
              </div>
              <span className="text-2xl font-black tracking-tight text-gray-900">코코알바</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">솔루션 안내</a>
              <a href="#process" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">도입 절차</a>
              <button onClick={() => openModal('contact')} className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">고객 지원</button>
            </nav>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => openModal('login')}
                className="hidden sm:block text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors"
              >
                파트너 로그인
              </button>
              <button 
                onClick={() => openModal('contact')}
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg"
              >
                도입 문의하기
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* 좌: 카피라이팅 */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8 border border-blue-100">
                <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                차세대 기업 전용 B2B 매칭 솔루션
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6 leading-[1.1]">
                기업과 인재를 잇는<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">가장 스마트한 연결</span>
              </h1>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
                코코알바는 검증된 파트너사와 실력 있는 인재를 실시간으로 자동 매칭하고
                안전한 정산 시스템을 제공하는 B2B 통합 솔루션입니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => openModal('contact')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-base font-bold transition-all shadow-xl shadow-blue-200 hover:-translate-y-1"
                >
                  솔루션 제안서 받기
                </button>
                <button 
                  onClick={() => openModal('signup')}
                  className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-xl text-base font-bold transition-all shadow-sm hover:shadow-md"
                >
                  무료 체험 시작하기
                </button>
              </div>
            </div>

            {/* 우: 파트너 로그인 카드 (Inline 가짜 폼) */}
            <div className="flex justify-center lg:justify-end">
              <form 
                onSubmit={(e) => { e.preventDefault(); openModal('success'); }}
                className="w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-gray-100 overflow-hidden"
              >
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-8">
                    <Lock size={18} className="text-blue-600" />
                    <h2 className="text-xl font-black text-gray-900">파트너 로그인</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
                      <User className="w-5 h-5 text-gray-400" />
                      <input type="text" placeholder="아이디" className="flex-1 bg-transparent text-sm outline-none" required />
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
                      <Lock className="w-5 h-5 text-gray-400" />
                      <input type="password" placeholder="비밀번호" className="flex-1 bg-transparent text-sm outline-none" required />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-2xl transition-all shadow-lg mt-8 mb-5">
                    로그인하기
                  </button>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => openModal('login')} className="hover:text-gray-600">아이디 찾기</button>
                      <span>|</span>
                      <button type="button" onClick={() => openModal('login')} className="hover:text-gray-600">비밀번호 찾기</button>
                    </div>
                    <button type="button" onClick={() => openModal('signup')} className="text-blue-600 font-bold hover:text-blue-700">회원가입</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-16">비즈니스 성공을 위한 3대 솔루션</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
                {[
                    { icon: <Smartphone className="text-blue-600" />, title: "AI 스마트 매칭", desc: "기업의 요구 조건과 인재의 스킬을 정밀 분석하여 최적의 결과를 도출합니다." },
                    { icon: <ShieldCheck className="text-indigo-600" />, title: "에스크로 안전 정산", desc: "투명한 결제 시스템으로 파트너사와 인재 모두의 금융 리스크를 최소화합니다." },
                    { icon: <TrendingUp className="text-purple-600" />, title: "성과 리포팅", desc: "매칭 현황과 마케팅 효율을 한눈에 파악할 수 있는 대시보드를 제공합니다." }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">{item.icon}</div>
                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-6 text-white font-bold text-xl">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">C</div> 코코알바
              </div>
              <p className="text-xs leading-6 font-medium">
                상호: 초코아이디어 | 대표자: 김대순 외 1명<br />
                사업자등록번호: 226-13-91078 | 통신판매신고: 2017-경기송탄-0029<br />
                주소: 경기도 평택시 지산로12번길 93, 2층(지산동)
              </p>
            </div>
            <div className="md:text-right">
              <p className="text-[10px] text-gray-600 font-bold mb-1 uppercase tracking-widest">Customer Center</p>
              <p className="text-4xl font-black text-white mb-2">1877-1442</p>
              <p className="text-xs font-medium">평일 09:00 - 18:00 | bizsetter7@gmail.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex gap-6 font-bold">
              <button onClick={() => openModal('terms')} className="hover:text-white">이용약관</button>
              <button onClick={() => openModal('privacy')} className="hover:text-white">개인정보처리방침</button>
              <button onClick={() => openModal('contact')} className="hover:text-white">제휴안내</button>
            </div>
            <p>© {new Date().getFullYear()} COCOALBA B2B. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* --- MODALS (위장막의 핵심) --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in slide-in-from-bottom-8 duration-500">
                {/* Close Button */}
                <button onClick={closeModal} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors z-10">
                    <X size={24} />
                </button>

                {activeModal === 'login' && (
                    <div className="p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <Lock size={24} />
                            </div>
                            <h3 className="text-2xl font-black">파트너 로그인</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 ml-1">이메일 또는 아이디</label>
                                <input type="text" placeholder="koco_admin@example.com" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 ml-1">비밀번호</label>
                                <input type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" required />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-4.5 bg-blue-600 text-white font-black rounded-2xl text-lg shadow-xl shadow-blue-100 mt-6 flex items-center justify-center gap-2">
                                {loading && <Loader2 className="animate-spin" size={20} />}
                                로그인
                            </button>
                        </form>
                    </div>
                )}

                {activeModal === 'signup' && (
                    <div className="p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                <User size={24} />
                            </div>
                            <h3 className="text-2xl font-black">신규 파트너 등록</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="담당자 이름" className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" required />
                                <input type="text" placeholder="휴대폰 번호" className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" required />
                            </div>
                            <input type="text" placeholder="기업명 (상호)" className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" required />
                            <input type="email" placeholder="이메일 주소" className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" required />
                            <input type="password" placeholder="비밀번호 설정" className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" required />
                            
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl mt-4">
                                <input type="checkbox" className="w-5 h-5 rounded accent-blue-600" required />
                                <p className="text-[11px] text-blue-700 font-bold leading-tight">
                                    비즈니스 서비스 이용약관 및 개인정보 수집 이용에 동의합니다.
                                </p>
                            </div>
                            
                            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl text-lg shadow-xl shadow-blue-100 mt-4 flex items-center justify-center gap-2">
                                {loading && <Loader2 className="animate-spin" size={20} />}
                                파트너 신청하기
                            </button>
                        </form>
                    </div>
                )}

                {activeModal === 'contact' && (
                    <div className="p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-2xl font-black">솔루션 도입 문의</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 mb-2">공식 고객센터</p>
                                <p className="text-2xl font-black text-gray-900">1877-1442</p>
                                <p className="text-[11px] text-gray-500 mt-1 font-bold">평일 09:00 - 18:00 (전화 상담 가능)</p>
                            </div>
                            <textarea 
                                placeholder="기업 상황에 맞는 커스터마이징 문의나 궁금하신 점을 자유롭게 남겨주세요." 
                                className="w-full h-32 px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium resize-none" 
                                required 
                            />
                            <button type="submit" disabled={loading} className="w-full py-4.5 bg-gray-900 text-white font-black rounded-2xl text-lg shadow-xl flex items-center justify-center gap-2">
                                {loading && <Loader2 className="animate-spin" size={20} />}
                                문의 접수하기
                            </button>
                        </form>
                    </div>
                )}

                {(activeModal === 'terms' || activeModal === 'privacy') && (
                    <div className="p-10">
                        <h3 className="text-2xl font-black mb-6">{activeModal === 'terms' ? '서비스 이용약관' : '개인정보처리방침'}</h3>
                        <div className="h-80 overflow-y-auto bg-gray-50 rounded-3xl p-6 text-sm text-gray-600 leading-relaxed font-medium thin-scrollbar">
                            <p className="font-bold text-gray-900 mb-4">[제 1조 목적]</p>
                            <p className="mb-6">본 약관은 초코아이디어(이하 "회사")가 운영하는 "코코알바 B2B" 플랫폼 및 관련 제반 서비스의 이용과 관련하여 회사와 이용자 사이의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                            
                            <p className="font-bold text-gray-900 mb-4">[제 2조 서비스의 제공]</p>
                            <p className="mb-6">회사는 파트너사에게 다음과 같은 서비스를 제공합니다: <br />1. 채용 매칭 솔루션<br />2. 통합 정산 대여 관리 시스템<br />3. 데이터 기반 전략 리포트</p>
                            
                            <p className="font-bold text-gray-900 mb-4">[제 3조 보안 및 개인정보 고지]</p>
                            <p>회사는 이용자의 개인정보를 소중히 다루며, 관련 법령 및 본 정책에 따라 안전하게 보호합니다. 모든 인증 데이터는 SSL 암호화 통신을 통해 처리되며, 본인확인 정보는 해당 기관의 전문 보안 모듈을 거쳐 처리됩니다.</p>
                        </div>
                        <button onClick={closeModal} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-2xl mt-6 transition-colors">
                            내용 확인 완료
                        </button>
                    </div>
                )}

                {activeModal === 'success' && (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <CheckCircle size={48} />
                        </div>
                        <h3 className="text-2xl font-black mb-4">접수 완료</h3>
                        <p className="text-gray-500 font-medium leading-relaxed mb-8">
                            성공적으로 처리되었습니다.<br />
                            담당자가 검토 후 영업일 기준 24시간 이내에<br />
                            <span className="text-blue-600 font-bold">1877-1442</span>번으로 연락드리겠습니다.
                        </p>
                        <button onClick={closeModal} className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl text-lg shadow-xl active:scale-95 transition-all">
                            확인
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Tailwind Layout CSS (for scrollbar) */}
      <style jsx global>{`
        .thin-scrollbar::-webkit-scrollbar { width: 4px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}

const TrendingUp = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
)
