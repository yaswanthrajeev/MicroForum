import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminDashboard.css";
import { Bar, Pie, Line } from "react-chartjs-2";           
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"; 

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend
);

const AdminDashboard = () => {
  const [showUsers, setShowUsers] = useState(false);
  const [showSentiment, setShowSentiment] = useState(false);
  const [sentiments, setSentiments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    avgSentiment: 0
  });

  // Fetch initial stats
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const [usersRes, postsRes] = await Promise.all([
        axios.get("http://localhost:8000/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8000/posts/all", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      
      setStats({
        totalUsers: usersRes.data.length,
        totalPosts: postsRes.data.length,
        totalComments: postsRes.data.reduce((acc, post) => acc + (post.comments?.length || 0), 0),
        avgSentiment: 0.75 // Placeholder
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

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
    labels: sentiments.map(s => s.title?.substring(0, 20) + "..."),
    datasets: [
      {
        label: "Positive",
        data: sentiments.map(s => s.sentiment_label_counts?.Positive || 0),
        backgroundColor: "#00C851",
        borderColor: "#00C851",
        borderWidth: 1,
      },
      {
        label: "Negative",
        data: sentiments.map(s => s.sentiment_label_counts?.Negative || 0),
        backgroundColor: "#FF4444",
        borderColor: "#FF4444",
        borderWidth: 1,
      },
      {
        label: "Neutral",
        data: sentiments.map(s => s.sentiment_label_counts?.Neutral || 0),
        backgroundColor: "#FF8800",
        borderColor: "#FF8800",
        borderWidth: 1,
      },
    ]
  };
  
  const totalCounts = sentiments.reduce((acc, s) => {
    const counts = s.sentiment_label_counts || {};
    acc.Positive += counts.Positive || 0;
    acc.Negative += counts.Negative || 0;
    acc.Neutral += counts.Neutral || 0;
    return acc;
  }, { Positive: 0, Negative: 0, Neutral: 0 });
  
  const pieData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [totalCounts.Positive, totalCounts.Neutral, totalCounts.Negative],
        backgroundColor: ["#00C851", "#FF8800", "#FF4444"],
        borderColor: ["#00C851", "#FF8800", "#FF4444"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#E0E0E0",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Sentiment Analysis",
        color: "#E0E0E0",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#B0B0B0",
        },
        grid: {
          color: "#333333",
        },
      },
      y: {
        ticks: {
          color: "#B0B0B0",
        },
        grid: {
          color: "#333333",
        },
      },
    },
  };
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>
          <span className="header-icon">📊</span>
          Admin Dashboard
        </h2>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={handleToggleUsers}>
            {showUsers ? "👥 Hide Users" : "👥 Show Users"}
          </button>
          <button className="btn btn-primary" onClick={handleToggleSentiment}>
            {showSentiment ? "📈 Hide Sentiments" : "📈 Show Sentiments"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Users</span>
            <div className="kpi-icon primary">👥</div>
          </div>
          <div className="kpi-value">{stats.totalUsers}</div>
          <div className="kpi-change positive">
            <span>↗</span>
            <span>+12% this month</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Posts</span>
            <div className="kpi-icon success">📝</div>
          </div>
          <div className="kpi-value">{stats.totalPosts}</div>
          <div className="kpi-change positive">
            <span>↗</span>
            <span>+8% this week</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Comments</span>
            <div className="kpi-icon warning">💬</div>
          </div>
          <div className="kpi-value">{stats.totalComments}</div>
          <div className="kpi-change positive">
            <span>↗</span>
            <span>+15% today</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Avg Sentiment</span>
            <div className="kpi-icon error">😊</div>
          </div>
          <div className="kpi-value">{(stats.avgSentiment * 100).toFixed(1)}%</div>
          <div className="kpi-change positive">
            <span>↗</span>
            <span>+5% this week</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Users Section */}
      {showUsers && (
        <div className="user-management">
          <div className="chart-header">
            <h3 className="chart-title">👥 User Management</h3>
            <div className="chart-actions">
              <span className="user-count">{users.length} users</span>
            </div>
          </div>
          
          <div className="user-list">
            {users.map(user => (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
                <div className={`user-role ${user.role?.toLowerCase() || 'user'}`}>
                  {user.role || 'User'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sentiment Analysis Section */}
      {showSentiment && sentiments.length > 0 && (
        <div className="chart-section">
          <div className="chart-header">
            <h3 className="chart-title">📈 Sentiment Analysis</h3>
            <div className="chart-actions">
              <div className="chart-period-selector">
                <button className="period-btn active">7D</button>
                <button className="period-btn">30D</button>
                <button className="period-btn">90D</button>
              </div>
            </div>
          </div>

          {/* Sentiment Distribution */}
          <div className="sentiment-distribution">
            <div className="sentiment-item">
              <div className="sentiment-label">
                <div className="sentiment-color positive"></div>
                <span>Positive</span>
              </div>
              <div className="sentiment-count">{totalCounts.Positive}</div>
            </div>
            <div className="sentiment-item">
              <div className="sentiment-label">
                <div className="sentiment-color neutral"></div>
                <span>Neutral</span>
              </div>
              <div className="sentiment-count">{totalCounts.Neutral}</div>
            </div>
            <div className="sentiment-item">
              <div className="sentiment-label">
                <div className="sentiment-color negative"></div>
                <span>Negative</span>
              </div>
              <div className="sentiment-count">{totalCounts.Negative}</div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="chart-container">
              <h4>Post Sentiment Summary</h4>
              <div className="sentiment-chart">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
            
            <div className="chart-container">
              <h4>Sentiment Distribution</h4>
              <div className="sentiment-chart">
                <Pie data={pieData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Panel */}
      <div className="alerts-panel">
        <div className="alerts-header">
          <h3 className="alerts-title">
            <span className="alert-icon">🚨</span>
            Sentiment Alerts
          </h3>
          <span className="alerts-badge">3</span>
        </div>
        
        <div className="alert-item">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <div className="alert-title">Negative sentiment spike detected</div>
            <div className="alert-description">Post "Technical Issues Discussion" shows 40% negative sentiment increase</div>
            <div className="alert-meta">
              <span>2 hours ago</span>
              <div className="alert-score">
                <span>Score: -0.8</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="alert-item">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <div className="alert-title">User engagement drop</div>
            <div className="alert-description">Comments per post decreased by 25% in the last 24 hours</div>
            <div className="alert-meta">
              <span>5 hours ago</span>
              <div className="alert-score">
                <span>Drop: -25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
