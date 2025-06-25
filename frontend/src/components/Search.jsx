import React, { useState } from "react";
import axios from "axios";
import "../styles/Search.css"; 

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError("");
    setHasSearched(true);
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/posts/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const matchingPosts = res.data.filter((post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.body.toLowerCase().includes(query.toLowerCase())
      );
      
      if (matchingPosts.length === 0) {
        setError("No posts found matching your search.");
        setResults([]);
      } else {
        setResults(matchingPosts);
        setError("");
      }
    } catch (err) {
      setError("Failed to fetch search results.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setError("");
    setHasSearched(false);
  };

  const handleViewPost = (post) => {
    setSelectedPost(post);
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h2>
          <span className="search-icon">🔍</span>
          Search Posts
        </h2>
        <p className="search-subtitle">Find posts by title or content</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <div className="input-with-icon">
            <input
              type="text"
              placeholder="Search for posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <span className="input-icon">🔍</span>
          </div>
          <div className="search-actions">
            <button
              type="submit"
              className="btn btn-primary search-button"
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Searching...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Search
                </>
              )}
            </button>
            {hasSearched && (
              <button
                type="button"
                onClick={clearSearch}
                className="btn btn-secondary clear-button"
              >
                <span>✕</span>
                Clear
              </button>
            )}
          </div>
        </div>
      </form>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Searching posts...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {hasSearched && !loading && !error && (
        <div className="search-results">
          <div className="results-header">
            <h3>Search Results</h3>
            <span className="results-count">
              {results.length} {results.length === 1 ? 'post' : 'posts'} found
            </span>
          </div>
          
          {results.length > 0 ? (
            <div className="results-grid">
              {results.map((post) => (
                <div key={post.id} className="search-result-card">
                  <div className="result-header">
                    <h4 className="result-title">{post.title}</h4>
                    <div className="result-meta">
                      <span className="result-author">
                        <span className="author-avatar">
                          {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                        {post.author?.username || 'Unknown'}
                      </span>
                      <span className="result-date">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="result-content">
                    <p className="result-snippet">
                      {post.body.length > 150 
                        ? `${post.body.substring(0, 150)}...` 
                        : post.body
                      }
                    </p>
                  </div>
                  
                  <div className="result-footer">
                    <div className="result-stats">
                      <span className="stat">
                        <span className="stat-icon">💬</span>
                        {post.comments?.length || 0} comments
                      </span>
                      {post.sentiment_label && (
                        <span className={`sentiment-badge ${post.sentiment_label.toLowerCase()}`}>
                          <span className="sentiment-emoji">
                            {post.sentiment_label === 'Positive' ? '😊' : 
                             post.sentiment_label === 'Negative' ? '😞' : '😐'}
                          </span>
                          {post.sentiment_label}
                        </span>
                      )}
                    </div>
                    
                    <button className="btn btn-ghost view-button" onClick={() => handleViewPost(post)}>
                      <span>👁️</span>
                      View Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No posts found</h3>
              <p>Try adjusting your search terms or browse all posts</p>
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="search-suggestions">
          <h3>💡 Search Tips</h3>
          <div className="suggestions-grid">
            <div className="suggestion-card">
              <div className="suggestion-icon">📝</div>
              <h4>Search by Title</h4>
              <p>Enter keywords from the post title</p>
            </div>
            <div className="suggestion-card">
              <div className="suggestion-icon">📄</div>
              <h4>Search by Content</h4>
              <p>Find posts containing specific words</p>
            </div>
            <div className="suggestion-card">
              <div className="suggestion-icon">👤</div>
              <h4>Search by Author</h4>
              <p>Look for posts by specific users</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal for viewing full post */}
      {selectedPost && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} title="Close">✕</button>
            <h2 className="modal-title">{selectedPost.title}</h2>
            <div className="modal-meta">
              <span className="author-avatar">
                {selectedPost.author?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
              <span className="modal-author">{selectedPost.author?.username || 'Unknown'}</span>
              <span className="modal-date">{new Date(selectedPost.created_at).toLocaleString()}</span>
            </div>
            <div className="modal-body">
              <p>{selectedPost.body}</p>
            </div>
            {selectedPost.comments && selectedPost.comments.length > 0 && (
              <div className="modal-comments">
                <h4>Comments</h4>
                <ul>
                  {selectedPost.comments.map(comment => (
                    <li key={comment.id}>
                      <span className="author-avatar">
                        {comment.author_name ? comment.author_name[0].toUpperCase() : '?'}
                      </span>
                      <span className="modal-comment-author">{comment.author_name}</span>: {comment.body}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
