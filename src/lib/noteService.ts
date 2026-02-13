
export interface Note {
    id: string;
    sender: string; // Name
    receiver: string; // Name
    content: string;
    date: string;
    isRead: boolean;
    isAdmin: boolean; // sender is admin
}


// Mock Data
let MOCK_NOTES: Note[] = [
    {
        id: '1',
        sender: '[관리자]',
        receiver: '회원',
        content: '환영합니다! 통합 시스템 쪽지함입니다.\n이곳에서 관리자와 소통하실 수 있습니다.',
        date: new Date().toLocaleString('ko-KR'),
        isRead: false,
        isAdmin: true,
    }
];

const notifyUpdate = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notes-updated'));
    }
};

export const NoteService = {
    getInbox: (): Note[] => MOCK_NOTES.filter((n: Note) => n.receiver === '김대순' || n.receiver.includes('User')), // Mock
    getUnread: (): Note[] => MOCK_NOTES.filter((n: Note) => (n.receiver === '김대순') && !n.isRead),
    getSent: (): Note[] => MOCK_NOTES.filter((n: Note) => n.sender === '김대순'),

    sendNote: (content: string, receiver: string = '[관리자]') => {
        const newNote: Note = {
            id: Date.now().toString(),
            sender: '김대순',
            receiver: receiver,
            content: content,
            date: new Date().toLocaleString('ko-KR'),
            isRead: false,
            isAdmin: receiver === '[관리자]',
        };
        MOCK_NOTES = [newNote, ...MOCK_NOTES];
        notifyUpdate();
        return newNote;
    },

    deleteNote: (id: string) => {
        MOCK_NOTES = MOCK_NOTES.filter(n => n.id !== id);
        notifyUpdate();
    },

    markAsRead: (id: string) => {
        MOCK_NOTES = MOCK_NOTES.map(n => n.id === id ? { ...n, isRead: true } : n);
        notifyUpdate();
    }
};
