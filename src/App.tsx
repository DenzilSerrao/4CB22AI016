import { useState, useEffect } from 'react';
import { User, Post, PostType } from './types';
import { BarChart3 } from 'lucide-react';
import { UserList } from './components/UserList';
import { PostList } from './components/PostList';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postType, setPostType] = useState<PostType>('popular');
  const [loading, setLoading] = useState(true);

  // Using the VITE_ prefix from .env
  const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const headers = {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        };

        // Use valid API endpoints. Replace postsUrl with a valid hostname.
        const usersUrl = 'http://20.244.56.144/evaluation-service/users';
        const postsUrl = 'http://your-valid-posts-hostname/posts';

        const [usersResponse, postsResponse] = await Promise.all([
          fetch(usersUrl, { headers }),
          fetch(`${postsUrl}?type=${postType}`, { headers }),
        ]);

        if (usersResponse.status === 401) {
          console.error('Unauthorized access to users API');
        }
        if (!usersResponse.ok || !postsResponse.ok) {
          throw new Error(
            `Error fetching data: users(${usersResponse.status}), posts(${postsResponse.status})`
          );
        }

        const usersData = await usersResponse.json();
        const postsData = await postsResponse.json();

        setUsers(usersData);
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data only once on component mount
    fetchData();
  }, []); 

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Social Media Analytics
          </h1>
        </header>
        {/* Render the rest of your UI */}
        <PostList posts={posts} type={postType} loading={loading} />
        <UserList users={users} loading={loading} />
      </div>
    </div>
  );
}

export default App;