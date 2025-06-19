import React, { useEffect, useState } from "react";
import axios from "axios";

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/comment/getAllComments/${postId}/comments`);
      setComments(res.data);
    } catch (err) {
      setComments([]);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8000/comment/create?post_id=${postId}`,
        { body },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBody("");
      fetchComments();
    } catch (err) {
      setError("Failed to add comment.");
    }
  };

  return (
    <div className="comment-section">
      <h4>Comments</h4>
      {comments.map(comment => (
        <div key={comment.id} className="comment-item">
          <p>{comment.body}</p>
        </div>
      ))}
      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          placeholder="Add a comment"
          value={body}
          onChange={e => setBody(e.target.value)}
          required
        />
        <button type="submit">Comment</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CommentSection;
