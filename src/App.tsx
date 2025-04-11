import { useState, useEffect } from 'react';

interface Post {
  id: number;
  userid: number;
  content: string;
  comments?: Comment[];
}

interface Comment {
  id: number;
  content: string;
}

export default function App() {
  const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = 1; // change as needed

  // Fetch posts for a given user
  async function getUserPosts(userId: number): Promise<Post[]> {
    const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
    const response = await fetch(`http://20.244.56.144/evaluation-service/users/${userId}/posts`, { headers });
    console.log('Response:', response);
    if (!response.ok) {
      throw new Error(`Error fetching posts for user ${userId}: ${response.status}`);
    }
    const data = await response.json();
    // Assuming API returns { posts: [...] } or just an array
    return data.posts && Array.isArray(data.posts) ? data.posts : data;
  }

  // Fetch comments for a given post
  async function getPostComments(postId: number): Promise<Comment[]> {
    const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
    const response = await fetch(`http://20.244.56.144/evaluation-service/posts/${postId}/comments`, { headers });
    console.log('Response:', response);
    if (!response.ok) {
      throw new Error(`Error fetching comments for post ${postId}: ${response.status}`);
    }
    const data = await response.json();
    // Assuming API returns { comments: [...] } or just an array
    return data.comments && Array.isArray(data.comments) ? data.comments : data;
  }

  // Combine posts with their corresponding comments
  async function fetchUserPostsAndComments(userId: number) {
    const posts = await getUserPosts(userId);
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await getPostComments(post.id);
        return { ...post, comments };
      })
    );
    return postsWithComments;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const posts = await fetchUserPostsAndComments(userId);
        setUserPosts(posts);
      } catch (error) {
        console.error('Error fetching posts and comments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, ACCESS_TOKEN]);

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Social Media Analytics</h1>
      </header>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <main>
          <h2 className="text-xl font-semibold mb-4">
            Posts and Comments for User {userId}
          </h2>
          {userPosts.map((post) => (
            <div key={post.id} className="border p-4 mb-4 rounded">
              <p className="font-medium">{post.content}</p>
              {post.comments && post.comments.length > 0 ? (
                <ul className="ml-4 mt-2 list-disc">
                  {post.comments.map((comment) => (
                    <li key={comment.id}>{comment.content}</li>
                  ))}
                </ul>
              ) : (
                <p className="ml-4 mt-2 text-gray-500">No comments available.</p>
              )}
            </div>
          ))}
        </main>
      )}
    </div>
  );
}