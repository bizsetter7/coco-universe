import React from 'react';
import { createPortal } from 'react-dom';
import { Laptop } from 'lucide-react';

interface ModalProps {
    brand: any;
    onClose: () => void;
}

interface DesignsModalProps extends ModalProps { }

export const DesignRequestModal: React.FC<DesignsModalProps> = ({ brand, onClose }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div className={`rounded-[32px] shadow-2xl max-w-sm w-full p-8 text-center space-y-6 transform animate-in fade-in zoom-in duration-200 ${brand.theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 border-4 shadow-sm ${brand.theme === 'dark' ? 'bg-blue-900/30 border-gray-800' : 'bg-blue-50 border-white'}`}>
                    <Laptop size={40} className="text-blue-500" />
                </div>
                <h3 className={`text-2xl font-black tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>상세페이지 디자인 의뢰</h3>
                <p className={`${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-800'} text-sm leading-relaxed`}>
                    전문 디자이너가 사장님만의 <br />
                    <strong className="text-pink-500 font-black text-lg">고퀄리티 상세페이지</strong>를 제작해드립니다.
                </p>
                <div className={`p-6 rounded-2xl text-left space-y-3 text-xs md:text-sm border font-bold ${brand.theme === 'dark' ? 'bg-blue-900/10 text-blue-200 border-blue-900/30' : 'bg-blue-50/50 text-gray-700 border-blue-100'}`}>
                    <p className="flex items-center gap-2">• 브랜드 전용 1:1 맞춤형 고해상도 디자인</p>
                    <p className="flex items-center gap-2">• 7단계 노출 등급에 최적화된 레이아웃 제공</p>
                    <p className="flex items-center gap-2">• 움직이는 GIF 및 프리미엄 움짤 무료 제작</p>
                    <p className="flex items-center gap-2">• 제작 기간: 영업일 기준 평균 1~2일</p>
                </div>
                <div className="grid grid-cols-1 gap-3 pt-2">
                    <button onClick={() => alert('고객센터로 디자인 제작 문의가 접수되었습니다.')} className="py-4 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl shadow-blue-100/10 transition-all flex items-center justify-center gap-2">
                        실시간 1:1 문의 / 고객센터 연결
                    </button>
                    <button onClick={onClose} className="py-3 text-gray-400 font-bold hover:text-gray-600">
                        닫기
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
