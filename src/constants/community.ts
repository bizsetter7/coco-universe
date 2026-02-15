export interface Post {
    id: number;
    category: string;
    title: string;
    content: string;
    author: string;
    time: string;
    likes: number;
    comments: number;
    isHot?: boolean;
}

export const CATEGORIES = [
    { id: 'all', name: '전체' },
    { id: 'nightlife', name: '밤 문화 Talk' },
    { id: 'partner', name: '같이일할단짝' },
    { id: 'market', name: '중고거래' },
    { id: 'legal', name: '무료법률상담' },
    { id: 'beauty', name: '뷰티·패션·이벤트' },
    { id: 'lounge', name: '프리미엄 라운지' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

export const MOCK_POSTS: Post[] = [
    {
        id: 1,
        category: '자유게시판',
        title: '오늘 퇴근길 노을 보셨나요? 진짜 힐링..✨',
        content: '요즘 일하느라 너무 바빴는데 잠깐 고개 들어보니 하늘이 너무 예쁘더라고요. 언니들도 오늘 하루 고생 많으셨어요!',
        author: '익명123',
        time: '10분 전',
        likes: 12,
        isHot: true,
    },
    {
        id: 17,
        category: '프리미엄 라운지',
        title: '멘탈 관리하는 나만의 루틴 공유 🧘‍♀️',
        content: '명상이랑 가벼운 독서가 큰 도움이 되네요. 바쁜 일상 속에서도 마음의 여유를 찾는 팁들입니다.',
        author: '퀸즈',
        time: '1시간 전',
        likes: 89,
        comments: 15,
    },
    {
        id: 6,
        category: '자유게시판',
        title: '동네 맛집 추천 좀 해주세요 (강남역 근처)',
        content: '오늘 친구랑 만나기로 했는데 조용하고 분위기 좋은 곳 있을까요? 파스타나 일식 선호합니다!',
        author: '배고픈다람쥐',
        time: '4시간 전',
        likes: 9,
        comments: 6,
    },
    {
        id: 18,
        category: '꿀팁 & 노하우',
        title: '멀티비타민 이거 진짜 물건이네요 ㅋㅋ',
        content: '직업 특성상 피로를 달고 사는데.. 이거 먹고 나서부터 아침이 달라요. 내돈내산 찐후기입니다.',
        author: '비타민짱',
        time: '45분 전',
        likes: 15,
        comments: 28,
    },
    {
        id: 19,
        category: '뷰티·패션·이벤트',
        title: '결혼식 하객룩 코디 투표 좀 해줘요! 👗',
        content: '1번 베이지 원피스 vs 2번 트위드 자켓+슬랙스. 주말에 친구 결혼식인데 뭐가 더 괜찮을까요?',
        author: '고민상담',
        time: '2시간 전',
        likes: 32,
        comments: 14,
    },
    {
        id: 20,
        category: '자유게시판',
        title: '반려견이랑 산책하기 좋은 코스 아시나요?',
        content: '저희 집 댕댕이가 너무 좋아하네요. 서울 근교에 강아지랑 가기 좋은 곳 추천 부탁드려요!',
        author: '댕댕맘',
        time: '3시간 전',
        likes: 18,
        comments: 5,
    },
    {
        id: 7,
        category: '꿀팁 & 노하우',
        title: '재테크 초보 탈출한 수기 올려봅니다',
        content: '일하면서 번 돈 어떻게 모을지 막막했는데.. 가계부 쓰기랑 적금부터 시작하니까 눈에 보이네요.',
        author: '저축왕',
        time: '5시간 전',
        likes: 45,
        comments: 18,
        isHot: true,
    },
    {
        id: 15,
        category: '무료법률상담',
        title: '임대차 계약 관련 상담 가능할까요?',
        content: '전세 사기 예방하고 싶은데 계약서 쓰기 전에 꼭 확인해야 할 것들 알려주세요 변호사님!',
        author: '이사갈래요',
        time: '13시간 전',
        likes: 15,
        comments: 8,
    },
];

export const MOCK_COMMENTS = [
    { id: 101, postId: 1, author: '공감봇', content: '맞아요.. 오늘 노을 진짜 미쳤더라구요 ㅠㅠ', time: '5분 전' },
    { id: 102, postId: 1, author: '언니야', content: '고생 많으셨어요! 푹 쉬세요 ㅎㅎ', time: '2분 전' },
    { id: 103, postId: 7, author: '응원군', content: '수기 너무 잘 읽었습니다! 동기부여 되네요.', time: '1시간 전' },
    { id: 104, postId: 3, author: '메이크업러버', content: '정보 좀 알 수 있을까요? 쪽지 부탁드려요!', time: '30분 전' },
];
