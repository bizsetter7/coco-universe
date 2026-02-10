'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { NoteService, Note } from '@/lib/noteService';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface MessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    userRole: string;
    initialReceiver?: string; // New Prop
}

type Tab = 'inbox' | 'unread' | 'sent' | 'write';

export default function MessageModal({ isOpen, onClose, userRole, initialReceiver }: MessageModalProps) {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('inbox');
    const [userName, setUserName] = useState('회원');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [writeContent, setWriteContent] = useState('');
    const [receiver, setReceiver] = useState(''); // Dynamic receiver

    // Body Scroll Lock
    useBodyScrollLock(isOpen);

    // Data State
    const [inbox, setInbox] = useState<Note[]>([]);
    const [unread, setUnread] = useState<Note[]>([]);
    const [sent, setSent] = useState<Note[]>([]);

    useEffect(() => {
        setMounted(true);

        // Robust Name Fetching
        let name = '회원';

        // 1. Try 'user_name' direct key
        const directName = localStorage.getItem('user_name');
        if (directName) {
            name = directName;
        }
        // 2. Try Parsing 'user_session' (JSON)
        else {
            const sessionStr = localStorage.getItem('user_session');
            if (sessionStr) {
                try {
                    const session = JSON.parse(sessionStr);
                    name = session.name || session.userName || session.user_name || session.title || session.shop_title || '회원';
                } catch (e) {
                    // Ignore parse error
                }
            }
        }

        // 3. Fallback to 'shop_title'
        if (name === '회원') {
            const shopTitle = localStorage.getItem('shop_title');
            if (shopTitle) name = shopTitle;
        }

        setUserName(name);
    }, []);

    useEffect(() => {
        if (isOpen) {
            refreshData();
            // If initialReceiver is provided, switch to write tab and set receiver
            if (initialReceiver) {
                setActiveTab('write');
                setReceiver(initialReceiver);
            } else {
                setReceiver(''); // Reset if no initial receiver
            }
        }
    }, [isOpen, activeTab, initialReceiver]); // Add initialReceiver to deps? verify

    const refreshData = () => {
        setInbox(NoteService.getInbox('user'));
        setUnread(NoteService.getUnread('user'));
        setSent(NoteService.getSent('user'));
    };

    const handleSend = () => {
        if (!writeContent.trim()) return;

        // Use the current receiver state, default to [관리자] if empty (though UI should force it?)
        const target = receiver.trim() || '[관리자]';

        NoteService.sendNote(writeContent, target);
        setWriteContent('');
        alert(`${target}님께 쪽지를 보냈습니다.`);
        setActiveTab('sent');
        // Do not reset receiver here, they might want to send another? Or reset?
        // Let's keep it for now.
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('삭제하시겠습니까?')) {
            NoteService.deleteNote(id);
            refreshData();
        }
    };

    const handleView = (note: Note) => {
        if (!note.isRead) {
            NoteService.markAsRead(note.id);
            refreshData();
        }
        setSelectedNote(note);
    };

    if (!mounted || !isOpen) return null;

    // UI Helpers (Hot Pink Theme)
    const getTabClass = (tab: Tab) => `
        flex-1 py-3 text-xs sm:text-sm font-bold transition-colors text-center relative
        ${activeTab === tab
            ? 'text-pink-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-pink-600'
            : 'text-gray-500 hover:text-gray-700 bg-gray-50'}
    `;

    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            {/* Main Container */}
            <div className="w-full sm:w-[95%] max-w-[850px] h-full sm:h-[650px] bg-white rounded-none sm:rounded-lg shadow-xl flex flex-col overflow-hidden relative transition-transform">

                {/* Header (Gray bg, with Close Button inside) */}
                <div className="h-[45px] sm:h-[50px] bg-gray-50 flex items-center justify-between px-0 border-b border-gray-200 shrink-0 relative">
                    <div className="flex h-full items-center w-full pr-12">
                        <button onClick={() => { setActiveTab('inbox'); setSelectedNote(null); }} className={getTabClass('inbox')}>받은쪽지함</button>
                        <button onClick={() => { setActiveTab('unread'); setSelectedNote(null); }} className={getTabClass('unread')}>미열람목록</button>
                        <button onClick={() => { setActiveTab('sent'); setSelectedNote(null); }} className={getTabClass('sent')}>보낸쪽지함</button>
                        <button onClick={() => { setActiveTab('write'); setSelectedNote(null); }} className={getTabClass('write')}>쪽지보내기</button>
                    </div>

                    {/* Close Button (Inside Header) */}
                    <button onClick={onClose} className="absolute right-0 top-0 h-full w-12 text-gray-400 hover:text-pink-600 transition-colors flex items-center justify-center border-l border-gray-200 bg-gray-50 z-20">
                        <X size={20} />
                    </button>
                </div>

                {/* Body Area */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-white">

                    {/* Left Panel (User Info + Stats) */}
                    <div className="w-full md:w-[260px] bg-gray-100 p-3 sm:p-5 flex flex-col gap-3 sm:gap-5 shrink-0 overflow-y-auto border-r border-gray-200">

                        {/* Greeting (Integrated nicely) */}
                        <div className="text-gray-800 font-bold text-base sm:text-lg leading-tight px-1 mb-2">
                            <span className="text-pink-600">{userName}</span>님<br />환영합니다
                            <div className="text-[10px] sm:text-xs font-normal text-gray-500 mt-1 sm:mt-2">오늘도 즐거운 하루 되세요</div>
                        </div>

                        {/* Stats Box (White) */}
                        <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                            {/* Inbox */}
                            <div onClick={() => setActiveTab('inbox')} className="flex justify-between items-center cursor-pointer hover:bg-pink-50 p-2 sm:p-3 rounded transition-colors group border-b border-gray-100 last:border-0">
                                <span className={`text-xs sm:text-sm font-bold ${activeTab === 'inbox' ? 'text-pink-600' : 'text-gray-600 group-hover:text-pink-600'}`}>받은쪽지함</span>
                                <span className="font-bold text-pink-600 text-xs sm:text-sm">{inbox.length} 건</span>
                            </div>

                            {/* Unread */}
                            <div onClick={() => setActiveTab('unread')} className="flex justify-between items-center cursor-pointer hover:bg-pink-50 p-2 sm:p-3 rounded transition-colors group border-b border-gray-100 last:border-0">
                                <span className={`text-xs sm:text-sm font-bold ${activeTab === 'unread' ? 'text-pink-600' : 'text-gray-600 group-hover:text-pink-600'}`}>미확인쪽지</span>
                                <span className="font-bold text-red-500 text-xs sm:text-sm">{unread.length} 건</span>
                            </div>

                            {/* Sent */}
                            <div onClick={() => setActiveTab('sent')} className="flex justify-between items-center cursor-pointer hover:bg-pink-50 p-2 sm:p-3 rounded transition-colors group">
                                <span className={`text-xs sm:text-sm font-bold ${activeTab === 'sent' ? 'text-pink-600' : 'text-gray-600 group-hover:text-pink-600'}`}>보낸쪽지</span>
                                <span className="font-bold text-pink-600 text-xs sm:text-sm">{sent.length} 건</span>
                            </div>
                        </div>
                    </div>

                    {/* B. Content Area */}
                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white">

                        {/* CASE 1: WRITE MODE */}
                        {activeTab === 'write' && (
                            <div className="h-full flex flex-col">
                                <div className="border-b border-gray-200 pb-2 mb-4 text-xs sm:text-sm flex items-center">
                                    <span className="font-bold text-gray-700 whitespace-nowrap mr-2">받는 사람 : </span>
                                    <input
                                        type="text"
                                        value={receiver}
                                        onChange={(e) => setReceiver(e.target.value)}
                                        placeholder="[관리자]"
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 font-bold text-gray-800 focus:outline-none focus:border-pink-500 transition-colors"
                                    />
                                </div>
                                <textarea
                                    className="flex-1 border border-gray-300 rounded p-4 resize-none focus:outline-none focus:border-pink-400 text-xs sm:text-sm"
                                    placeholder="내용을 입력하세요..."
                                    value={writeContent}
                                    onChange={(e) => setWriteContent(e.target.value)}
                                />
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={handleSend}
                                        className="bg-pink-600 text-white px-8 py-3 rounded shadow hover:bg-pink-700 font-bold w-full sm:w-auto text-sm sm:text-base"
                                    >
                                        쪽지보내기
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* CASE 2: DETAIL VIEW */}
                        {selectedNote && activeTab !== 'write' && (
                            <div className="h-full flex flex-col border border-gray-200 rounded">
                                {/* Header Info */}
                                <div className="bg-gray-50 p-3 border-b border-gray-200 grid grid-cols-1 gap-2 text-xs sm:text-sm">
                                    <div className="flex justify-between">
                                        <div><span className="text-gray-500 w-16 inline-block">보낸사람</span> <span className="font-bold">{selectedNote.sender}</span></div>
                                        <div className="text-gray-400">{selectedNote.date}</div>
                                    </div>
                                    <div><span className="text-gray-500 w-16 inline-block">받는사람</span> <span className="font-bold">{selectedNote.receiver}</span></div>
                                </div>
                                {/* Content */}
                                <div className="flex-1 p-4 text-xs sm:text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap">
                                    {selectedNote.content}
                                </div>
                                {/* Footer Buttons */}
                                <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                                    <button onClick={() => { setActiveTab('write'); setReceiver(selectedNote.sender); setWriteContent(`[답장]\n\n-----------------\n${selectedNote.content}\n-----------------\n`); setSelectedNote(null); }} className="px-3 py-1 bg-pink-600 text-white text-xs sm:text-sm rounded hover:bg-pink-700">답장</button>
                                    <button onClick={() => setSelectedNote(null)} className="px-3 py-1 bg-gray-500 text-white text-xs sm:text-sm rounded hover:bg-gray-600">목록</button>
                                </div>
                            </div>
                        )}

                        {/* CASE 3: LIST VIEW */}
                        {!selectedNote && activeTab !== 'write' && (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-t-2 border-b border-pink-600 text-gray-700 bg-gray-50 text-xs sm:text-sm">
                                        <th className="py-3 text-center w-full sm:w-1/2">내 용</th>
                                        <th className="py-3 w-20 text-center hidden sm:table-cell">보낸사람</th>
                                        <th className="py-3 w-24 text-center hidden sm:table-cell">받은시간</th>
                                        <th className="py-3 w-12 text-center hidden sm:table-cell">삭제</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeTab === 'inbox' ? inbox : activeTab === 'unread' ? unread : sent).map(note => (
                                        <tr key={note.id} className="border-b border-gray-200 hover:bg-pink-50 cursor-pointer transition-colors" onClick={() => handleView(note)}>
                                            <td className="py-3 px-2 sm:px-4 text-gray-600 truncate max-w-[200px] sm:max-w-[300px] flex items-center gap-2 text-xs sm:text-sm">
                                                {!note.isRead && activeTab !== 'sent' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse"></span>}
                                                {note.content}
                                            </td>
                                            <td className={`py-3 text-center hidden sm:table-cell ${note.isAdmin ? 'text-pink-600 font-bold' : 'text-gray-600'}`}>{note.sender}</td>
                                            <td className="py-3 text-center text-xs text-gray-400 hidden sm:table-cell">{note.date.split(' ')[0]}<br />{note.date.split(' ')[1]}</td>
                                            <td className="py-3 text-center hidden sm:table-cell">
                                                <button
                                                    onClick={(e) => handleDelete(note.id, e)}
                                                    className="px-2 py-1 bg-gray-200 text-gray-500 text-[10px] rounded hover:bg-red-500 hover:text-white transition-colors"
                                                >
                                                    DEL
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(activeTab === 'inbox' ? inbox : activeTab === 'unread' ? unread : sent).length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-gray-400">
                                                내역이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
