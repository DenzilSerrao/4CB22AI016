import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Post } from "../types";
import { getCachedPosts } from "../api";

export default function TopPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // URL: /posts?type=popular or /posts?type=latest; default to "popular"
  const type = searchParams.get("type") === "latest" ? "latest" : "popular";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Use cached posts; if not cached, the API will fetch and cache the data.
        const cachedData = await getCachedPosts(type);
        setPosts(cachedData);
      } catch (error) {
        console.error("Error fetching cached posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [type]);

  const handleTypeChange = (newType: "popular" | "latest") => {
    navigate(`/posts?type=${newType}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Posts - {type.charAt(0).toUpperCase() + type.slice(1)}
      </h1>
      <div className="mb-4">
        <button
          onClick={() => handleTypeChange("popular")}
          className={`mr-2 px-4 py-2 rounded ${
            type === "popular" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Popular
        </button>
        <button
          onClick={() => handleTypeChange("latest")}
          className={`px-4 py-2 rounded ${
            type === "latest" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Latest
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p className="mb-4">Total Posts: {posts.length}</p>
          {posts.map((post) => (
            <div key={post.id} className="border p-4 mb-4 rounded">
              <p className="font-medium">{post.title || post.content}</p>
              <p className="mt-2 text-sm text-gray-600">
                Comments: {post.commentCount || 0}
              </p>
              {type === "latest" && post.timestamp && (
                <p className="text-xs text-gray-500">
                  Posted on: {new Date(post.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}