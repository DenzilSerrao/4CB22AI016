import { Post, User, Comment } from "./types";

const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;
const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };

export async function fetchAllUsers(): Promise<User[]> {
  const response = await fetch("http://20.244.56.144/evaluation-service/users", { headers });
  if (!response.ok) {
    throw new Error(`Error fetching users: ${response.status}`);
  }
  const data = await response.json();
  return data.users
    ? Object.entries(data.users).map(([id, name]) => ({
        id: Number(id),
        name: String(name),
        commentCount: 0,
      }))
    : [];
}

export async function fetchUserPosts(userId: number): Promise<Post[]> {
  const response = await fetch(`http://20.244.56.144/evaluation-service/users/${userId}/posts`, { headers });
  if (!response.ok) {
    throw new Error(`Error fetching posts for user ${userId}: ${response.status}`);
  }
  const data = await response.json();
  return data.posts && Array.isArray(data.posts) ? data.posts : data;
}

export async function fetchPostComments(postId: number): Promise<Comment[]> {
  const response = await fetch(`http://20.244.56.144/evaluation-service/posts/${postId}/comments`, { headers });
  if (!response.ok) {
    throw new Error(`Error fetching comments for post ${postId}: ${response.status}`);
  }
  const data = await response.json();
  return data.comments && Array.isArray(data.comments) ? data.comments : data;
}

export async function fetchAllPostsFromAllUsers(): Promise<Post[]> {
  const users = await fetchAllUsers();
  const postsArrays = await Promise.all(users.map(user => fetchUserPosts(user.id)));
  return postsArrays.flat();
}