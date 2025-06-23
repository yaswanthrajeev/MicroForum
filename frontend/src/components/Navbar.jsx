import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css"; 

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
 <nav className="navbar">
  <div className="links">
    <Link to="/">Home</Link>
    {isLoggedIn && isAdmin && (
      <Link to="/admin-dashboard">Admin Dashboard</Link>
    )}
    {!isLoggedIn ? (
      <>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </>
    ) : (
      <>
        <Link to="/create-post">Create Post</Link>
        <Link to="/post">Search Post</Link>
        <button onClick={handleLogout}>Logout</button>
      </>
    )}
  </div>


</nav>

  );
};

export default Navbar;
