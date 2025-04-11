import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Post } from "../types";

export default function TopPosts() {
  const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // The address bar shows /posts?type=popular or /posts?type=latest.
  const type = searchParams.get("type") === "latest" ? "latest" : "popular";

  // Fetch all posts (assumes an endpoint returning all posts)
  async function fetchAllPosts(): Promise<Post[]> {
    const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
    const response = await fetch("http://20.244.56.144/evaluation-service/posts", { headers });
    if (!response.ok) {
      throw new Error(`Error fetching posts: ${response.status}`);
    }
    const data = await response.json();
    return data.posts && Array.isArray(data.posts) ? data.posts : data;
  }

  // Fetch the comment count for a given post
  async function fetchCommentsCount(postId: number): Promise<number> {
    const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
    const response = await fetch(
      `http://20.244.56.144/evaluation-service/posts/${postId}/comments`,
      { headers }
    );
    if (!response.ok) {
      throw new Error(`Error fetching comments for post ${postId}: ${response.status}`);
    }
    const data = await response.json();
    const comments = data.comments && Array.isArray(data.comments) ? data.comments : data;
    return comments.length;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch all posts
        let postsData = await fetchAllPosts();

        // For each post, fetch its comment count
        postsData = await Promise.all(
          postsData.map(async (post: Post) => {
            const commentCount = await fetchCommentsCount(post.id);
            return { ...post, commentCount };
          })
        );

        // Sort posts based on the navigated page type:
        // "latest": sort descending by timestamp (assumes post.timestamp exists and is ISO formatted)
        // "popular": sort descending by comment count
        if (type === "latest") {
          postsData.sort(
            (a, b) =>
              new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime()
          );
        } else {
          postsData.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
        }
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts and comment counts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [type, ACCESS_TOKEN]);

  // Handler to toggle the query parameter
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
              {post.timestamp && (
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