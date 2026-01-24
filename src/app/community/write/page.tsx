'use client';

import React, { useState } from 'react';
import {
    ArrowLeft,
    Image as ImageIcon,
    X,
    Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
    '밤 문화 Talk',
    '같이일할단짝',
    '뷰티·패션·이벤트',
    '무료법률상담'
];

export default function WritePostPage() {
    const router = useRouter();
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (images.length >= 3) return alert('이미지는 최대 3장까지 등록 가능합니다.');
            // Mock upload: create local URL
            const url = URL.createObjectURL(e.target.files[0]);
            setImages([...images, url]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) return alert('제목과 내용을 입력해주세요.');

        // Mock Submit
        alert('게시글이 등록되었습니다!');
        router.back();
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 bg-white border-b z-10 flex items-center justify-between px-4 h-14">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-base font-bold text-gray-800">글쓰기</h1>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-1.5 bg-pink-500 text-white rounded-full text-sm font-bold shadow-sm hover:bg-pink-600 transition disabled:opacity-50"
                    disabled={!title.trim() || !content.trim()}
                >
                    등록
                </button>
            </header>

            {/* Form */}
            <main className="max-w-md mx-auto p-5 space-y-6">

                {/* Category Select */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2">카테고리</label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${category === cat
                                        ? 'border-pink-500 bg-pink-50 text-pink-500'
                                        : 'border-gray-200 text-gray-500 bg-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title Input */}
                <div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        className="w-full text-lg font-bold placeholder-gray-300 border-none outline-none p-0 focus:ring-0"
                    />
                </div>

                {/* Content Input */}
                <div className="min-h-[200px]">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="자유롭게 이야기를 나누어보세요. (욕설, 비방 금지)"
                        className="w-full h-[300px] text-sm text-gray-700 placeholder-gray-300 border-none outline-none resize-none p-0 focus:ring-0 leading-relaxed"
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        <label className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer shrink-0">
                            <ImageIcon size={24} className="mb-1" />
                            <span className="text-[10px]">{images.length}/3</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>

                        {images.map((img, idx) => (
                            <div key={idx} className="w-20 h-20 rounded-lg border border-gray-100 overflow-hidden relative shrink-0">
                                <img src={img} alt="preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Guidelines */}
            <div className="p-5 bg-gray-50 text-xs text-gray-400 leading-relaxed">
                <p>
                    * 부적절한 게시글은 제재 대상이 될 수 있습니다. <br />
                    * 타인의 권리를 침해하거나 명예를 훼손하는 내용은 금지됩니다.
                </p>
            </div>
        </div>
    );
}
