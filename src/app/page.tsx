'use client';

import { useBrand } from '@/components/BrandProvider';
import { Crown, Flame, Home, MessageCircle, Pencil, PlusCircle, ShoppingBag, User, Siren, AlertTriangle, Lock, ThumbsUp } from 'lucide-react';
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
              {brand.logoText}<span style={primaryStyle}>{brand.name.replace(brand.logoText, '')}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-500 hover:text-gray-900">로그인</button>
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
      </main>

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
