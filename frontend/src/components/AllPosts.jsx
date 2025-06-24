import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentSection from "./CommentSection";
import "../styles/AllPosts.css"; // Adjust the path as necessary

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/posts/all");
      setPosts(res.data);
    } catch (err) {
      setPosts([]);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/posts/delete/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPosts();
    } catch (err) {
      setError("Failed to delete post.");
    }
  }; // ✅ Properly Closed

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="all-posts-container">
      <h2>All Posts</h2>
      {posts.length === 0 && <p>No posts found.</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          <p>{post.author_name}</p>
          
          <div className="post-actions">
            <button onClick={() => handleDelete(post.id)}>Delete</button>
            
            <button
              className="comment-toggle-btn"
              onClick={() =>
                setSelectedPostId(selectedPostId === post.id ? null : post.id)
              }
            >
              {selectedPostId === post.id ? "Hide Comments" : "Show Comments"}
            </button>
          </div>
          
          {selectedPostId === post.id && <CommentSection postId={post.id} />}
        </div>
      ))}
    </div>
  );
};

export default AllPosts;
