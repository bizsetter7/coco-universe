import React from 'react';
import { createPortal } from 'react-dom';
import { List, Star, CreditCard, AlertTriangle, Briefcase, FileText, User, Home, MessageCircle, LogOut, X } from 'lucide-react';

interface PersonalMobileMenuProps {
    brand: any;
    onClose: () => void;
    setView: (view: any) => void;
    router: any;
}

export const PersonalMobileMenu: React.FC<PersonalMobileMenuProps> = ({ brand, onClose, setView, router }) => {
    const menuItems = [
        { id: 'resume-list', label: '이력서 리스트', icon: <List size={16} /> },
        { id: 'scrap', label: '채용정보 스크랩', icon: <Star size={16} /> },
        { id: 'payment', label: '유료결제 내역', icon: <CreditCard size={16} /> },
        { id: 'excluded', label: '열람불가 업소설정', icon: <AlertTriangle size={16} /> },
        { id: 'custom-job', label: '맞춤구인정보', icon: <Briefcase size={16} /> },
        { id: 'my-posts', label: '내가 작성한 게시글', icon: <FileText size={16} /> },
        { id: 'block', label: '회원 차단 설정', icon: <User size={16} /> },
        { id: 'bookmark', label: '즐겨찾기한 게시글', icon: <Star size={16} /> },
    ];

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`absolute top-0 right-0 w-[80%] max-w-[300px] h-full shadow-2xl animate-in slide-in-from-right duration-300 ${brand.theme === 'dark' ? 'bg-gray-900 border-l border-gray-800' : 'bg-white'}`}>
                <div className="p-4 flex justify-between items-center border-b dark:border-gray-800">
                    <h2 className={`font-bold ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>마이페이지 메뉴</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <X size={20} className={brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                    </button>
                </div>
                <div className="p-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'resume-list') setView('member-info');
                                else alert('준비 중인 기능입니다.');
                                onClose();
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl flex items-center gap-3 transition ${brand.theme === 'dark' ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
                {/* Global Links for Mobile */}
                <div className="p-4 border-t dark:border-gray-800 space-y-1">
                    <button onClick={() => router.push('/')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-3">
                        <Home size={16} /> 홈으로
                    </button>
                    <button onClick={() => router.push('/community')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-3">
                        <MessageCircle size={16} /> 커뮤니티
                    </button>
                    <button onClick={() => {
                        if (confirm('로그아웃 하시겠습니까?')) {
                            localStorage.clear();
                            window.location.href = '/';
                        }
                    }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-3">
                        <LogOut size={16} /> 로그아웃
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
