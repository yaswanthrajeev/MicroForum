import React, { useState } from "react";
import axios from "axios";
import "../styles/Form.css";

const CreatePost = ({ onPostCreated }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/posts/create",
        { title, body },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTitle("");
      setBody("");
      if (onPostCreated) onPostCreated();
    } catch (err) {
      setError("Failed to create post.");
    }
  };

  return (
    <div className="form-container">
      <h2>Create Post</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Post created!</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        /><br />
        <textarea
          placeholder="Body"
          value={body}
          onChange={e => setBody(e.target.value)}
          required
        /><br />
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreatePost;
