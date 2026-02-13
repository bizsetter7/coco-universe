export interface Post {
    id: number;
    title: string;
    content: string;
    author: string;
    category: string;
    time: string;
    likes: number;
    comments: number;
    isHot?: boolean;
    created_at?: string;
    view_count?: number;
}

export interface Comment {
    id: number;
    post_id?: number; // DB style
    postId?: number;  // Mock style fallback
    author: string;
    content: string;
    time: string;
    created_at?: string;
}
