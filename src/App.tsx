import { useState, useEffect } from 'react';

interface Comment {
  id: number;
  content: string;
}

interface Post {
  id: number;
  userid: number;
  content: string;
  comments?: Comment[];
}

interface User {
  id: number;
  name: string;
  commentCount: number;
}

export default function App() {
  const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch posts for a given user
  async function getUserPosts(userId: number): Promise<Post[]> {
    const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
    const response = await fetch(`http://20.244.56.144/evaluation-service/users/${userId}/posts`, { headers });
    if (!response.ok) {
      throw new Error(`Error fetching posts for user ${userId}: ${response.status}`);
    }
    const data = await response.json();
    return data.posts && Array.isArray(data.posts) ? data.posts : data;
  }

  // Fetch comments for a given post
  async function getPostComments(postId: number): Promise<Comment[]> {
    const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
    const response = await fetch(`http://20.244.56.144/evaluation-service/posts/${postId}/comments`, { headers });
    if (!response.ok) {
      throw new Error(`Error fetching comments for post ${postId}: ${response.status}`);
    }
    const data = await response.json();
    return data.comments && Array.isArray(data.comments) ? data.comments : data;
  }

  // Fetch all users and compute each user's total comment count
  async function fetchAllUsersWithComments(): Promise<User[]> {
    const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
    // Fetch users (assuming response structure { users: { "1": "John Doe", ... } })
    const usersResponse = await fetch(`http://20.244.56.144/evaluation-service/users`, { headers });
    if (!usersResponse.ok) {
      throw new Error(`Error fetching users: ${usersResponse.status}`);
    }
    const usersData = await usersResponse.json();
    // Map response into array of users
    const usersArray: User[] = usersData.users
      ? Object.entries(usersData.users).map(([id, name]) => ({
          id: Number(id),
          name: String(name),
          commentCount: 0,
        }))
      : [];
    // For each user, fetch posts and compute total comment count
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
        // Sort users by commentCount descending and take top 5
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
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Social Media Analytics</h1>
      </header>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <main>
          <h2 className="text-xl font-semibold mb-4">Top 5 Users by Comment Count</h2>
          {topUsers.map(user => (
            <div key={user.id} className="border p-4 mb-4 rounded">
              <p className="font-medium">User: {user.name}</p>
              <p className="mt-2 text-sm text-gray-600">Comments: {user.commentCount}</p>
            </div>
          ))}
        </main>
      )}
    </div>
  );
}