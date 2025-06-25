import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../styles/CommentSection.css";

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  // Memoize fetchComments to avoid unnecessary re-creations
  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:8000/comment/getAllComments/${postId}/comments`);
      setComments(res.data);
    } catch (err) {
      setComments([]);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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
      await fetchComments(); // Fetch comments again after posting
    } catch (err) {
      setError("Failed to add comment.");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/comment/delete/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchComments(); // Refresh comments after deletion
    } catch (err) {
      setError("Failed to delete comment.");
    }
  };

  return (
    <div className="comment-section">
      <h4 className="mb-4 text-lg font-semibold">Comments</h4>
      {comments.length === 0 && <p className="text-muted">No comments yet.</p>}
      {comments.map(comment => (
        <div key={comment.id} className="comment-item">
          <div className="avatar">
            {comment.author_name ? comment.author_name[0].toUpperCase() : "?"}
          </div>
          <div className="comment-content">
            <div className="comment-header">
              <span className="author-name">{comment.author_name}</span>
              <button className="delete-btn" onClick={() => handleDelete(comment.id)} title="Delete comment">🗑️</button>
            </div>
            <p className="comment-body">{comment.body}</p>
          </div>
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
        <button type="submit" className="btn btn-primary">Comment</button>
      </form>
      {error && <p className="text-error">{error}</p>}
    </div>
  );
};

export default CommentSection;
