
import os

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\app\customer-center\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep everything up to line 897 (index 896)
new_lines = lines[:897]

# Append the fixed bottom part with PERFECT indentation
fixed_part = """                                    </section>
                            </div>
                        )}

                        {/* 3. Usage Guide */}
                        {activeTab === '이용방법' && (
                            <div className="space-y-12">
                                <section>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-2 h-8 bg-pink-600 rounded-full shadow-lg shadow-pink-200"></div>
                                        <h3 className={`text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>구직자 이용가이드</h3>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {[
                                            { step: '01', title: '회원가입', icon: <UserCheck />, desc: 'SNS 연동 간편 가입' },
                                            { step: '02', title: '이력서 등록', icon: <FileText />, desc: '자유 형식의 강점 어필' },
                                            { step: '03', title: '업소 서칭', icon: <Search />, desc: '맞춤 필터링 시스템' },
                                            { step: '04', title: '1:1 상담', icon: <MessageSquare />, desc: '안심 면접을 위한 소통' },
                                        ].map((item, i) => (
                                            <div key={i} className={`p-6 rounded-[30px] border text-center relative overflow-hidden group hover:shadow-xl transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                                <span className={`absolute -top-3 -left-3 text-5xl font-black transition-colors pointer-events-none ${brand.theme === 'dark' ? 'text-gray-700' : 'text-gray-50'} group-hover:text-pink-50/50`}>{item.step}</span>
                                                <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 shadow-inner">
                                                    {item.icon}
                                                </div>
                                                <h4 className={`font-black text-[15px] mb-1 relative z-10 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                                                <p className={`text-[11px] relative z-10 font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-2 h-8 bg-pink-600 rounded-full shadow-lg shadow-pink-200"></div>
                                        <h3 className={`text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>구인자(사장님) 가이드</h3>
                                    </div>
                                    <div className={`p-8 md:p-10 rounded-[45px] border shadow-xl shadow-pink-100/10 space-y-10 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
                                        <div className="flex flex-col md:flex-row items-center gap-8">
                                            <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-[28px] flex items-center justify-center shrink-0 border border-pink-100">
                                                <Briefcase size={36} />
                                            </div>
                                            <div className="text-center md:text-left flex flex-col items-center md:items-start">
                                                <h4 className="text-xl md:text-2xl font-black mb-3 md:mb-2 tracking-tight text-gray-900 whitespace-nowrap">사장님, 안심하고 이용하세요!</h4>
                                                <div className="text-[14px] md:text-[15px] text-gray-500 font-bold leading-relaxed flex flex-col items-center md:items-start">
                                                    <span className="whitespace-nowrap">철저한 사업자 인증을 통해 클린하고 신뢰할 수 있는</span>
                                                    <span className="whitespace-nowrap">구인 공고 문화를 만들어갑니다.</span>
                                                </div>
                                            </div>
                                            <button className="w-full md:w-auto md:ml-auto px-8 py-4 bg-gray-900 text-white rounded-2xl text-[15px] font-black shadow-xl hover:bg-black transition">
                                                사업자 인증하러 가기
                                            </button>
                                        </div>
                                        <div className="h-px bg-gray-100 w-full" />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                                            {[
                                                { num: '1', title: '상품 선택', sub: '효율적인 광고 상품을 직접 픽업하세요.' },
                                                { num: '2', title: '공고 등록', sub: '상세한 업소 정보는 채용 성공률을 높입니다.' },
                                                { num: '3', title: '컨택 & 매칭', sub: '열람권을 통해 적합한 인재를 먼저 선점하세요.' }
                                            ].map((box, i) => (
                                                <div key={i} className={`flex items-start gap-4 md:gap-5 p-6 md:p-0 rounded-3xl border md:border-0 ${brand.theme === 'dark' ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 md:bg-transparent border-gray-100'}`}>
                                                    <span className="text-4xl md:text-5xl font-black text-pink-500/20 shrink-0 leading-none w-[36px] md:w-12 text-center">{box.num}</span>
                                                    <div className="flex flex-col items-start text-left pt-1 md:pt-2">
                                                        <h5 className="font-black text-base md:text-lg text-gray-900 leading-none mb-2">{box.title}</h5>
                                                        <p className="text-[12px] md:text-[13px] text-gray-500 font-bold leading-relaxed break-keep">
                                                            {box.sub}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* 4. FAQ */}
                        {activeTab === '자주묻는질문' && (
                            <div className="space-y-6">
                                <h2 className={`text-2xl font-black tracking-tight mb-8 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>자주 묻는 질문</h2>
                                <div className="space-y-4">
                                    {FAQS.map(faq => (
                                        <div key={faq.id} className={`rounded-[28px] shadow-sm border overflow-hidden transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                className={`w-full p-7 flex items-center justify-between text-left transition-colors ${brand.theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                                            >
                                                <span className={`font-black text-[15px] flex gap-4 pr-4 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    <span className="text-pink-600">Q.</span> {faq.question}
                                                </span>
                                                {expandedFaq === faq.id ? <ChevronUp size={24} className={brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} /> : <ChevronDown size={24} className="text-gray-400" />}
                                            </button>
                                            {expandedFaq === faq.id && (
                                                <div className={`p-8 border-t text-[15px] leading-loose font-bold ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-800'}`}>
                                                    {faq.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 5. 1:1 Inquiry */}
                        {activeTab === '1:1문의' && (
                            <div className="space-y-10">
                                <div className="bg-gradient-to-br from-pink-50 to-white p-8 md:p-10 rounded-[40px] border border-pink-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
                                    <div className={`p-5 rounded-[30px] text-pink-600 shadow-sm border border-pink-100 ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                                        <MessageCircle size={36} />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className={`text-2xl font-black mb-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>무엇을 도와드릴까요?</h3>
                                        <p className={`text-[14px] leading-relaxed font-black ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>궁금한 점을 남겨주시면 24시간 이내에 전문가가 답변을 드립니다.</p>
                                    </div>
                                </div>

                                <div className={`p-10 rounded-[45px] border shadow-sm space-y-10 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className={`block text-xs font-black mb-3 ml-2 uppercase tracking-widest ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>문의 유형 <span className="text-pink-600">*</span></label>
                                            <select
                                                className={`w-full border-2 rounded-[22px] p-5 text-sm font-black focus:ring-4 focus:ring-pink-500/10 outline-none appearance-none cursor-pointer ${brand.theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-100 bg-gray-50 text-gray-900'}`}
                                                onChange={(e) => setInquiryTitle(`[${e.target.value}] ` + (inquiryTitle || ''))}
                                            >
                                                <option>광고 상품 문의 (사장님)</option>
                                                <option>채용 관련 문의 (구직자)</option>
                                                <option>신고 및 운영 정책</option>
                                                <option>기타 제휴 문의</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-black mb-3 ml-2 uppercase tracking-widest ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>연락처/회신처 <span className="text-pink-600">*</span></label>
                                            <input
                                                type="text"
                                                value={inquiryContact}
                                                onChange={(e) => setInquiryContact(e.target.value)}
                                                placeholder="회신 받을 번호나 메일을 적어주세요"
                                                className={`w-full border-2 rounded-[22px] p-5 text-sm font-black focus:ring-4 focus:ring-pink-500/10 outline-none ${brand.theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-100 bg-gray-50 text-gray-900'}`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-black mb-3 ml-2 uppercase tracking-widest ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>문의 제목 <span className="text-pink-600">*</span></label>
                                        <input
                                            type="text"
                                            value={inquiryTitle}
                                            onChange={(e) => setInquiryTitle(e.target.value)}
                                            placeholder="핵심 내용을 한 문장으로 요약해주세요"
                                            className={`w-full border-2 rounded-[22px] p-5 text-sm font-black focus:ring-4 focus:ring-pink-500/10 outline-none ${brand.theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-black mb-3 ml-2 uppercase tracking-widest ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>상세 내용 <span className="text-pink-600">*</span></label>
                                        <textarea
                                            value={inquiryContent}
                                            onChange={(e) => setInquiryContent(e.target.value)}
                                            placeholder="구체적인 상황을 적어주시면 더 정확한 답변이 가능합니다."
                                            className={`w-full border-2 rounded-[35px] p-8 text-sm font-black h-60 resize-none focus:ring-4 focus:ring-pink-500/10 outline-none ${brand.theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-100 bg-gray-50 text-gray-900'}`}
                                        />
                                    </div>

                                    <button
                                        className={`w-full font-black py-6 rounded-[28px] text-xl shadow-2xl transition-all hover:scale-[1.01] active:scale-95 outline-none ${brand.theme === 'dark' ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-gray-900 text-white hover:bg-black'}`}
                                        onClick={() => alert('접수되었습니다. 담당자 확인 후 빠르게 답변 드리겠습니다!')}
                                    >
                                        상담 등록하기
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Customer Service Box (Mobile Lower Position) */}
                        <div className={`md:hidden mt-10 p-8 rounded-[40px] border shadow-xl shadow-pink-100/20 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-white to-pink-50/30 border-pink-100'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-pink-600">
                                    <PhoneCall size={24} />
                                </div>
                                <span className={`font-black text-xl ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>고객센터</span>
                            </div>
                            <p className={`text-4xl font-black mb-3 tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>1544-5568</p>
                            <p className={`text-[14px] leading-relaxed font-black ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                평일 09:30 ~ 19:00 / 점심 12:00 ~ 13:30<br />
                                <span className="text-pink-600 font-black mt-2 block">공휴일 / 주말 휴무 (텔레그램 상시 대기)</span>
                            </p>
                            <a href="https://t.me/your_telegram" className="mt-8 flex items-center justify-center gap-3 w-full py-5 bg-pink-600 text-white rounded-[24px] text-base font-black hover:bg-pink-700 transition shadow-xl shadow-pink-100">
                                <MessageCircle size={20} /> 텔레그렘 실시간 상담
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            {/* Image Zoom Modal */}
            {
                selectedImage && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
                        <div className="relative max-w-5xl w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                            <img src={selectedImage} alt="Ad Placement Guide Full" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/20 shadow-lg"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                )
            }
            <Footer />
        </div>
    );
}
"""

# Final content - ensure NO EXTRA NEWLINES at the end of fixed_part
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
    f.write(fixed_part.strip() + "\\n")

print("Successfully updated the file structure.")
