import { useState, useEffect } from "react";
import { User, Post, Comment } from "../types";
import { fetchAllUsers, fetchUserPosts, fetchPostComments } from "../api";

interface TopUser {
  id: number;
  name: string;
  topPost: Post;
}

export default function TopUsers() {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // STEP 1: Fetch all users.
        const users: User[] = await fetchAllUsers();
        // STEP 2: For each user, fetch their posts and compute the comment count per post.
        const topUsersData: (TopUser | null)[] = await Promise.all(
          users.map(async (user) => {
            const posts: Post[] = await fetchUserPosts(user.id);
            if (!posts || posts.length === 0) return null;
            // For each post, fetch its comments to compute commentCount.
            const postsWithComments = await Promise.all(
              posts.map(async (post) => {
                const comments: Comment[] = await fetchPostComments(post.id);
                const commentCount = Array.isArray(comments) ? comments.length : 0;
                return { ...post, commentCount };
              })
            );
            if (!postsWithComments || postsWithComments.length === 0) return null;
            // Find the post with the maximum comment count.
            const topPost = postsWithComments.reduce((prev, curr) =>
              (curr.commentCount || 0) > (prev.commentCount || 0) ? curr : prev
            );
            if (!topPost) return null;
            return {
              id: user.id,
              name: user.name,
              topPost,
            } as TopUser;
          })
        );
        // Filter out any users with no valid top post.
        const validTopUsers = topUsersData.filter(
          (u): u is TopUser => u !== null && u.topPost !== undefined
        );
        // Sort users descending by the top post's comment count.
        validTopUsers.sort(
          (a, b) => (b.topPost.commentCount || 0) - (a.topPost.commentCount || 0)
        );
        // Keep only the top 5 users.
        setTopUsers(validTopUsers.slice(0, 5));
      } catch (error) {
        console.error("Error fetching top users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Top 5 Users by Most Commented Post</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        topUsers.map((user) => (
          <div key={user.id} className="border p-4 mb-4 rounded shadow">
            <h2 className="text-xl font-medium mb-2">User: {user.name}</h2>
            <div className="p-4 bg-gray-50 rounded">
              <p className="font-semibold">Top Post ID: {user.topPost.id}</p>
              {user.topPost.title && (
                <p className="mt-1">Title: {user.topPost.title}</p>
              )}
              <p className="mt-1">Content: {user.topPost.content}</p>
              <p className="mt-1">
                Comments: {user.topPost.commentCount || 0}
              </p>
              {user.topPost.timestamp && (
                <p className="mt-1 text-xs text-gray-500">
                  Posted on: {new Date(user.topPost.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}