import React from 'react';
import { createPortal } from 'react-dom';
import {
    List, LogOut, CreditCard, User, Settings
} from 'lucide-react';

interface MobileMenuProps {
    brand: any;
    onClose: () => void;
    setView: (view: any) => void;
    shopName: string;
    nickname: string;
    router: any;
}

export const BusinessMobileMenu: React.FC<MobileMenuProps> = ({ brand, onClose, setView, shopName, nickname, router }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(
        <div className="fixed inset-0 z-[20000] flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className={`relative w-72 h-full shadow-2xl p-6 transform animate-in slide-in-from-right duration-300 ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-6">
                    <span className="text-[11px] font-black text-pink-500 uppercase tracking-widest">Menu</span>
                    <button onClick={onClose} className={`text-xs font-bold ${brand.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} hover:text-pink-500`}>
                        닫기
                    </button>
                </div>

                <div
                    onClick={() => { setView('dashboard'); onClose(); }}
                    className="text-center pb-6 border-b border-gray-100 dark:border-gray-800 cursor-pointer active:opacity-70 transition"
                >
                    <h2 className={`font-black text-xl mb-1 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{shopName || (nickname === '최고 관리자' ? '관리 센터' : '내 상점')}</h2>
                    <p className="text-sm text-gray-500 font-bold tracking-tight">{nickname === '최고 관리자' ? '시스템 최고 관리자' : '업주 관리자'}</p>
                </div>

                <nav className={`mt-6 space-y-1 text-sm font-bold ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div onClick={() => { setView('ongoing-ads'); onClose(); }} className="p-4 flex items-center gap-3 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer">
                        <List size={18} /> 진행중인 공고
                    </div>
                    <div onClick={() => { setView('closed-ads'); onClose(); }} className="p-4 flex items-center gap-3 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer">
                        <LogOut size={18} /> 마감된 공고
                    </div>
                    <div onClick={() => { setView('payments'); onClose(); }} className="p-4 flex items-center gap-3 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer">
                        <CreditCard size={18} /> 유료 결제 내역
                    </div>
                    <div onClick={() => { setView('applicants'); onClose(); }} className="p-4 flex items-center gap-3 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer">
                        <User size={18} /> 지원자 관리
                    </div>
                    <div onClick={() => { setView('member-info'); onClose(); }} className="p-4 flex items-center gap-3 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer">
                        <Settings size={18} /> 회원 정보 수정
                    </div>
                </nav>
            </div>
        </div>,
        document.body
    );
};
