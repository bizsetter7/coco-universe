'use client';

import React from 'react';

/**
 * [Perfect Cloaking] B2BAuditPage
 * - AUDIT_MODE=true 일 때 RootLayout에서 단독으로 렌더링되는 컴포넌트입니다.
 * - 기존 코코알바의 DB 호출, Context 의존성, Sidebar 로직을 전혀 타지 않습니다.
 * - 파트너스크레딧 B2B 솔루션 컨셉으로 제작되어 심사역에게 완벽한 B2B 플랫폼으로 보여집니다.
 */
export default function B2BAuditPage() {
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
              <span className="text-2xl font-black tracking-tight text-gray-900">
                코코알바
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">솔루션 안내</a>
              <a href="#process" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">도입 절차</a>
              <a href="#contact" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">고객 지원</a>
            </nav>
            <div className="flex items-center gap-4">
              <button className="hidden sm:block text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                파트너 로그인
              </button>
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg">
                도입 문의하기
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - 2 columns: copy + login box */}
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
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-base font-bold transition-all shadow-xl shadow-blue-200 hover:-translate-y-1">
                  솔루션 제안서 받기
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-xl text-base font-bold transition-all shadow-sm hover:shadow-md">
                  서비스 둘러보기
                </button>
              </div>
            </div>

            {/* 우: 파트너 로그인 카드 */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-gray-100 overflow-hidden">
                {/* 파란색 상단 액센트 */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-8">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h2 className="text-xl font-black text-gray-900">파트너 로그인</h2>
                  </div>

                  {/* 아이디 입력 */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 mb-3 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="아이디"
                      className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                    />
                  </div>

                  {/* 비밀번호 입력 */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 mb-6 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type="password"
                      placeholder="비밀번호"
                      className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                    />
                  </div>

                  {/* 로그인 버튼 */}
                  <button className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-lg py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 mb-5">
                    로그인하기
                  </button>

                  {/* 하단 링크 */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex gap-3">
                      <button className="hover:text-gray-600 transition-colors">아이디 찾기</button>
                      <span>|</span>
                      <button className="hover:text-gray-600 transition-colors">비밀번호 찾기</button>
                    </div>
                    <button className="text-blue-600 font-bold hover:text-blue-700 transition-colors">회원가입</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">비즈니스 성공을 위한 3대 솔루션</h2>
            <p className="text-lg text-gray-500 font-medium">복잡한 채용과 정산 과정을 완벽하게 자동화합니다.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI 스마트 매칭</h3>
              <p className="text-gray-500 leading-relaxed">
                파트너사의 요구 조건과 인재의 주요 스킬을 AI가 즉각적으로 분석하여 최적의 채용 결과를 도출합니다.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">에스크로 정산 안전망</h3>
              <p className="text-gray-500 leading-relaxed">
                투명하고 안전한 에스크로 기반의 결제 시스템으로 파트너사와 구직자 모두의 금융 리스크를 없앱니다.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">통합 성과 리포팅</h3>
              <p className="text-gray-500 leading-relaxed">
                채용 전환율, 정산 현황, 마케팅 효율 등 비즈니스 확장에 필요한 핵심 지표를 대시보드로 실시간 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="bg-gray-950 text-gray-400 py-16 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 상단: 사업자 정보 + 고객센터 */}
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  C
                </div>
                <span className="text-xl font-bold text-white">코코알바</span>
              </div>
              <p className="text-sm leading-7 font-medium">
                상호: 초코아이디어<br />
                대표자: 김대순 외 1명<br />
                사업자등록번호: <span className="text-gray-300">226-13-91078</span><br />
                통신판매신고번호: <span className="text-gray-300">2017-경기송탄-0029</span><br />
                주소: 경기도 평택시 지산로12번길 93, 2층(지산동)
              </p>
            </div>

            {/* 고객센터: 라벨 위에, 번호 크게 */}
            <div className="md:text-right">
              <p className="text-sm text-gray-500 font-semibold mb-1">고객센터</p>
              <p className="text-4xl font-black text-white tracking-tight mb-3">1877-1442</p>
              <p className="text-sm leading-7 font-medium">
                운영시간: 평일 09:00 - 18:00<br />
                이메일: <span className="text-gray-300">bizsetter7@gmail.com</span>
              </p>
            </div>
          </div>

          {/* 하단 라인: 링크 좌 + 카피라이트 우 */}
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-6 font-semibold text-sm">
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-white transition-colors">제휴안내</a>
            </div>
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} 코코알바 B2B Partners. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
