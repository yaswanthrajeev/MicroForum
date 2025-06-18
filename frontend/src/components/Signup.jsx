import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Form.css";
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
            const response = await axios.post("http://localhost:8000/auth/signup",{
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
      {error && <p style={{color: "red"}}>{error}</p>}
      {success && <p style={{color: "green"}}>Signup successful!</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        /><br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;