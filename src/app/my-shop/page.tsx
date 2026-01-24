'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Home,
    Store,
    MapPin,
    Phone,
    MessageCircle,
    Camera,
    Check,
    Briefcase,
    Clock,
    DollarSign,
    Save
} from 'lucide-react';

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전'];
const PAY_TYPES = ['시급', '일급', '주급', '월급', '건별', '협의'];

export default function MyShopPage() {
    const router = useRouter();

    // Form States
    const [shopName, setShopName] = useState('코코 라운지 (예시)');
    const [managerName, setManagerName] = useState('');
    const [managerPhone, setManagerPhone] = useState('');
    const [kakaoId, setKakaoId] = useState('');

    // Recruitment Info
    const [title, setTitle] = useState('');
    const [region, setRegion] = useState('서울');
    const [payType, setPayType] = useState('시급');
    const [payAmount, setPayAmount] = useState('');
    const [workTime, setWorkTime] = useState('');

    const [images, setImages] = useState<string[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (images.length >= 5) return alert('이미지는 최대 5장까지 등록 가능합니다.');
            const url = URL.createObjectURL(e.target.files[0]);
            setImages([...images, url]);
        }
    };

    const handleSave = () => {
        alert('저장되었습니다! (실제 저장 로직은 백엔드 연동 필요)');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">

            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="text-gray-600">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <Store className="text-purple-600" size={24} />
                            내 가게 관리
                        </h1>
                    </div>
                    <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600">
                        <Home size={24} />
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 md:py-8 space-y-6">

                {/* Grid Layout for PC */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left Column: Essential Info */}
                    <div className="space-y-6">

                        {/* 1. Shop Basic Info */}
                        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                                기본 정보
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">상호명</label>
                                    <input
                                        type="text"
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        className="w-full border rounded-xl p-3 text-sm font-bold bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">사업자 인증</label>
                                    <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                        <Camera size={18} />
                                        사업자등록증 촬영/업로드
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* 2. Manager Info */}
                        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                담당자 정보
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">담당자 성함</label>
                                    <input
                                        type="text"
                                        placeholder="김실장"
                                        value={managerName}
                                        onChange={(e) => setManagerName(e.target.value)}
                                        className="w-full border rounded-xl p-3 text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">연락처</label>
                                        <input
                                            type="tel"
                                            placeholder="010-0000-0000"
                                            value={managerPhone}
                                            onChange={(e) => setManagerPhone(e.target.value)}
                                            className="w-full border rounded-xl p-3 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">카톡 ID</label>
                                        <input
                                            type="text"
                                            placeholder="kakao_id"
                                            value={kakaoId}
                                            onChange={(e) => setKakaoId(e.target.value)}
                                            className="w-full border rounded-xl p-3 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Right Column: Recruitment Details */}
                    <div className="space-y-6">

                        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-full">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
                                채용 공고 내용
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">공고 제목</label>
                                    <input
                                        type="text"
                                        placeholder="EX) 강남 1등 가게! 갯수 보장!"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full border rounded-xl p-3 text-sm font-bold focus:ring-1 focus:ring-pink-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">지역</label>
                                        <select
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                            className="w-full border rounded-xl p-3 text-sm outline-none"
                                        >
                                            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">근무시간</label>
                                        <input
                                            type="text"
                                            placeholder="협의 가능"
                                            value={workTime}
                                            onChange={(e) => setWorkTime(e.target.value)}
                                            className="w-full border rounded-xl p-3 text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">급여 방식</label>
                                        <select
                                            value={payType}
                                            onChange={(e) => setPayType(e.target.value)}
                                            className="w-full border rounded-xl p-3 text-sm outline-none"
                                        >
                                            {PAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">급여액</label>
                                        <input
                                            type="text"
                                            placeholder="100,000"
                                            value={payAmount}
                                            onChange={(e) => setPayAmount(e.target.value)}
                                            className="w-full border rounded-xl p-3 text-sm font-bold outline-none text-right"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">상세 내용 및 이미지</label>
                                    <div className="border rounded-xl p-2 min-h-[150px] bg-gray-50">
                                        {/* Mock Editor Toolbar */}
                                        <div className="flex gap-2 border-b pb-2 mb-2 text-gray-400">
                                            <button className="p-1 hover:text-gray-600"><Camera size={16} /></button>
                                            <button className="p-1 hover:text-gray-600 font-bold">B</button>
                                            <button className="p-1 hover:text-gray-600 italic">I</button>
                                        </div>
                                        <textarea
                                            className="w-full h-[120px] bg-transparent border-none outline-none text-sm resize-none"
                                            placeholder="여기에 상세 근무 조건 등을 자유롭게 적어주세요."
                                        ></textarea>
                                    </div>
                                </div>

                            </div>
                        </section>

                    </div>
                </div>

            </main>

            {/* Bottom Floating Action Button (Save) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={handleSave}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 transition flex items-center justify-center gap-2 text-lg"
                    >
                        <Save size={20} />
                        변경사항 저장하기
                    </button>
                </div>
            </div>

        </div>
    );
}
