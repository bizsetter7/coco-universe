import React, { useState } from 'react';
import { useBrand } from '@/components/BrandProvider';

export const PersonalMemberEdit = ({ setView, onOpenMenu }: { setView: (v: any) => void, onOpenMenu?: () => void }) => {
    const brand = useBrand();

    // Form Data
    const [formData, setFormData] = useState({
        id: 'admin_user',
        password: '',
        passwordConfirm: '',
        realName: '김여우',
        nickname: '회원님',
        birthdate: '1998-08-13',
        gender: '여성', // Default
        email: 'user@example.com',
        phone: '010-0000-0000',
        smsConsent: true
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        alert('개인 정보가 수정되었습니다.');
        setView('dashboard');
    };

    return (
        <div className={`max-w-4xl mx-auto p-3 md:p-10 rounded-[24px] md:rounded-[32px] shadow-xl border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <h2 className={`text-lg md:text-2xl font-black mb-3 md:mb-10 pb-3 md:pb-5 border-b flex items-center gap-2 md:gap-3 ${brand.theme === 'dark' ? 'text-white border-gray-800' : 'text-gray-950 border-gray-100'}`}>
                <span className="w-2 h-8 bg-pink-500 rounded-full hidden md:block"></span>
                개인 회원 정보 수정
            </h2>

            <div className="space-y-6 md:space-y-8">
                {/* ID / Real Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-xs font-black mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>아이디</label>
                        <input type="text" value={formData.id} disabled className={`w-full p-3 md:p-4 rounded-xl font-bold border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`} />
                    </div>
                    <div>
                        <label className={`block text-xs font-black mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>성명 (고정)</label>
                        <input type="text" value={formData.realName} disabled className={`w-full p-3 md:p-4 rounded-xl font-bold border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`} />
                    </div>
                </div>

                {/* Nickname & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-xs font-black mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>닉네임</label>
                        <input
                            type="text"
                            value={formData.nickname}
                            onChange={(e) => handleChange('nickname', e.target.value)}
                            className={`w-full p-3 md:p-4 rounded-xl font-bold border transition focus:ring-2 focus:ring-pink-500/20 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-pink-500' : 'bg-white border-gray-200 text-gray-950 focus:border-pink-500'}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-xs font-black mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>이메일</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={`w-full p-3 md:p-4 rounded-xl font-bold border transition focus:ring-2 focus:ring-pink-500/20 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-pink-500' : 'bg-white border-gray-200 text-gray-950 focus:border-pink-500'}`}
                        />
                    </div>
                </div>

                {/* Birthday & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-xs font-black mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>생년월일</label>
                        <input type="date" value={formData.birthdate} readOnly className={`w-full p-3 md:p-4 rounded-xl font-bold border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`} />
                    </div>
                    <div>
                        <label className={`block text-xs font-black mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>휴대폰 번호</label>
                        <div className="flex items-center gap-2">
                            <input type="text" value={formData.phone} readOnly className={`flex-1 min-w-0 p-3 md:p-4 rounded-xl font-bold border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`} />
                            <button className="px-4 py-3 md:py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-black shrink-0 transition shadow-lg shadow-indigo-500/20 active:scale-95">재인증</button>
                        </div>
                    </div>
                </div>

                {/* Password Change Section */}
                <div className={`p-6 md:p-8 rounded-3xl border border-dashed ${brand.theme === 'dark' ? 'bg-black/20 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <h3 className={`text-sm font-black mb-4 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>비밀번호 변경</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="password" placeholder="새 비밀번호 입력" className={`w-full p-3 md:p-4 rounded-xl font-bold border outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-950'}`} />
                        <input type="password" placeholder="비밀번호 확인" className={`w-full p-3 md:p-4 rounded-xl font-bold border outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-950'}`} />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={() => setView('dashboard')} className={`order-2 sm:order-1 px-8 py-4 rounded-2xl font-black transition ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        취소
                    </button>
                    <button onClick={handleSave} className="order-1 sm:order-2 px-8 py-4 rounded-2xl bg-pink-500 text-white font-black hover:bg-pink-600 shadow-xl shadow-pink-500/20 transition active:scale-95">
                        정보 수정하기
                    </button>
                </div>
            </div>
        </div>
    );
};
