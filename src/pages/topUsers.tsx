import { useState, useEffect } from 'react';
import { User, Post, Comment } from '../types';
import { fetchAllUsers, fetchUserPosts, fetchPostComments } from '../api';

interface TopUser {
  id: number;
  name: string;
  topPostId: number;
  topComments: number;
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

        // STEP 2: For each user, fetch their posts and determine their most commented post.
        const topUsersData: (TopUser | null)[] = await Promise.all(
          users.map(async (user) => {
            const posts: Post[] = await fetchUserPosts(user.id);
            if (!posts || posts.length === 0) return null;
            // For every post, fetch its comments and attach comment count.
            const postsWithComments = await Promise.all(
              posts.map(async (post) => {
                const comments: Comment[] = await fetchPostComments(post.id);
                const count = Array.isArray(comments) ? comments.length : 0;
                return { ...post, commentCount: count };
              })
            );
            // Find the post with the maximum comment count.
            const topPost = postsWithComments.reduce((prev, curr) =>
              (curr.commentCount || 0) > (prev.commentCount || 0) ? curr : prev
            );
            return {
              id: user.id,
              name: user.name,
              topPostId: topPost.id,
              topComments: topPost.commentCount || 0,
            };
          })
        );

        // Filter out users with no posts.
        const validTopUsers = topUsersData.filter((u): u is TopUser => u !== null);
        // Sort users descending by the top post's comment count.
        validTopUsers.sort((a, b) => b.topComments - a.topComments);
        // Take only the top 5 users.
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
        topUsers.map(user => (
          <div key={user.id} className="border p-4 mb-4 rounded">
            <p className="font-medium">User: {user.name}</p>
            <p className="mt-2 text-sm text-gray-600">
              Post ID with most comments: {user.topPostId} (Comments: {user.topComments})
            </p>
          </div>
        ))
      )}
    </div>
  );
}