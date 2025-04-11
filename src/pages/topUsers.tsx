import { useState, useEffect } from "react";
import { Post } from "../types";
import { getCachedTopUsers } from "../api";

// Define TopUser interface
export interface TopUser {
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
        // Use the cached top users info (query once and reuse it)
        const cachedData = await getCachedTopUsers();
        setTopUsers(cachedData);
      } catch (error) {
        console.error("Error fetching cached top users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Top 5 Users by Most Commented Post
      </h1>
      {loading ? (
        <p>Loading top users...</p>
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