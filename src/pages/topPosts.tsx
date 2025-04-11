import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Post } from "../types";
import { fetchAllPostsFromAllUsers, fetchPostComments } from "../api";

export default function TopPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // URL: /posts?type=popular or /posts?type=latest; default is popular.
  const type = searchParams.get("type") === "latest" ? "latest" : "popular";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // STEP 1: Fetch all posts from all users.
        let allPosts = await fetchAllPostsFromAllUsers();

        // STEP 2: For each post, fetch its comments and compute the comment count.
        const postsWithComments = await Promise.all(
          allPosts.map(async (post: Post) => {
            const comments = await fetchPostComments(post.id);
            const commentCount = Array.isArray(comments) ? comments.length : 0;
            return { ...post, commentCount };
          })
        );

        let filteredPosts: Post[] = [];
        if (type === "latest") {
          // Sort descending by timestamp and take top 5.
          const sortedByTime = postsWithComments.sort(
            (a, b) =>
              new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime()
          );
          filteredPosts = sortedByTime.slice(0, 5);
        } else {
          // For "popular", filter posts that have the maximum comment count.
          const maxComments = Math.max(
            ...postsWithComments.map((post) => post.commentCount || 0)
          );
          filteredPosts = postsWithComments.filter(
            (post) => (post.commentCount || 0) === maxComments
          );
        }
        setPosts(filteredPosts);
      } catch (error) {
        console.error("Error fetching posts and comment counts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [type]);

  // Handler to update the URL query parameter.
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