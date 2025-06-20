import React, { useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggleUsers = async () => {
    if (!showUsers) {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/admin/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        setError("Failed to fetch users.");
      }
      setLoading(false);
    }
    setShowUsers(!showUsers);
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <button onClick={handleToggleUsers}>
        {showUsers ? "Hide Users" : "Show Users"}
      </button>
      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {showUsers && (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.username} ({user.email})</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;
