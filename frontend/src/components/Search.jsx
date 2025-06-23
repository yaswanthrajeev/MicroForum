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
    <div className="p-4">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter post title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded p-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 ml-2"
        >
          Search
        </button>
      </form>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="mt-4 space-y-4">
        {results.map((post) => (
          <div key={post.id} className="border rounded p-3">
            <h3 className="text-xl font-bold">{post.title}</h3>
            <p>{post.body}</p>
           
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
