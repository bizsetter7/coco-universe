
export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    content: string;
    timestamp: number;
    isRead: boolean;
    isAdmin: boolean; // true if sender is admin
}

export interface ChatRoom {
    userId: string;
    userName: string;
    lastMessage: string;
    lastTimestamp: number;
    unreadCount: number;
}

// [Mock Data]
const MOCK_MESSAGES: Message[] = [
    {
        id: '1',
        senderId: 'admin',
        senderName: '관리자',
        receiverId: 'user1',
        content: '안녕하세요! 무엇을 도와드릴까요?',
        timestamp: Date.now() - 100000,
        isRead: true,
        isAdmin: true,
    },
    {
        id: '2',
        senderId: 'user1',
        senderName: '홍길동',
        receiverId: 'admin',
        content: '광고 등록 비용이 궁금합니다.',
        timestamp: Date.now() - 50000,
        isRead: false,
        isAdmin: false,
    }
];

export const MessageService = {
    // Get conversation for a specific user (User View) or Admin View of specific user
    getMessages: (userId: string): Message[] => {
        return MOCK_MESSAGES.filter(m => m.senderId === userId || m.receiverId === userId);
    },

    // Get list of users who have chatted (Admin View)
    getChatRooms: (): ChatRoom[] => {
        return [
            {
                userId: 'user1',
                userName: '홍길동',
                lastMessage: '광고 등록 비용이 궁금합니다.',
                lastTimestamp: Date.now() - 50000,
                unreadCount: 1,
            }
        ];
    },

    sendMessage: (senderId: string, receiverId: string, content: string, isAdmin: boolean): Message => {
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId,
            senderName: isAdmin ? '관리자' : '사용자',
            receiverId,
            content,
            timestamp: Date.now(),
            isRead: false,
            isAdmin,
        };
        MOCK_MESSAGES.push(newMessage);
        return newMessage;
    }
};
