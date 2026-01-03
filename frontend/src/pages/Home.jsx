import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Home.css'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="home">
      <section className="hero">
        <h1>Competitive Programming Analytics Platform</h1>
        <p className="hero-subtitle">
          Analyze your submissions to identify weak DSA topics and get personalized recommendations
        </p>
        {user ? (
          <div className="hero-actions">
            <Link to="/upload" className="btn btn-primary">Upload Submissions</Link>
            <Link to="/analytics" className="btn btn-secondary">View Analytics</Link>
            <Link to="/leetcode" className="btn btn-secondary">LeetCode Analytics</Link>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary">Get Started</Link>
        )}
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>📊 Difficulty Breakdown</h3>
          <p>Analyze your performance across Easy, Medium, and Hard problems</p>
        </div>
        <div className="feature-card">
          <h3>🎯 Weak Topic Detection</h3>
          <p>Identify topics where you need more practice using frequency analysis</p>
        </div>
        <div className="feature-card">
          <h3>💡 Smart Recommendations</h3>
          <p>Get prioritized practice recommendations using greedy algorithms</p>
        </div>
      </section>
    </div>
  )
}

export default Home

