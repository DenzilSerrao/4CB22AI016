export interface Comment {
  id: number;
  content: string;
}

export interface Post {
  id: number;
  userid: number;
  content: string;
  comments?: Comment[];
}

export interface User {
  id: number;
  name: string;
  commentCount: number;
}