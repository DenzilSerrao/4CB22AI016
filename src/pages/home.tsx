import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCachedPosts } from "../api";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function preloadCache() {
      try {
        // Reuse cached data if it exists.
        // getCachedPosts internally checks for existing cached data.
        await Promise.all([getCachedPosts("latest"), getCachedPosts("popular")]);
        console.log("Cache loaded successfully");
      } catch (error) {
        console.error("Error preloading cache:", error);
      } finally {
        setLoading(false);
      }
    }
    preloadCache();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to Social Media Analytics
        </h1>
        <p>Loading cache, please wait...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        Welcome to Social Media Analytics
      </h1>
      <p>
        <Link to="/top-users" className="text-blue-500 underline">
          View Top Users
        </Link>
      </p>
      <p className="mt-2">
        <Link to="/posts" className="text-blue-500 underline">
          View Top/Latest Posts
        </Link>
      </p>
    </div>
  );
}