import { useState, useEffect } from 'react';
import { User } from '../types';

export default function TopUsers() {
  const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function getUserPosts(userId: number): Promise<any[]> {
    const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
    const response = await fetch(`http://20.244.56.144/evaluation-service/users/${userId}/posts`, { headers });
    if (!response.ok) {
      throw new Error(`Error fetching posts for user ${userId}: ${response.status}`);
    }
    const data = await response.json();
    return data.posts && Array.isArray(data.posts) ? data.posts : data;
  }

  async function getPostComments(postId: number): Promise<any[]> {
    const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
    const response = await fetch(`http://20.244.56.144/evaluation-service/posts/${postId}/comments`, { headers });
    if (!response.ok) {
      throw new Error(`Error fetching comments for post ${postId}: ${response.status}`);
    }
    const data = await response.json();
    return data.comments && Array.isArray(data.comments) ? data.comments : data;
  }

  async function fetchAllUsersWithComments(): Promise<User[]> {
    const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
    const usersResponse = await fetch(`http://20.244.56.144/evaluation-service/users`, { headers });
    if (!usersResponse.ok) {
      throw new Error(`Error fetching users: ${usersResponse.status}`);
    }
    const usersData = await usersResponse.json();

    const usersArray: User[] = usersData.users
      ? Object.entries(usersData.users).map(([id, name]) => ({
          id: Number(id),
          name: String(name),
          commentCount: 0,
        }))
      : [];

    const usersWithComments = await Promise.all(
      usersArray.map(async (user) => {
        try {
          const posts = await getUserPosts(user.id);
          let totalComments = 0;
          for (const post of posts) {
            const comments = await getPostComments(post.id);
            totalComments += Array.isArray(comments) ? comments.length : 0;
          }
          return { ...user, commentCount: totalComments };
        } catch (error) {
          console.error(`Error processing user ${user.id}`, error);
          return { ...user, commentCount: 0 };
        }
      })
    );
    return usersWithComments;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const usersWithComments = await fetchAllUsersWithComments();
        const sorted = usersWithComments.sort((a, b) => b.commentCount - a.commentCount);
        setTopUsers(sorted.slice(0, 5));
      } catch (error) {
        console.error('Error fetching users with comments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [ACCESS_TOKEN]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Top 5 Users by Comment Count</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        topUsers.map((user) => (
          <div key={user.id} className="border p-4 mb-4 rounded">
            <p className="font-medium">User: {user.name}</p>
            <p className="mt-2 text-sm text-gray-600">Comments: {user.commentCount}</p>
          </div>
        ))
      )}
    </div>
  );
}