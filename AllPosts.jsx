import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentSection from "./CommentSection";
import ".././styles/AllPosts.css"; // Adjust the path as necessary

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/posts/all");
      setPosts(res.data);
    } catch (err) {
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="all-posts-container">
      <h2>All Posts</h2>
      {posts.length === 0 && <p>No posts found.</p>}
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          <p>{post.author_name}</p>
          <button className="comment-toggle-btn" onClick={() => setSelectedPostId(selectedPostId === post.id ? null : post.id)}>
            {selectedPostId === post.id ? "Hide Comments" : "Show Comments"}
          </button>
          {selectedPostId === post.id && <CommentSection postId={post.id} />}
        </div>
      ))}
    </div>
  );
};

export default AllPosts;
