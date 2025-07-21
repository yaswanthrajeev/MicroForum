import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Form.css";
import API_BASE_URL from "../config";
const Signup = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/signup`,{
                username,
                email,
                password,
            });
            localStorage.setItem("token", response.data.access_token);
            setSuccess(true);
            setTimeout(() => {
                 navigate("/login");
            }, 1000);
        } catch (err) {
          setError("Signup failed. Username or email may already be taken.");   
        }
    };

    return (
    <div className="form-container">
      <h2>Signup</h2>
      {error && <p className="text-error">{error}</p>}
      {success && <p className="text-success">Signup successful!</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;