export interface User {
  id: string;
  name: string;
  commentCount: number;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  commentCount: number;
}

export type PostType = 'latest' | 'popular';