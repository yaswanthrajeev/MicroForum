import React, { useState } from "react";
import axios from "axios";
import "../styles/Search.css"; 

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      // ✅ IMPORTANT: Use the actual route, e.g., `/posts`
      const res = await axios.get("http://localhost:8000/posts/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const matchingPost = res.data.find((post) =>
        post.title.toLowerCase() === query.toLowerCase()
      );
      if (!matchingPost) {
        setError("Post not found.");
        setResults([]);
      } else {
        setResults([matchingPost]);
      }
    } catch (err) {
      setError("Failed to fetch search results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter post title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button
          type="submit"
          className="search-button"
        >
          Search
        </button>
      </form>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="results">
        {results.map((post) => (
          <div key={post.id} className="post-card">
            <h3 className="post-title">{post.title}</h3>
            <p className="post-body">{post.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
