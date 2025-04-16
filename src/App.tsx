import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import TopUsers from './pages/topUsers';
import Posts from './pages/topPosts';

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