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

// Global cache for posts keyed by tag.
const cachedPosts: { latest?: Post[]; popular?: Post[] } = {};

// Returns posts for the given tag: "latest" means top 5 recent posts,
// "popular" means those posts having the maximum comment count.
export async function getCachedPosts(tag: "latest" | "popular"): Promise<Post[]> {
  if (cachedPosts[tag]) {
    return cachedPosts[tag]!;
  }
  // Fetch all posts and attach comment count to each.
  const allPosts = await fetchAllPostsFromAllUsers();
  const postsWithComments = await Promise.all(
    allPosts.map(async (post: Post) => {
      const comments = await fetchPostComments(post.id);
      const commentCount = Array.isArray(comments) ? comments.length : 0;
      return { ...post, commentCount };
    })
  );
  if (tag === "latest") {
    const sortedByTime = postsWithComments.sort(
      (a, b) =>
        new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime()
    );
    cachedPosts.latest = sortedByTime.slice(0, 5);
  } else {
    const maxComments = Math.max(...postsWithComments.map(post => post.commentCount || 0));
    cachedPosts.popular = postsWithComments.filter(
      post => (post.commentCount || 0) === maxComments
    );
  }
  return cachedPosts[tag]!;
}

// Global cache for top users.
let cachedTopUsers: { id: number; name: string; topPost: Post & { commentCount: number } }[] | undefined;

export async function getCachedTopUsers(): Promise<{ id: number; name: string; topPost: Post & { commentCount: number } }[]> {
  if (cachedTopUsers) {
    return cachedTopUsers;
  }
  // Fetch all users.
  const users: User[] = await fetchAllUsers();
  // For each user, fetch their posts and compute comment counts.
  const topUsersData = await Promise.all(
    users.map(async (user) => {
      const posts: Post[] = await fetchUserPosts(user.id);
      if (!posts || posts.length === 0) return null;
      const postsWithComments = await Promise.all(
        posts.map(async (post) => {
          const comments: Comment[] = await fetchPostComments(post.id);
          const commentCount = Array.isArray(comments) ? comments.length : 0;
          // Force commentCount as number.
          return { ...post, commentCount: commentCount };
        })
      );
      if (!postsWithComments || postsWithComments.length === 0) return null;
      const topPost = postsWithComments.reduce((prev, curr) =>
        (curr.commentCount || 0) > (prev.commentCount || 0) ? curr : prev
      );
      if (!topPost) return null;
      return {
        id: user.id,
        name: user.name,
        topPost,
      };
    })
  );
  // Use a type predicate that ensures topPost has commentCount as number.
  const validTopUsers = topUsersData.filter(
    (u): u is { id: number; name: string; topPost: Post & { commentCount: number } } =>
      u !== null && u.topPost.commentCount !== undefined
  );
  validTopUsers.sort(
    (a, b) => (b.topPost.commentCount || 0) - (a.topPost.commentCount || 0)
  );
  cachedTopUsers = validTopUsers.slice(0, 5);
  return cachedTopUsers;
}