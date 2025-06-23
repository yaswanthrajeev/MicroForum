import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Signup from './components/Signup';
import Login from './components/Login';
import Navbar from './components/Navbar';
import { useState } from "react";
import AllPosts from './components/AllPosts';
import CreatePost from './components/CreatePost';
import AdminDashboard from './components/AdminDashboard';
import Search from "./components/Search";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <Router> 
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/create-post" element={isLoggedIn ? <CreatePost /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/post" element={<Search />} />
        <Route path="/" element={<AllPosts />} />
        {/* Add your home/dashboard or other routes here */}
      </Routes>
    </Router>
  );
}

export default App;