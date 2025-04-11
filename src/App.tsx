import { useState, useEffect } from 'react';
import { User, Post, PostType } from './types';
import { Users } from 'lucide-react'
import { BarChart3, MessageSquare } from 'lucide-react';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postType, setPostType] = useState<PostType>('popular');
  const [loading, setLoading] = useState(true);

  const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;
  console.log('Access Token:', ACCESS_TOKEN);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const headers = {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        };
        
        const [usersResponse, postsResponse] = await Promise.all([
          fetch('http://20.244.56.144/evaluation-service/users', { headers }),
          fetch(`http://hostname/posts?type=${postType}`, { headers }),
        ]);

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

    fetchData();
    const interval = setInterval(fetchData, 3000000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [postType]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Social Media Analytics
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Posts
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPostType('popular')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      postType === 'popular'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Popular
                  </button>
                  <button
                    onClick={() => setPostType('latest')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      postType === 'latest'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Latest
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Top Users
              </h2>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;