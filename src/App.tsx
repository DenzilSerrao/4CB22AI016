import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TopUsers from './pages/TopUsers';
import Posts from './pages/TopPosts';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/top-users" element={<TopUsers />} />
        <Route path="/posts" element={<Posts />} />
      </Routes>
    </BrowserRouter>
  );
}