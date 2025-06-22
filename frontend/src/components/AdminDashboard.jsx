import React, { useState } from "react";
import axios from "axios";
import "../styles/AdminDashboard.css"; // Assuming you have a CSS file for styling
import { Bar, Pie } from "react-chartjs-2";           
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"; 

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [showUsers, setShowUsers] = useState(false);
  const [showSentiment, setShowSentiment] = useState(false);
  const [sentiments, setSentiments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSentiments = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/admin/sentiment-summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSentiments(res.data);
    } catch (err) {
      setError("Failed to fetch sentiment data.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleUsers = async () => {
    if (!showUsers) {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError("Failed to fetch users.");
      }
      setLoading(false);
    }
    setShowUsers(!showUsers);
  };
  
  const handleToggleSentiment = async () => {
    if (!showSentiment) {
      await fetchSentiments();
    }
    setShowSentiment(!showSentiment);
  };
  
  const chartData = {
    labels: sentiments.map(s => s.title),
    datasets: [
      {
        label: "Positive",
        data: sentiments.map(s => s.sentiment_label_counts.Positive),
        backgroundColor: "#22c55e",
      },
      {
        label: "Negative",
        data: sentiments.map(s => s.sentiment_label_counts.Negative),
        backgroundColor: "#ef4444",
      },
      {
        label: "Neutral",
        data: sentiments.map(s => s.sentiment_label_counts.Neutral),
        backgroundColor: "#9ca3af",
      },
    ]
  };
  
  const totalCounts = sentiments.reduce((acc, s) => {
    acc.Positive += s.sentiment_label_counts.Positive;
    acc.Negative += s.sentiment_label_counts.Negative;
    acc.Neutral += s.sentiment_label_counts.Neutral;
    return acc;
  }, { Positive: 0, Negative: 0, Neutral: 0 });
  
  const pieData = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        data: [totalCounts.Positive, totalCounts.Negative, totalCounts.Neutral],
        backgroundColor: ["#22c55e", "#ef4444", "#9ca3af"],
      },
    ],
  };
  
  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>
      <div className="buttons">
        <button onClick={handleToggleUsers}>
          {showUsers ? "Hide Users" : "Show Users"}
        </button>
        <button onClick={handleToggleSentiment}>
          {showSentiment ? "Hide Sentiments" : "Show Sentiments"}
        </button>
      </div>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {showUsers && (
        <div className="user-list">
          <h3>Users</h3>
          <ul>
            {users.map(user => (
              <li key={user.id}>{user.username} ({user.email})</li>
            ))}
          </ul>
        </div>
      )}

      {showSentiment && sentiments.length > 0 && (
        <div className="sentiment">
          
          <div className="stats">
            <div className="stat">
              <h3>Positive</h3>
              <span>{totalCounts.Positive}</span>
            </div>
            <div className="stat">
              <h3>Negative</h3>
              <span>{totalCounts.Negative}</span>
            </div>
            <div className="stat">
              <h3>Neutral</h3>
              <span>{totalCounts.Neutral}</span>
            </div>
          </div>

          <div className="chart bar">
            <h3>Post Sentiment Summary</h3>
            <Bar data={chartData} />
          </div>

          <div className="chart pie">
            <h3>Total Sentiment Distribution</h3>
            <Pie data={pieData} />
          </div>
          
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
