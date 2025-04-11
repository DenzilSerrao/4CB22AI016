import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to Social Media Analytics</h1>
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