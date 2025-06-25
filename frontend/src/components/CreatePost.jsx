import React, { useState } from "react";
import axios from "axios";
import "../styles/Form.css";

const CreatePost = ({ onPostCreated }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    
    setError("");
    setSuccess(false);
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/posts/create",
        { title: title.trim(), body: body.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTitle("");
      setBody("");
      setCharCount(0);
      if (onPostCreated) onPostCreated();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBodyChange = (e) => {
    const value = e.target.value;
    setBody(value);
    setCharCount(value.length);
  };

  const handleCancel = () => {
    setTitle("");
    setBody("");
    setCharCount(0);
    setError("");
    setSuccess(false);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">
          <span className="form-icon">📝</span>
          Create New Post
        </h2>
        <p className="form-subtitle">
          Share your thoughts and ideas with the community
        </p>
      </div>

      {error && (
        <div className="form-error">
          <span className="form-error-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="form-success">
          <span className="form-success-icon">✅</span>
          Post created successfully! Your post is now live.
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📌</span>
            Post Title
          </label>
          <div className="input-with-icon">
            <input
              type="text"
              className="form-input"
              placeholder="Enter a compelling title for your post..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
            <span className="input-icon">📝</span>
          </div>
          <div className="input-hint">
            {title.length}/100 characters
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📄</span>
            Post Content
          </label>
          <div className="textarea-container">
            <textarea
              className="form-input form-textarea"
              placeholder="Write your post content here... Share your thoughts, ask questions, or start a discussion!"
              value={body}
              onChange={handleBodyChange}
              required
              maxLength={2000}
              rows={8}
            />
            <div className="textarea-footer">
              <div className="char-counter">
                <span className={`char-count ${charCount > 1800 ? 'warning' : ''}`}>
                  {charCount}/2000
                </span>
              </div>
              <div className="formatting-tips">
                <span className="tip">💡 Tip: Be clear and engaging</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className={`form-submit ${loading ? 'loading' : ''}`}
            disabled={loading || !title.trim() || !body.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Post...
              </>
            ) : (
              <>
                <span>🚀</span>
                Publish Post
              </>
            )}
          </button>
          
          <button
            type="button"
            className="form-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            <span>✕</span>
            Cancel
          </button>
        </div>
      </form>

      <div className="form-links">
        <a href="/" className="form-link">
          <span>👁️</span>
          View All Posts
        </a>
        <span className="link-separator">•</span>
        <a href="/post" className="form-link">
          <span>🔍</span>
          Search Posts
        </a>
      </div>
    </div>
  );
};

export default CreatePost;
