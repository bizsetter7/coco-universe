import React, { useState } from 'react';
import { Check } from 'lucide-react';

export const MemberInfoForm = ({ nickname, setNickname, shopName, email, setEmail, smsConsent, setSmsConsent, brand, setView, onOpenMenu }: any) => (
    <div className={`max-w-4xl mx-auto p-3 md:p-10 rounded-[24px] md:rounded-[32px] shadow-xl border relative ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>

        <h2 className={`text-lg md:text-2xl font-black mb-3 md:mb-10 pb-3 md:pb-5 border-b flex items-center gap-2 md:gap-3 ${brand.theme === 'dark' ? 'text-white border-gray-800' : 'text-gray-950 border-gray-100'}`}>
            <span className="w-2 h-8 bg-blue-500 rounded-full hidden md:block"></span>
            회원 정보 수정
        </h2>

        <div className="space-y-6 md:space-y-8">
            {/* ID / Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={`block text-xs font-bold mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>아이디</label>
                    <input type="text" value="bizsetter" disabled className={`w-full p-3 md:p-4 rounded-xl font-bold border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`} />
                </div>
                <div>
                    <label className={`block text-xs font-bold mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>비밀번호 변경</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input type="password" placeholder="변경할 비밀번호 입력" className={`w-full sm:flex-1 p-3 md:p-4 rounded-xl font-bold border transition focus:ring-2 focus:ring-blue-500/20 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`} />
                        <button className={`w-full sm:w-auto px-6 py-3 md:py-4 rounded-xl font-bold whitespace-nowrap ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700' : 'bg-gray-950 text-white border border-gray-950 hover:bg-black transition'}`}>변경</button>
                    </div>
                </div>
            </div>

            {/* Nickname & Business Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={`block text-xs font-bold mb-2 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        닉네임 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={nickname}
                        maxLength={10}
                        onChange={(e) => setNickname(e.target.value)}
                        className={`w-full p-3 md:p-4 rounded-xl font-bold border transition focus:ring-2 focus:ring-blue-500/20 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
                    />
                    <p className="text-[10px] text-blue-500 mt-1.5 font-bold flex items-center gap-1">
                        <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                        최대 10자 (공백 포함) / 구인 리스트에 노출됩니다.
                    </p>
                </div>
                <div>
                    <label className={`block text-xs font-bold mb-2 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        상호명 (고정) <Check size={14} className="text-green-500" />
                    </label>
                    <input
                        type="text"
                        value={shopName}
                        disabled
                        className={`w-full p-3 md:p-4 rounded-xl font-bold border opacity-70 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}
                    />
                    <p className="text-[10px] text-green-600 mt-1.5 font-bold">
                        * 사업자등록증 기반으로 인증된 상호명입니다.
                    </p>
                </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={`block text-xs font-bold mb-2 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        이메일
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full p-3 md:p-4 rounded-xl font-bold border transition focus:ring-2 focus:ring-blue-500/20 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`}
                    />
                </div>
                <div>
                    <label className={`block text-xs font-bold mb-2 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        휴대폰 번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value="010-3838-4335"
                            readOnly
                            className={`w-full sm:flex-1 p-3 md:p-4 rounded-xl font-bold border outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                        />
                        <button className={`w-full sm:w-auto px-6 py-3 md:py-4 rounded-xl font-bold whitespace-nowrap bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition`}>
                            재인증
                        </button>
                    </div>
                </div>
            </div>

            {/* SMS Consent */}
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div
                    onClick={() => setSmsConsent(!smsConsent)}
                    className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer transition ${smsConsent ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300'}`}
                >
                    {smsConsent && <Check size={16} />}
                </div>
                <label className={`cursor-pointer font-bold select-none ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} onClick={() => setSmsConsent(!smsConsent)}>
                    [필수] SMS 수신 동의 (중요 알림 및 공지사항)
                </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => setView('dashboard')} className={`order-2 sm:order-1 px-8 py-4 rounded-2xl font-black transition ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    취소
                </button>
                <button onClick={() => { alert('회원 정보가 수정되었습니다.'); setView('dashboard'); }} className="order-1 sm:order-2 px-8 py-4 rounded-2xl bg-blue-500 text-white font-black hover:bg-blue-600 shadow-xl shadow-blue-500/20 transition active:scale-95">
                    회원정보 수정하기
                </button>
            </div>
        </div>
    </div>
);
