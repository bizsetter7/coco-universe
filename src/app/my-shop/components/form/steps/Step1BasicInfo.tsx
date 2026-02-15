'use client';

import React from 'react';
import { FileText, Check, Camera } from 'lucide-react';

interface Step1Props {
    brand: any;
    shopName: string;
    setShopName: (v: string) => void;
    isVerified: boolean;
    nickname: string;
    setNickname: (v: string) => void;
    managerName: string;
    setManagerName: (v: string) => void;
    managerPhone: string;
    setManagerPhone: (v: string) => void;
    messengers: any;
    setMessengers: (v: any) => void;
}

export const Step1BasicInfo: React.FC<Step1Props> = ({
    brand, shopName, setShopName, isVerified, nickname, setNickname,
    managerName, setManagerName, managerPhone, setManagerPhone, messengers, setMessengers
}) => {
    return (
        <section id="myshop-step-1" className={`p-2 md:p-5 rounded-[32px] shadow-lg border-2 overflow-hidden ${brand.theme === 'dark' ? 'bg-gradient-to-br from-blue-950 via-gray-900 to-gray-950 border-blue-900/50' : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50 border-blue-200'}`}>
            <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white p-4 rounded-2xl mb-3 md:mb-6 shadow-xl text-center md:text-left">
                <h2 className="font-black text-lg md:text-xl flex items-center justify-center md:justify-start gap-2">
                    <FileText size={24} className="text-white" />
                    STEP 1: 기본 정보 입력
                </h2>
                <p className="text-[13px] font-bold opacity-90 mt-1">업소 정보와 담당자 연락처를 정확히 입력해주세요.</p>
            </div>

            <div className="space-y-4">
                <div className={`p-2 md:p-4 rounded-2xl shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white/80 backdrop-blur-sm border-gray-100'}`}>
                    <h2 className="font-black text-gray-800 mb-2 md:mb-4 flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                        업소 기본 정보
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                        <div>
                            <label className={`block text-xs font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>상호명</label>
                            <input
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                className={`w-full border rounded-lg p-2 text-sm font-bold outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-purple-900/50' : 'bg-gray-50 border-gray-200 text-black focus:ring-purple-500'} ${isVerified ? 'opacity-60 cursor-not-allowed' : ''}`}
                                readOnly={isVerified}
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>닉네임</label>
                            <input
                                type="text"
                                placeholder="닉네임을 입력하세요"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className={`w-full border rounded-lg p-2 text-sm font-bold outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-purple-900/50' : 'bg-gray-50 border-gray-200 text-black focus:ring-purple-500'}`}
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>사업자 인증</label>
                            {isVerified ? (
                                <div className="w-full py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs font-bold flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white"><Check size={12} strokeWidth={3} /></div>
                                    인증 완료
                                </div>
                            ) : (
                                <button className={`w-full py-2 border border-dashed rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                                    <Camera size={16} /> 촬영/업로드
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`p-2 md:p-4 rounded-2xl shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white/80 backdrop-blur-sm border-gray-100'}`}>
                    <h2 className="font-black text-gray-800 mb-2 md:mb-4 flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                        담당자 정보
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-3">
                        <div>
                            <label className={`block text-xs font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>성함</label>
                            <input
                                type="text"
                                placeholder="김실장"
                                value={managerName}
                                onChange={(e) => setManagerName(e.target.value)}
                                className={`w-full border rounded-lg p-2 text-sm font-bold outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50' : 'bg-gray-50 border-gray-200 text-black focus:ring-blue-500'} opacity-60 cursor-not-allowed`}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>연락처</label>
                            <input type="text" placeholder="010-0000-0000" value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} className={`w-full border rounded-lg p-2 text-sm font-bold outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50' : 'bg-gray-50 border-gray-200 text-black focus:ring-blue-500'}`} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-[10px] font-black mb-1.5 text-yellow-600">카톡</label>
                            <input type="text" placeholder="ID" value={messengers.kakao} onChange={(e) => setMessengers({ ...messengers, kakao: e.target.value })} className={`w-full border rounded-lg p-2 text-xs font-bold outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black mb-1.5 text-green-600">라인</label>
                            <input type="text" placeholder="ID" value={messengers.line} onChange={(e) => setMessengers({ ...messengers, line: e.target.value })} className={`w-full border rounded-lg p-2 text-xs font-bold outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black mb-1.5 text-blue-600">텔레</label>
                            <input type="text" placeholder="ID" value={messengers.telegram} onChange={(e) => setMessengers({ ...messengers, telegram: e.target.value })} className={`w-full border rounded-lg p-2 text-xs font-bold outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
