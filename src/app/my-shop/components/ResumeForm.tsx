import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, User, ChevronRight } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';
import { INDUSTRY_DATA, REGION_DATA, PAY_TYPES } from '../constants'; // Import from local constants which is re-exported map

export const ResumeForm = ({ setView, onOpenMenu }: { setView: (v: any) => void, onOpenMenu?: () => void }) => {
    const brand = useBrand();
    const router = useRouter();

    // User Info State
    const [userName, setUserName] = useState('회원님');
    const [userId, setUserId] = useState('admin_user');

    // Form States
    const [selectedIndustryMain, setSelectedIndustryMain] = useState('');
    const [selectedIndustrySub, setSelectedIndustrySub] = useState('');
    const [selectedRegionMain, setSelectedRegionMain] = useState('');
    const [selectedRegionSub, setSelectedRegionSub] = useState('');
    const [payType, setPayType] = useState('급여협의'); // Default match corporate

    // Contact State
    const [contactMethod, setContactMethod] = useState('');
    const [contactValue, setContactValue] = useState('');

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        const storedId = localStorage.getItem('user_id');
        if (storedName) setUserName(storedName);
        if (storedId) setUserId(storedId);
    }, []);

    const handleContactMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const method = e.target.value;
        setContactMethod(method);
        if (method === 'phone') {
            setContactValue('010-0000-0000'); // Mock verified phone
        } else if (method === 'site_msg') {
            setContactValue('site_msg');
        } else {
            setContactValue(''); // Clear for ID input
        }
    };

    return (
        <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500`}>

            {/* Warning Banner */}
            <div
                onClick={() => router.push('/customer-center?tab=notice')}
                className="w-full bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-red-100/50 transition group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-red-500 border border-red-100">
                        <AlertTriangle size={24} fill="currentColor" strokeWidth={0} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500 mb-0.5">이력서 등록 시</div>
                        <div className="text-xl font-black text-red-500 tracking-tight">구직자 주의사항!</div>
                    </div>
                </div>
                <div className="text-sm font-bold text-gray-500 flex items-center gap-1 group-hover:text-red-500 transition">
                    자세히 보기 <ChevronRight size={16} />
                </div>
            </div>

            <header className="flex flex-col gap-4 mb-4">
                <div className={`p-6 sm:rounded-[32px] shadow-sm border relative ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} `}>
                    {/* Mobile Menu Button (Dashboard specific) */}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className={`text-xl md:text-2xl font-black flex items-center gap-3 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>
                            <span className="w-2 h-8 bg-pink-500 rounded-full hidden md:block"></span>
                            이력서 등록
                        </h2>
                        <div className="text-xs font-bold text-gray-400">MY PERSONAL HISTORY</div>
                    </div>
                </div>
            </header>

            <div className={`p-6 rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className={`text-xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        나의 이력서 등록
                    </h2>
                    <div className="text-xs font-bold text-gray-400">MY PERSONAL HISTORY</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
                    {/* Photo Area */}
                    <div className="md:col-span-3 flex flex-col items-center sm:items-stretch gap-2">
                        <div className="w-28 sm:w-full aspect-[3/4] rounded-lg border-2 border-dashed flex items-center justify-center bg-gray-50 text-gray-300">
                            <User size={32} className="sm:w-[48px] sm:h-[48px]" />
                        </div>
                    </div>

                    {/* Basic Info Fields */}
                    <div className="md:col-span-9 space-y-4">
                        {/* ID - ReadOnly */}
                        <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0">
                            <label className="sm:col-span-3 text-xs font-bold text-gray-500">아이디</label>
                            <div className="sm:col-span-9 text-sm font-bold truncate w-full">{userId}</div>
                        </div>
                        {/* Nickname - Editable */}
                        <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0">
                            <label className="sm:col-span-3 text-xs font-bold text-gray-500">이름(닉네임) <span className="text-red-500">*</span></label>
                            <div className="sm:col-span-9 flex gap-2 w-full">
                                <input
                                    type="text"
                                    value={userName}
                                    maxLength={10}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="10자 이내 입력"
                                    className={`flex-1 border rounded p-1.5 text-xs font-bold outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-pink-500 min-w-0`}
                                />
                            </div>
                        </div>
                        {/* Birthdate/Sex */}
                        <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0">
                            <label className="sm:col-span-3 text-xs font-bold text-gray-500">성별/생년월일 <span className="text-red-500">*</span></label>
                            <div className="sm:col-span-9 flex flex-wrap gap-2 items-center w-full">
                                <select className="border border-gray-300 rounded p-1.5 text-xs font-bold bg-white text-gray-700 outline-none flex-shrink-0">
                                    <option>여성</option>
                                    <option>남성</option>
                                </select>
                                <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                                    <input type="number" defaultValue="2000" className="w-[60px] border border-gray-300 rounded p-1.5 text-xs text-center outline-none" /> <span className="text-xs">년</span>
                                    <input type="number" defaultValue="1" className="w-[45px] border border-gray-300 rounded p-1.5 text-xs text-center outline-none" /> <span className="text-xs">월</span>
                                    <input type="number" defaultValue="1" className="w-[45px] border border-gray-300 rounded p-1.5 text-xs text-center outline-none" /> <span className="text-xs">일</span>
                                </div>
                            </div>
                        </div>
                        {/* Contact Method - Dynamic Input */}
                        <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0">
                            <label className="sm:col-span-3 text-xs font-bold text-gray-500">연락방법 <span className="text-red-500">*</span></label>
                            <div className="sm:col-span-9 space-y-2 w-full">
                                <select
                                    value={contactMethod}
                                    onChange={handleContactMethodChange}
                                    className="w-full border border-gray-300 rounded p-1.5 text-xs font-bold bg-white text-gray-700 outline-none"
                                >
                                    <option value="">연락방법 선택</option>
                                    <option value="phone">휴대폰 (안심번호)</option>
                                    <option value="kakao">카카오톡</option>
                                    <option value="line">라인</option>
                                    <option value="telegram">텔레그램</option>
                                    <option value="site_msg">사이트 메세지</option>
                                </select>

                                {contactMethod === 'phone' && (
                                    <>
                                        <input type="text" value={contactValue} readOnly className="w-full bg-gray-100 border border-gray-300 rounded p-1.5 text-[11px] text-gray-500 font-bold outline-none" />
                                        <p className="text-[10px] text-blue-500 leading-tight">* 안심번호를 선택하면 입력하신 전화번호는 노출되지 않습니다.</p>
                                    </>
                                )}

                                {['kakao', 'line', 'telegram'].includes(contactMethod) && (
                                    <input
                                        type="text"
                                        value={contactValue}
                                        onChange={(e) => setContactValue(e.target.value)}
                                        placeholder={`${contactMethod === 'kakao' ? '카카오톡' : contactMethod === 'line' ? '라인' : '텔레그램'} ID를 입력해주세요`}
                                        className={`w-full border rounded p-1.5 text-[11px] font-bold outline-none focus:border-pink-500 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    />
                                )}

                                {contactMethod === 'site_msg' && (
                                    <div className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-[10px] text-gray-500 text-center font-bold">
                                        구직자에게 사이트 내 쪽지로 연락을 받습니다. (연락처 비공개)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Divider */}
                <div className="border-t border-dashed border-gray-200 my-6"></div>

                {/* Resume Content */}
                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-red-400 rounded-full"></span> 이력서 제목 <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="제목을 입력하세요" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold outline-none focus:border-pink-500" />
                    </div>
                    {/* Pay - Corporate Mapping */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-blue-400 rounded-full"></span> 희망 급여</label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <select
                                value={payType}
                                onChange={(e) => setPayType(e.target.value)}
                                className="border border-gray-300 rounded-lg p-2.5 text-xs font-bold bg-white text-gray-700 outline-none flex-shrink-0"
                            >
                                {PAY_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 pr-8 text-sm font-bold outline-none focus:border-pink-500"
                                    placeholder="금액 입력"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">원</span>
                            </div>
                        </div>
                    </div>
                    {/* Industry */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-purple-400 rounded-full"></span> 희망 분야 <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <select
                                value={selectedIndustryMain}
                                onChange={(e) => {
                                    setSelectedIndustryMain(e.target.value);
                                    setSelectedIndustrySub('');
                                }}
                                className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white text-gray-700 outline-none"
                            >
                                <option value="">1차 업종 선택</option>
                                {Object.keys(INDUSTRY_DATA).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <select
                                value={selectedIndustrySub}
                                onChange={(e) => setSelectedIndustrySub(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white text-gray-700 outline-none"
                                disabled={!selectedIndustryMain}
                            >
                                <option value="">2차 업종 선택</option>
                                {selectedIndustryMain && INDUSTRY_DATA[selectedIndustryMain]?.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Region */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-green-400 rounded-full"></span> 업무 가능 지역 <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <select
                                value={selectedRegionMain}
                                onChange={(e) => {
                                    setSelectedRegionMain(e.target.value);
                                    setSelectedRegionSub('');
                                }}
                                className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white text-gray-700 outline-none"
                            >
                                <option value="">지역 선택</option>
                                {Object.keys(REGION_DATA).map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                            <select
                                value={selectedRegionSub}
                                onChange={(e) => setSelectedRegionSub(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white text-gray-700 outline-none"
                                disabled={!selectedRegionMain}
                            >
                                <option value="">세부 지역 선택</option>
                                {selectedRegionMain && REGION_DATA[selectedRegionMain]?.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Intro */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-orange-400 rounded-full"></span> 자기소개 <span className="text-red-500">*</span></label>
                        <textarea className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold outline-none focus:border-pink-500 resize-none" placeholder="내용을 입력하세요"></textarea>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex justify-center gap-3">
                    <button onClick={() => setView('member-info')} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition">취소</button>
                    <button onClick={() => { alert('이력서가 등록되었습니다.'); setView('member-info'); }} className="px-8 py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-900 transition shadow-lg">이력서 등록완료</button>
                </div>
            </div>
        </div>
    );
};
