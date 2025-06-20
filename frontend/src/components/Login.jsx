import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsLoggedIn }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        try {
            const response = await axios.post("http://localhost:8000/auth/login",{
                username,
                password,
            });
            localStorage.setItem("token", response.data.access_token);
            // Store isAdmin based on role from backend
            localStorage.setItem("isAdmin", response.data.role === "admin" ? "true" : "false");
            setIsLoggedIn(true); // Update auth state
            setSuccess(true);
            setTimeout(() => {
                navigate("/");
            }, 1000); // Optional: short delay to show success message
        } catch (err) {
          setError("Invalid credentials or server error.");   
        }
    };

    return (
    <div className="form-container">
      <h2>Login</h2>
      {error && <p style={{color: "red"}}>{error}</p>}
      {success && <p style={{color: "green"}}>Login successful!</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;