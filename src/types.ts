export interface Comment {
  id: number;
  content: string;
}

export interface Post {
  id: number;
  userid: number;
  title?: string;
  content: string;
  commentCount?: number;
  timestamp?: string;
  comments?: Comment[];
}

export interface User {
  id: number;
  name: string;
  commentCount: number;
}