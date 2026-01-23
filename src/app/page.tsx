'use client';

import { useBrand } from '@/components/BrandProvider';
import { Crown, Flame, Home, MessageCircle, Pencil, PlusCircle, ShoppingBag, User, Siren, AlertTriangle, Lock, ThumbsUp, Apple, Sparkles, Moon, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function HomePortal() {
  const brand = useBrand();
  const [currentPage, setCurrentPage] = useState('home');

  const primaryStyle = { color: brand.primaryColor };
  const primaryBgStyle = { backgroundColor: brand.primaryColor };

  return (
    <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} pb-20`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <span className="text-2xl font-black tracking-tighter">
              {brand.displayName.split(' ')[0]}
              <span style={primaryStyle} className="ml-1">
                {brand.displayName.split(' ').slice(1).join(' ')}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-500 hover:text-gray-900" onClick={() => setCurrentPage('login')}>로그인</button>
            <button
              style={primaryBgStyle}
              className="text-white px-4 py-2 rounded-full text-sm font-bold shadow-md hover:opacity-90 transition flex items-center gap-1"
              onClick={() => setCurrentPage('payment')}
            >
              <Pencil size={14} /> 사장님 무료등록
            </button>
          </div>
        </div>
      </header>

      <main>
        {currentPage === 'home' && (
          <div className="page-home animate-in fade-in duration-500">
            {/* 롤링 배너 */}
            <div className="bg-gray-900 h-64 md:h-80 relative overflow-hidden flex items-center justify-center text-white text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80 z-0"></div>
              <div className="relative z-10 px-4">
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold mb-2 inline-block animate-pulse">GRAND OPEN</span>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">사장님! <span style={primaryStyle}>3개월 광고 무료</span> 이벤트</h2>
                <p className="text-lg text-gray-300 mb-8">지금 가입하면 유료 상품 300만원 상당이 0원!</p>
                <button
                  className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition"
                  onClick={() => setCurrentPage('payment')}
                >
                  무료로 광고 올리기
                </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
              {/* 베스트 썰 (유입용) */}
              <div onClick={() => setCurrentPage('community')} className={`border p-4 rounded-xl shadow-sm mb-10 cursor-pointer hover:opacity-90 transition ${brand.theme === 'dark' ? 'bg-gray-800 border-pink-900' : 'bg-white border-pink-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-pink-500 flex items-center gap-1"><Flame size={16} /> 실시간 핫 이슈</span>
                  <span className="text-xs text-gray-400">더보기 &gt;</span>
                </div>
                <div className="space-y-2">
                  <p className="truncate text-sm">🔥 <strong>[블랙]</strong> 강남 ㅇㅇ가게 절대 가지마세요 (녹취 있음)</p>
                  <p className="truncate text-sm">💬 어제 팁으로만 100만원 받은 썰 푼다 ㅋㅋ</p>
                </div>
              </div>

              {/* 광고 영역 (그랜드) */}
              <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                <Crown size={20} style={{ fill: brand.primaryColor, color: brand.primaryColor }} />
                <span>그랜드 프리미엄</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { region: '수원', title: '인계동 1등', pay: 'TC 130,000 / 당일' },
                  { region: '평택', title: '텃세없는 곳', pay: '일 50만 보장' },
                  { region: '강남', title: '단기 고수익', pay: '월 1000만 가능' },
                  { region: '부산', title: '해운대 신규', pay: '당일 현금 지급' },
                ].map((item, i) => (
                  <div key={i} className={`border-2 rounded-lg overflow-hidden shadow-md relative ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-white'}`} style={{ borderColor: i === 0 ? brand.primaryColor : undefined }}>
                    {i === 0 && <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-2 py-0.5 font-bold z-10">급구</span>}
                    <div className={`h-32 flex items-center justify-center text-gray-400 text-xs ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>이미지</div>
                    <div className="p-3">
                      <h4 className="font-bold text-sm truncate">[{item.region}] {item.title}</h4>
                      <p className="text-red-500 font-bold text-xs">{item.pay}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 프리미엄 라운지 (여성 타겟 리텐션 도구) */}
              <div className="mt-12">
                <h3 className="flex items-center gap-2 text-xl font-bold mb-6">
                  <Sparkles size={20} className="text-amber-500" />
                  <span>프리미엄 라운지</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => setCurrentPage('diet')}
                    className={`p-6 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform shadow-sm border ${brand.theme === 'dark' ? 'bg-gradient-to-br from-green-900/20 to-gray-800 border-green-900/30' : 'bg-gradient-to-br from-green-50 to-white border-green-100'}`}
                  >
                    <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/20">
                      <Apple size={24} />
                    </div>
                    <h4 className="font-bold text-lg mb-1">식단 & BMI 관리</h4>
                    <p className="text-sm text-gray-500 mb-4">내 건강 점수와 맞춤 식단을 확인하세요.</p>
                    <div className="flex items-center text-xs font-bold text-green-500">
                      바로가기 <ArrowRight size={14} className="ml-1" />
                    </div>
                  </div>

                  <div
                    onClick={() => setCurrentPage('mbti')}
                    className={`p-6 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform shadow-sm border ${brand.theme === 'dark' ? 'bg-gradient-to-br from-purple-900/20 to-gray-800 border-purple-900/30' : 'bg-gradient-to-br from-purple-50 to-white border-purple-100'}`}
                  >
                    <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-500/20">
                      <Sparkles size={24} />
                    </div>
                    <h4 className="font-bold text-lg mb-1">성향 & 컬러 테스트</h4>
                    <p className="text-sm text-gray-500 mb-4">나에게 맞는 메이크업과 직업 성향은?</p>
                    <div className="flex items-center text-xs font-bold text-purple-500">
                      테스트 시작 <ArrowRight size={14} className="ml-1" />
                    </div>
                  </div>

                  <div
                    onClick={() => setCurrentPage('fortune')}
                    className={`p-6 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform shadow-sm border ${brand.theme === 'dark' ? 'bg-gradient-to-br from-amber-900/20 to-gray-800 border-amber-900/30' : 'bg-gradient-to-br from-amber-50 to-white border-amber-100'}`}
                  >
                    <div className="bg-amber-500 w-12 h-12 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/20">
                      <Moon size={24} />
                    </div>
                    <h4 className="font-bold text-lg mb-1">오늘의 사주 & 운세</h4>
                    <p className="text-sm text-gray-500 mb-4">오늘의 재물운과 연애운을 무료로 확인!</p>
                    <div className="flex items-center text-xs font-bold text-amber-500">
                      운세 보기 <ArrowRight size={14} className="ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'payment' && (
          <div className="max-w-2xl mx-auto px-4 py-8 animate-in slide-in-from-bottom duration-500">
            <div className={`p-6 md:p-8 rounded-2xl shadow-lg border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ borderColor: brand.primaryColor }}>
              <h2 className="text-2xl font-bold mb-2 text-center">사장님 전용 상품 안내</h2>
              <div className="bg-red-50 text-red-600 text-center text-sm p-2 rounded mb-6 font-bold">
                🎉 오픈 기념 선착순 100업소 3개월 무료 체험 진행 중!
              </div>

              <div className="space-y-4 mb-8">
                <label className="block p-4 border-2 border-red-500 bg-red-50/50 rounded-xl cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-3 py-1 font-bold">EVENT</div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block font-bold text-lg">기본 광고 (3개월)</span>
                      <span className="text-sm text-gray-500">배너 노출 + 인재 열람권 포함</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-gray-400 line-through text-xs">300,000원</span>
                      <span className="text-2xl font-black text-red-500">0원</span>
                    </div>
                  </div>
                </label>
              </div>

              <button
                style={primaryBgStyle}
                className="w-full text-white font-bold py-4 rounded-xl text-lg shadow-md hover:opacity-90 transition"
                onClick={() => alert('신청이 완료되었습니다! 담당자가 연락드립니다.')}
              >
                선택한 상품 신청하기
              </button>
            </div>
          </div>
        )}

        {currentPage === 'community' && (
          <div className="max-w-4xl mx-auto px-4 py-8 animate-in slide-in-from-right duration-500">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Siren className="text-red-500" /> 블랙리스트 공유
            </h2>

            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 flex items-start gap-3 text-red-700">
              <AlertTriangle className="shrink-0 mt-1" size={18} />
              <div className="text-sm">
                <strong>경고:</strong> 진상 손님 정보는 회원끼리만 공유됩니다.<br />
                허위 사실 유포 시 활동이 정지될 수 있습니다.
              </div>
            </div>

            <div className="space-y-3">
              <div className={`p-4 rounded-lg shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between mb-2">
                  <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">강남/논현</span>
                  <span className="text-xs text-gray-400">2024.01.20</span>
                </div>
                <h3 className="font-bold mb-1">010-XXXX-1234 (안경, 40대)</h3>
                <p className="text-sm text-gray-500 mb-2">술 취하면 물건 던짐. 계산 안하고 도망가려다 걸림. 절대 받지 마세요.</p>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><ThumbsUp size={12} /> 공감 42</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> 댓글 8</span>
                </div>
              </div>

              <div className={`p-4 rounded-lg shadow-sm border relative overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="blur-sm select-none">
                  <div className="flex justify-between mb-2">
                    <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">평택/송탄</span>
                    <span className="text-xs text-gray-400">2024.01.19</span>
                  </div>
                  <h3 className="font-bold mb-1">010-XXXX-5678 (문신, 30대)</h3>
                  <p className="text-sm">룸 안에서 몰래 촬영 시도함. 핸드폰 뺏어서 확인했더니...</p>
                </div>
                <div className={`absolute inset-0 flex flex-col items-center justify-center ${brand.theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'}`}>
                  <Lock className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="font-bold text-sm">회원가입 후 전체 내용을 확인하세요</p>
                  <button className="mt-2 text-white px-4 py-1.5 rounded text-xs font-bold" style={primaryBgStyle}>3초 회원가입</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 식단 관리 페이지 */}
        {currentPage === 'diet' && (
          <div className="max-w-2xl mx-auto px-4 py-8 animate-in slide-in-from-right duration-500">
            <div className={`p-8 rounded-3xl shadow-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="text-center mb-8">
                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Apple size={32} />
                </div>
                <h2 className="text-2xl font-black mb-2">프리미엄 식단 관리</h2>
                <p className="text-gray-500">키와 몸무게를 입력하시면 BMI와 맞춤 식단을 제안합니다.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">신장 (cm)</label>
                    <input type="number" placeholder="165" className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">체중 (kg)</label>
                    <input type="number" placeholder="50" className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`} />
                  </div>
                </div>
                <button
                  style={primaryBgStyle}
                  className="w-full text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition"
                  onClick={() => alert('BMI 계산 중... 전문 식단 가이드가 곧 공개됩니다!')}
                >
                  맞춤형 식단 리포트 받기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MBTI 성향 테스트 */}
        {currentPage === 'mbti' && (
          <div className="max-w-2xl mx-auto px-4 py-8 animate-in slide-in-from-right duration-500">
            <div className={`p-8 rounded-3xl shadow-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="text-center mb-8">
                <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-2xl font-black mb-2">컬러 & 직업 성향 테스트</h2>
                <p className="text-gray-500">나에게 꼭 맞는 직업 환경과 퍼스널 컬러를 찾아보세요.</p>
              </div>
              <div className="bg-gray-50 border border-dashed border-gray-300 p-10 rounded-2xl text-center mb-6">
                <p className="text-gray-400 font-medium">총 12가지 문항이 준비되어 있습니다.</p>
              </div>
              <button
                style={primaryBgStyle}
                className="w-full text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition"
                onClick={() => alert('테스트가 준비 중입니다!')}
              >
                테스트 시작하기 (무료)
              </button>
            </div>
          </div>
        )}

        {/* 사주/운세 */}
        {currentPage === 'fortune' && (
          <div className="max-w-2xl mx-auto px-4 py-8 animate-in slide-in-from-right duration-500">
            <div className={`p-8 rounded-3xl shadow-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="text-center mb-8">
                <div className="bg-amber-100 text-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Moon size={32} />
                </div>
                <h2 className="text-2xl font-black mb-2">오늘의 프리미엄 사주</h2>
                <p className="text-gray-500">재물운, 연애운, 그리고 오늘의 조언을 확인하세요.</p>
              </div>
              <div className="space-y-4">
                <input type="date" className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`} />
                <div className="flex gap-4">
                  <button className="flex-1 p-4 rounded-xl border border-gray-200 text-gray-500 font-bold">오전 생</button>
                  <button className="flex-1 p-4 rounded-xl border border-amber-500 bg-amber-50 text-amber-600 font-bold">오후 생</button>
                </div>
                <button
                  style={primaryBgStyle}
                  className="w-full text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition"
                  onClick={() => alert('오늘의 운세 데이터를 불러오는 중입니다!')}
                >
                  지금 운세 확인하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 로그인 페이지 */}
        {currentPage === 'login' && (
          <div className="max-w-md mx-auto px-4 py-16 animate-in fade-in duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black mb-2" style={primaryStyle}>{brand.displayName}</h2>
              <p className="text-gray-500">더 나은 미래를 위한 첫 걸음</p>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="아이디" className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} />
              <input type="password" placeholder="비밀번호" className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} />
              <button
                style={primaryBgStyle}
                className="w-full text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition"
                onClick={() => alert('서비스 준비 중입니다!')}
              >
                로그인
              </button>
              <div className="flex justify-between text-sm text-gray-400 px-2 mt-4">
                <span>아이디 찾기</span>
                <span className="w-px h-3 bg-gray-200 my-auto"></span>
                <span>비밀번호 찾기</span>
                <span className="w-px h-3 bg-gray-200 my-auto"></span>
                <button className="text-gray-600 font-bold" onClick={() => setCurrentPage('signup')}>회원가입</button>
              </div>
            </div>
          </div>
        )}

        {/* 회원가입 페이지 */}
        {currentPage === 'signup' && (
          <div className="max-w-md mx-auto px-4 py-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black mb-6 text-center">회원가입</h2>
            <div className="space-y-4">
              <div className="flex gap-2 mb-6">
                <button className="flex-1 py-3 rounded-xl border-2 border-pink-500 bg-pink-50 text-pink-600 font-bold text-sm">구직자용</button>
                <button className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-400 font-bold text-sm">구인자용</button>
              </div>
              <input type="text" placeholder="아이디" className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} />
              <input type="password" placeholder="비밀번호" className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} />
              <input type="password" placeholder="비밀번호 확인" className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} />
              <input type="tel" placeholder="휴대폰 번호 (- 제외)" className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} />
              <button
                style={primaryBgStyle}
                className="w-full text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition mt-6"
                onClick={() => alert('본인 인증 서비스 준비 중입니다!')}
              >
                가입하기
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`py-10 px-4 border-t ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-black text-lg mb-4" style={primaryStyle}>{brand.displayName}</h4>
              <p className="text-sm mb-2">당신의 새로운 가능성을 여는 No.1 구인구직 플랫폼</p>
              <div className="text-xs space-y-1">
                <p>사업자등록번호: 226-13-91078</p>
                <p>대표문의: {brand.name === 'COCO' ? '코코알바 고객센터' : `${brand.name}알바 운영팀`}</p>
                <p>이메일: bizsetter7@gmail.com</p>
              </div>
            </div>
            <div className="flex gap-4 md:justify-end text-xs">
              <span className="cursor-pointer hover:underline">이용약관</span>
              <span className="cursor-pointer hover:underline font-bold text-gray-300">개인정보처리방침</span>
              <span className="cursor-pointer hover:underline">청소년보호정책</span>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-700 text-[10px] text-center">
            <p>© {new Date().getFullYear()} {brand.name} UNIVERSE. All Rights Reserved.</p>
            <p className="mt-2 opacity-50">본 사이트는 구인구직 정보의 중개 시스템으로, 정보의 정확성에 대한 책임은 등록자에게 있습니다.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Nav */}
      <nav className={`md:hidden fixed bottom-0 w-full border-t flex justify-around py-3 z-40 text-[10px] text-gray-400 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <button onClick={() => setCurrentPage('home')} className="flex flex-col items-center gap-1 hover:text-brand-primary active:text-brand-primary">
          <Home size={20} /> 홈
        </button>
        <button onClick={() => setCurrentPage('community')} className="flex flex-col items-center gap-1 hover:text-brand-primary">
          <MessageCircle size={20} /> 커뮤니티
        </button>
        <button onClick={() => setCurrentPage('payment')} className="flex flex-col items-center gap-1 font-bold" style={{ color: brand.primaryColor }}>
          <PlusCircle size={32} className="-mt-4 bg-white rounded-full shadow-lg" />
          광고등록
        </button>
        <button className="flex flex-col items-center gap-1 hover:text-brand-primary">
          <ShoppingBag size={20} /> 장터
        </button>
        <button className="flex flex-col items-center gap-1 hover:text-brand-primary">
          <User size={20} /> MY
        </button>
      </nav>
    </div>
  );
}
