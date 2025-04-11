import { Post, User, Comment } from "./types";

const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;
const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };

// Fetch all users
export async function fetchAllUsers(): Promise<User[]> {
  const response = await fetch("http://20.244.56.144/evaluation-service/users", { headers });
  if (!response.ok) throw new Error(`Error fetching users: ${response.status}`);
  const data = await response.json();
  return data.users
    ? Object.entries(data.users).map(([id, name]) => ({
        id: Number(id),
        name: String(name),
        commentCount: 0,
      }))
    : [];
}

// Fetch all posts by a user
export async function fetchUserPosts(userId: number): Promise<Post[]> {
  const response = await fetch(`http://20.244.56.144/evaluation-service/users/${userId}/posts`, { headers });
  if (!response.ok) throw new Error(`Error fetching posts for user ${userId}: ${response.status}`);
  const data = await response.json();
  return data.posts && Array.isArray(data.posts) ? data.posts : data;
}

// Fetch all comments on a post
export async function fetchPostComments(postId: number): Promise<Comment[]> {
  const response = await fetch(`http://20.244.56.144/evaluation-service/posts/${postId}/comments`, { headers });
  if (!response.ok) throw new Error(`Error fetching comments for post ${postId}: ${response.status}`);
  const data = await response.json();
  return data.comments && Array.isArray(data.comments) ? data.comments : data;
}

// Fetch all posts from all users
export async function fetchAllPostsFromAllUsers(): Promise<Post[]> {
  const users = await fetchAllUsers();
  const postsArrays = await Promise.all(users.map(user => fetchUserPosts(user.id)));
  return postsArrays.flat();
}

// Caching
let cachedAllPostsWithComments: (Post & { commentCount: number })[] | undefined;
const cachedPosts: { latest?: Post[]; popular?: Post[] } = {};
let cachedTopUsers:
  | { id: number; name: string; topPost: Post & { commentCount: number } }[]
  | undefined;

// Clear all cached data
export function clearCachedData(): void {
  cachedAllPostsWithComments = undefined;
  cachedPosts.latest = undefined;
  cachedPosts.popular = undefined;
  cachedTopUsers = undefined;
}

// Get all posts with comment count (once)
export async function getCachedAllPostsWithComments(): Promise<(Post & { commentCount: number })[]> {
  if (cachedAllPostsWithComments) return cachedAllPostsWithComments;
  const allPosts = await fetchAllPostsFromAllUsers();
  const postsWithComments = await Promise.all(
    allPosts.map(async (post: Post) => {
      const comments = await fetchPostComments(post.id);
      const commentCount = Array.isArray(comments) ? comments.length : 0;
      return { ...post, commentCount };
    })
  );
  cachedAllPostsWithComments = postsWithComments;
  return postsWithComments;
}

// Get latest or popular posts
export async function getCachedPosts(tag: "latest" | "popular"): Promise<Post[]> {
  if (cachedPosts[tag]) return cachedPosts[tag]!;

  const postsWithComments = await getCachedAllPostsWithComments();

  if (tag === "latest") {
    const sorted = postsWithComments.sort(
      (a, b) => new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime()
    );
    cachedPosts.latest = sorted.slice(0, 5);
  } else {
    const maxComments = Math.max(...postsWithComments.map(post => post.commentCount));
    cachedPosts.popular = postsWithComments.filter(post => post.commentCount === maxComments);
  }

  return cachedPosts[tag]!;
}

// Get top 5 users with most popular posts
export async function getCachedTopUsers(): Promise<{ id: number; name: string; topPost: Post & { commentCount: number } }[]> {
  if (cachedTopUsers) return cachedTopUsers;

  const postsWithComments = await getCachedAllPostsWithComments();

  // Group posts by user
  const userPostsMap: { [userId: number]: (Post & { commentCount: number })[] } = {};
  postsWithComments.forEach((post) => {
    if (!userPostsMap[post.userid]) {
      userPostsMap[post.userid] = [];
    }
    userPostsMap[post.userid].push(post);
  });

  const users = await fetchAllUsers();
  const topUsers: { id: number; name: string; topPost: Post & { commentCount: number } }[] = [];

  users.forEach((user) => {
    const posts = userPostsMap[user.id];
    if (posts && posts.length > 0) {
      const topPost = posts.reduce((prev, curr) => (curr.commentCount > prev.commentCount ? curr : prev));
      topUsers.push({ id: user.id, name: user.name, topPost });
    }
  });

  cachedTopUsers = topUsers.sort((a, b) => b.topPost.commentCount - a.topPost.commentCount).slice(0, 5);
  return cachedTopUsers;
}
