"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/AdminDashboard.css"
import { Bar, Pie } from "react-chartjs-2"
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
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend)

const AdminDashboard = () => {
  const [showUsers, setShowUsers] = useState(false)
  const [showSentiment, setShowSentiment] = useState(false)
  const [sentiments, setSentiments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    avgSentiment: 0,
  })

  // Fetch initial stats
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const [usersRes, postsRes] = await Promise.all([
        axios.get("http://localhost:8000/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8000/posts/all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setStats({
        totalUsers: usersRes.data.length,
        totalPosts: postsRes.data.length,
        totalComments: postsRes.data.reduce((acc, post) => acc + (post.comments?.length || 0), 0),
        avgSentiment: 0.75, // Placeholder
      })
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    }
  }

  const fetchSentiments = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:8000/admin/sentiment-summary", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSentiments(res.data)
    } catch (err) {
      setError("Failed to fetch sentiment data.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUsers = async () => {
    if (!showUsers) {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("http://localhost:8000/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUsers(res.data)
      } catch (err) {
        setError("Failed to fetch users.")
      }
      setLoading(false)
    }
    setShowUsers(!showUsers)
  }
  const handlePromoteToAdmin = async (username) => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.patch(
        `http://localhost:8000/admin/promote/${username}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Refresh the users list after promotion
      const usersRes = await axios.get("http://localhost:8000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(usersRes.data)

      // Show success message (you can add a toast notification here)
      console.log(`User ${username} promoted to admin successfully`)
    } catch (err) {
      setError("Failed to promote user to admin.")
      console.error("Promotion error:", err)
    }
  }
  const handleToggleSentiment = async () => {
    if (!showSentiment) {
      await fetchSentiments()
    }
    setShowSentiment(!showSentiment)
  }

  const chartData = {
    labels: sentiments.map((s) => s.title?.substring(0, 20) + "..."),
    datasets: [
      {
        label: "Positive",
        data: sentiments.map((s) => s.sentiment_label_counts?.Positive || 0),
        backgroundColor: "#00C851",
        borderColor: "#00C851",
        borderWidth: 1,
      },
      {
        label: "Negative",
        data: sentiments.map((s) => s.sentiment_label_counts?.Negative || 0),
        backgroundColor: "#FF4444",
        borderColor: "#FF4444",
        borderWidth: 1,
      },
      {
        label: "Neutral",
        data: sentiments.map((s) => s.sentiment_label_counts?.Neutral || 0),
        backgroundColor: "#FF8800",
        borderColor: "#FF8800",
        borderWidth: 1,
      },
    ],
  }

  const totalCounts = sentiments.reduce(
    (acc, s) => {
      const counts = s.sentiment_label_counts || {}
      acc.Positive += counts.Positive || 0
      acc.Negative += counts.Negative || 0
      acc.Neutral += counts.Neutral || 0
      return acc
    },
    { Positive: 0, Negative: 0, Neutral: 0 },
  )

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
  }

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
  }

  return (
    <div className="dashboard space-y-6">
      <div className="dashboard-header flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <span className="header-icon">📊</span>
          Admin Dashboard
        </h2>
        <div className="dashboard-actions flex items-center gap-2">
          <button
            className="btn btn-primary h-10 rounded-md bg-primary px-4 text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={handleToggleUsers}
            type="button"
          >
            {showUsers ? "👥 Hide Users" : "👥 Show Users"}
          </button>
          <button
            className="btn btn-primary h-10 rounded-md bg-primary px-4 text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={handleToggleSentiment}
            type="button"
          >
            {showSentiment ? "📈 Hide Sentiments" : "📈 Show Sentiments"}
          </button>
        </div>
      </div>

      <div className="kpi-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="kpi-card rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
          <div className="kpi-header flex items-center justify-between">
            <span className="kpi-title text-sm text-muted-foreground">Total Users</span>
            <div className="kpi-icon primary">👥</div>
          </div>
          <div className="kpi-value text-3xl font-semibold text-foreground">{stats.totalUsers}</div>
          <div className="kpi-change positive text-green-700/90 flex items-center gap-1">
            <span>↗</span>
            <span>+12% this month</span>
          </div>
        </div>

        <div className="kpi-card rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
          <div className="kpi-header flex items-center justify-between">
            <span className="kpi-title text-sm text-muted-foreground">Total Posts</span>
            <div className="kpi-icon success">📝</div>
          </div>
          <div className="kpi-value text-3xl font-semibold text-foreground">{stats.totalPosts}</div>
          <div className="kpi-change positive text-green-700/90 flex items-center gap-1">
            <span>↗</span>
            <span>+8% this week</span>
          </div>
        </div>

        <div className="kpi-card rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
          <div className="kpi-header flex items-center justify-between">
            <span className="kpi-title text-sm text-muted-foreground">Total Comments</span>
            <div className="kpi-icon warning">💬</div>
          </div>
          <div className="kpi-value text-3xl font-semibold text-foreground">{stats.totalComments}</div>
          <div className="kpi-change positive text-green-700/90 flex items-center gap-1">
            <span>↗</span>
            <span>+15% today</span>
          </div>
        </div>

        <div className="kpi-card rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
          <div className="kpi-header flex items-center justify-between">
            <span className="kpi-title text-sm text-muted-foreground">Avg Sentiment</span>
            <div className="kpi-icon error">😊</div>
          </div>
          <div className="kpi-value text-3xl font-semibold text-foreground">
            {(stats.avgSentiment * 100).toFixed(1)}%
          </div>
          <div className="kpi-change positive text-green-700/90 flex items-center gap-1">
            <span>↗</span>
            <span>+5% this week</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-state rounded-md border border-border bg-muted/30 p-4 flex items-center gap-3">
          <div className="loading-spinner" />
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      )}

      {error && (
        <div className="error-message rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive flex items-center gap-2">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {showUsers && (
        <div className="user-management rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
          <div className="chart-header flex items-center justify-between">
            <h3 className="chart-title text-lg font-semibold text-foreground">👥 User Management</h3>
            <div className="chart-actions">
              <span className="user-count text-sm text-muted-foreground">{users.length} users</span>
            </div>
          </div>

          <div className="user-list grid gap-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="user-item flex items-center justify-between rounded-lg border border-border/60 bg-background p-3"
              >
                <div className="user-info flex items-center gap-3">
                  <div className="user-avatar h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <div className="user-name font-medium text-foreground">{user.username}</div>
                    <div className="user-email text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="user-actions flex items-center gap-2">
                  <div
                    className={`user-role ${user.role?.toLowerCase() || "user"} text-xs rounded px-2 py-1 border border-border/60`}
                  >
                    {user.role || "User"}
                  </div>
                  {user.role !== "admin" && (
                    <button
                      className="btn btn-small btn-primary h-9 rounded-md bg-primary px-3 text-primary-foreground hover:bg-primary/90 transition-colors"
                      onClick={() => handlePromoteToAdmin(user.username)}
                      type="button"
                    >
                      Promote to Admin
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSentiment && sentiments.length > 0 && (
        <div className="chart-section rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
          <div className="chart-header flex items-center justify-between">
            <h3 className="chart-title text-lg font-semibold text-foreground">📈 Sentiment Analysis</h3>
            <div className="chart-actions">
              <div className="chart-period-selector inline-flex rounded-md border border-border bg-background p-1">
                <button className="period-btn active h-8 rounded-md px-3 text-foreground hover:bg-muted/50 transition-colors">
                  7D
                </button>
                <button className="period-btn h-8 rounded-md px-3 text-foreground hover:bg-muted/50 transition-colors">
                  30D
                </button>
                <button className="period-btn h-8 rounded-md px-3 text-foreground hover:bg-muted/50 transition-colors">
                  90D
                </button>
              </div>
            </div>
          </div>

          <div className="sentiment-distribution grid grid-cols-3 gap-3">
            <div className="sentiment-item rounded-md border border-border/60 bg-background p-3">
              <div className="sentiment-label flex items-center gap-2">
                <div className="sentiment-color positive h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Positive</span>
              </div>
              <div className="sentiment-count text-foreground text-lg font-semibold">{totalCounts.Positive}</div>
            </div>
            <div className="sentiment-item rounded-md border border-border/60 bg-background p-3">
              <div className="sentiment-label flex items-center gap-2">
                <div className="sentiment-color neutral h-3 w-3 rounded-full bg-amber-500"></div>
                <span className="text-sm text-muted-foreground">Neutral</span>
              </div>
              <div className="sentiment-count text-foreground text-lg font-semibold">{totalCounts.Neutral}</div>
            </div>
            <div className="sentiment-item rounded-md border border-border/60 bg-background p-3">
              <div className="sentiment-label flex items-center gap-2">
                <div className="sentiment-color negative h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-muted-foreground">Negative</span>
              </div>
              <div className="sentiment-count text-foreground text-lg font-semibold">{totalCounts.Negative}</div>
            </div>
          </div>

          <div className="charts-grid grid gap-4 lg:grid-cols-2">
            <div className="chart-container rounded-lg border border-border bg-background p-3">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Post Sentiment Summary</h4>
              <div className="sentiment-chart h-[320px]">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="chart-container rounded-lg border border-border bg-background p-3">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Sentiment Distribution</h4>
              <div className="sentiment-chart h-[320px]">
                <Pie data={pieData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="alerts-panel rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="alerts-header flex items-center justify-between">
          <h3 className="alerts-title text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="alert-icon">🚨</span>
            Sentiment Alerts
          </h3>
          <span className="alerts-badge inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground">
            3
          </span>
        </div>

        <div className="alert-item flex gap-3 rounded-md border border-border/60 bg-background p-3">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <div className="alert-title font-medium text-foreground">Negative sentiment spike detected</div>
            <div className="alert-description text-sm text-muted-foreground">
              Post "Technical Issues Discussion" shows 40% negative sentiment increase
            </div>
            <div className="alert-meta text-xs text-muted-foreground flex items-center justify-between mt-1">
              <span>2 hours ago</span>
              <div className="alert-score">
                <span>Score: -0.8</span>
              </div>
            </div>
          </div>
        </div>

        <div className="alert-item flex gap-3 rounded-md border border-border/60 bg-background p-3">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <div className="alert-title font-medium text-foreground">User engagement drop</div>
            <div className="alert-description text-sm text-muted-foreground">
              Comments per post decreased by 25% in the last 24 hours
            </div>
            <div className="alert-meta text-xs text-muted-foreground flex items-center justify-between mt-1">
              <span>5 hours ago</span>
              <div className="alert-score">
                <span>Drop: -25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
